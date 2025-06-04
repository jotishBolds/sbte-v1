<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Filament\Resources\OrderResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

use Filament\Forms;
// use Filament\Resources\Pages\CreateRecord;
use App\Models\{Order, Customer, SavedDesign, ShippingType};
use Filament\Forms\Components\{Select, TextInput, Toggle, Repeater, Group, Grid};
use Illuminate\Support\Facades\DB;

class CreateOrder extends CreateRecord
{
    protected static string $resource = OrderResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // dd($data);
        return $data; // handled manually
    }

    protected function handleRecordCreation(array $data): Order
    {
        dd($data);
        return DB::transaction(function () use ($data) {
            // Extract address data
            $shippingAddressData = $data['shipping_address'];
            $isSameBillingShipping = $data['is_same_billing_shipping'];

            // Create order
            $order = Order::create([
                'customer_id'              => $data['customer_id'],
                'shipping_type_id'         => $data['shipping_type_id'],
                'order_status'             => $data['order_status'],
                'payment_status'           => $data['payment_status'],
                'is_same_billing_shipping' => $isSameBillingShipping,
                'total_amount'             => 0, // will update later
            ]);

            // Create shipping address
            $order->shippingAddress()->create($shippingAddressData);

            // Create billing address if different
            if (!$isSameBillingShipping) {
                $order->billingAddress()->create($data['billing_address']);
            }

            $totalAmount = 0;

            foreach ($data['items'] as $item) {
                $savedDesign = SavedDesign::with(['productVariation', 'attributes', 'images'])->findOrFail($item['saved_design_id']);

                $variation = $savedDesign->productVariation;
                $quantity = (int) $item['quantity'];
                $basePrice = $variation->price ?? 0;
                $attributeTotal = 0;

                // Resolve price of each attribute
                foreach ($savedDesign->attributes as $attr) {
                    $price = app(\App\Services\AttributePriceResolver::class)
                        ->resolve($attr->attribute_name, $attr->attribute_value, $variation);
                    $attributeTotal += $price;
                }

                $unitPrice = $basePrice + $attributeTotal;
                $itemTotal = $unitPrice * $quantity;
                $totalAmount += $itemTotal;

                // Create order item
                $orderItem = $order->orderItems()->create([
                    'product_variation_id' => $variation->id,
                    'quantity'             => $quantity,
                    'unit_price'           => $unitPrice,
                    'total_price'          => $itemTotal,
                    'thumbnail'            => $savedDesign->thumbnail,
                ]);

                // Copy attributes
                foreach ($savedDesign->attributes as $attr) {
                    $orderItem->attributes()->create([
                        'attribute_name'  => $attr->attribute_name,
                        'attribute_value' => $attr->attribute_value,
                    ]);
                }

                // Copy images
                foreach ($savedDesign->images as $img) {
                    $orderItem->images()->create([
                        'image_url' => $img->image_url,
                        'position'  => $img->position,
                    ]);
                }

                // Update saved design status
                $savedDesign->update(['status' => 'Finalized']);
            }

            // Add shipping cost
            $shippingType = ShippingType::findOrFail($data['shipping_type_id']);
            $totalAmount += $shippingType->price;

            $order->update(['total_amount' => $totalAmount]);

            return $order;
        });
    }





    // protected function handleRecordCreation(array $data): Order
    // {
    //     return DB::transaction(function () use ($data) {
    //         $order = Order::create([
    //             'customer_id' => $data['customer_id'],
    //             'shipping_type_id' => $data['shipping_type_id'],
    //             'is_same_billing_shipping' => $data['is_same_billing_shipping'],
    //             'total_amount' => 0, // Will update later
    //         ]);

    //         $totalAmount = 0;

    //         foreach ($data['items'] as $item) {
    //             $design = SavedDesign::with(['productVariation', 'attributes', 'images'])->findOrFail($item['design_id']);
    //             $unitPrice = $design->productVariation->price;
    //             $quantity = $item['quantity'];
    //             $itemTotal = $unitPrice * $quantity;
    //             $totalAmount += $itemTotal;

    //             $orderItem = $order->orderItems()->create([
    //                 'product_variation_id' => $design->product_variation_id,
    //                 'quantity' => $quantity,
    //                 'unit_price' => $unitPrice,
    //                 'total_price' => $itemTotal,
    //                 'thumbnail' => $design->thumbnail,
    //             ]);

    //             foreach ($design->attributes as $attr) {
    //                 $orderItem->attributes()->create([
    //                     'attribute_name' => $attr->attribute_name,
    //                     'attribute_value' => $attr->attribute_value,
    //                 ]);
    //             }

    //             foreach ($design->images as $img) {
    //                 $orderItem->images()->create([
    //                     'image_url' => $img->image_url,
    //                     'position' => $img->position,
    //                 ]);
    //             }
    //         }

    //         $order->update(['total_amount' => $totalAmount]);

    //         $order->shippingAddress()->create($data['shipping_address']);

    //         if (!$data['is_same_billing_shipping']) {
    //             $order->billingAddress()->create($data['billing_address']);
    //         }

    //         return $order;
    //     });
    // }
}
