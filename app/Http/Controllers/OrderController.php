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
}
