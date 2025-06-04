<?php

namespace App\Services;

use App\Models\Order;
use App\Models\SavedDesign;
use App\Models\ShippingType;
use Illuminate\Support\Facades\DB;
use App\Services\AttributePriceResolver;
use Exception;


class OrderService
{
    protected AttributePriceResolver $priceResolver;

    public function __construct(AttributePriceResolver $priceResolver)
    {
        $this->priceResolver = $priceResolver;
    }

    // public function createFromSavedDesigns(array $data): Order
    // {
    //     return DB::transaction(function () use ($data) {    
    //         // Create order
    //         $order = Order::create([
    //             'customer_id' => $data['customer_id'],
    //             'shipping_type_id' => $data['shipping_type_id'],
    //             'order_status' => 'pending',
    //             'payment_status' => 'pending',
    //             'is_same_billing_shipping' => $data['is_same_billing_shipping'],
    //             'total_amount' => 0,
    //         ]);

    //         // Create shipping address
    //         $order->shippingAddress()->create($data['shipping_address']);

    //         // Create billing address if applicable
    //         if (!$data['is_same_billing_shipping']) {
    //             $order->billingAddress()->create($data['billing_address']);
    //         }

    //         $totalAmount = 0;

    //         // Loop through items
    //         foreach ($data['items'] as $item) {
    //             $savedDesign = SavedDesign::with(['productVariation', 'attributes', 'images'])->findOrFail($item['saved_design_id']);

    //             $variation = $savedDesign->productVariation;
    //             $quantity = (int) $item['quantity'];
    //             $basePrice = $variation->price ?? 0;
    //             $attributeTotal = 0;

    //             foreach ($savedDesign->attributes as $attr) {
    //                 $attributeTotal += $this->priceResolver->resolve(
    //                     $attr->attribute_name,
    //                     $attr->attribute_value,
    //                     $variation
    //                 );
    //             }

    //             $unitPrice = $basePrice + $attributeTotal;
    //             $itemTotal = $unitPrice * $quantity;
    //             $totalAmount += $itemTotal;

    //             // Create order item
    //             $orderItem = $order->orderItems()->create([
    //                 'product_variation_id' => $variation->id,
    //                 'quantity' => $quantity,
    //                 'unit_price' => $unitPrice,
    //                 'total_price' => $itemTotal,
    //                 'thumbnail' => $savedDesign->thumbnail,
    //             ]);

    //             // Copy attributes
    //             foreach ($savedDesign->attributes as $attr) {
    //                 $orderItem->attributes()->create([
    //                     'attribute_name' => $attr->attribute_name,
    //                     'attribute_value' => $attr->attribute_value,
    //                 ]);
    //             }

    //             // Copy images
    //             foreach ($savedDesign->images as $img) {
    //                 $orderItem->images()->create([
    //                     'image_url' => $img->image_url,
    //                     'position' => $img->position,
    //                 ]);
    //             }

    //             // Mark saved design as finalized
    //             $savedDesign->update(['status' => 'Finalized']);
    //         }

    //         // Add shipping price
    //         $shippingType = ShippingType::findOrFail($data['shipping_type_id']);
    //         $totalAmount += $shippingType->price;

    //         $order->update(['total_amount' => $totalAmount]);

    //         return $order;
    //     });
    // }


    public function createFromSavedDesigns(array $data): Order
    {
        // Step 1: Calculate total
        $calculatedTotal = $this->calculateTotalFromSavedDesigns($data);

        $expectedTotal = round($data['total_amount'], 2);
        $calculatedTotal = round($calculatedTotal, 2);

        if ($expectedTotal !== $calculatedTotal) {
            throw new Exception("Total amount mismatch. Sent: {$expectedTotal}, Calculated: {$calculatedTotal}");
        }

        // Step 2: Create order inside DB transaction
        return DB::transaction(function () use ($data, $calculatedTotal) {
            $order = Order::create([
                'customer_id' => $data['customer_id'],
                'shipping_type_id' => $data['shipping_type_id'],
                'order_status' => 'pending',
                'payment_status' => 'pending',
                'is_same_billing_shipping' => $data['is_same_billing_shipping'],
                'total_amount' => 0, // placeholder
            ]);

            // Create shipping address
            $order->shippingAddress()->create($data['shipping_address']);

            // Create billing address if applicable
            if (!$data['is_same_billing_shipping']) {
                $order->billingAddress()->create($data['billing_address']);
            }

            // Create order items from saved designs
            foreach ($data['items'] as $item) {
                $savedDesign = SavedDesign::with(['productVariation', 'attributes', 'images'])->findOrFail($item['saved_design_id']);

                $variation = $savedDesign->productVariation;
                $quantity = (int) $item['quantity'];
                $basePrice = $variation->price ?? 0;
                $attributeTotal = 0;

                foreach ($savedDesign->attributes as $attr) {
                    $attributeTotal += $this->priceResolver->resolve(
                        $attr->attribute_name,
                        $attr->attribute_value,
                        $variation
                    );
                }

                $unitPrice = $basePrice + $attributeTotal;
                $itemTotal = $unitPrice * $quantity;

                $orderItem = $order->orderItems()->create([
                    'product_variation_id' => $variation->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $itemTotal,
                    'thumbnail' => $savedDesign->thumbnail,
                ]);

                // Copy attributes
                foreach ($savedDesign->attributes as $attr) {
                    $orderItem->attributes()->create([
                        'attribute_name' => $attr->attribute_name,
                        'attribute_value' => $attr->attribute_value,
                    ]);
                }

                // Copy images
                foreach ($savedDesign->images as $img) {
                    $orderItem->images()->create([
                        'image_url' => $img->image_url,
                        'position' => $img->position,
                    ]);
                }

                // Finalize saved design
                $savedDesign->update(['status' => 'Finalized']);
            }

            // Final update for order total
            $order->update(['total_amount' => $calculatedTotal]);

            return $order;
        });
    }

    /**
     * Calculates total price from saved designs.
     *
     * @param array $data
     * @return float
     */
    public function calculateTotalFromSavedDesigns(array $data): float
    {
        $total = 0;

        foreach ($data['items'] as $item) {
            $savedDesign = SavedDesign::with(['productVariation', 'attributes'])->findOrFail($item['saved_design_id']);

            $variation = $savedDesign->productVariation;
            $quantity = (int) $item['quantity'];
            $basePrice = $variation->price ?? 0;
            $attributeTotal = 0;

            foreach ($savedDesign->attributes as $attr) {
                $attributeTotal += $this->priceResolver->resolve(
                    $attr->attribute_name,
                    $attr->attribute_value,
                    $variation
                );
            }

            $unitPrice = $basePrice + $attributeTotal;
            $itemTotal = $unitPrice * $quantity;
            $total += $itemTotal;
        }

        // Add shipping cost
        $shippingType = ShippingType::findOrFail($data['shipping_type_id']);
        $total += $shippingType->price;

        return $total;
    }
}
