<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\OrderService;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function placeOrder(Request $request)
    {
        // dd($request->all());
        try {
            $validated = $request->validate([
                'shipping_type_id' => 'required|exists:shipping_types,id',
                'is_same_billing_shipping' => 'required|boolean',
                'shipping_address' => 'required|array',
                'billing_address' => 'nullable|array',
                'items' => 'required|array|min:1',
                'items.*.saved_design_id' => 'required|exists:saved_designs,id',
                'items.*.quantity' => 'required|integer|min:1',
                'total_amount' => 'required|numeric|min:0',
            ]);

            $customerId = Auth::user()->customer->id; // Assuming the user is authenticated and has a customer relation
            if (!$customerId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Customer not found.',
                ], 404);
            }
            $validated['customer_id'] = $customerId;
            $order = $this->orderService->createFromSavedDesigns($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Order placed successfully!',
                'order_id' => $order->id,
            ]);
        } catch (Exception $e) {
            Log::error('Order placement failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while placing the order.',
                'details' => $e->getMessage(), // You can omit this in production
            ], 500);
        }
    }

    public function getCustomerOrders(Request $request)
    {
        try {
            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.',
                ], 404);
            }

            $orders = $customer->orders()
                ->with(['orderItems.productVariation.product', 'shippingType'])
                ->orderBy('created_at', 'desc')
                ->get();

            $ordersData = $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'total_amount' => $order->total_amount,
                    'order_status' => $order->order_status,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                    'shipping_type' => $order->shippingType ? [
                        'id' => $order->shippingType->id,
                        'name' => $order->shippingType->name,
                        'price' => $order->shippingType->price,
                    ] : null,
                    'orderItems' => $order->orderItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'quantity' => $item->quantity,
                            'unit_price' => $item->unit_price,
                            'total_price' => $item->total_price,
                            'thumbnail' => $item->thumbnail ? asset('storage/' . $item->thumbnail) : null,
                            'product_variation' => [
                                'id' => $item->productVariation->id,
                                'label' => $item->productVariation->label,
                                'product' => [
                                    'id' => $item->productVariation->product->id,
                                    'name' => $item->productVariation->product->name,
                                    'category' => $item->productVariation->product->category,
                                ],
                            ],
                        ];
                    }),
                ];
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Customer orders retrieved successfully.',
                'data' => $ordersData,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while retrieving orders.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
