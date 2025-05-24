<?php

namespace App\Http\Controllers;

use App\Models\SavedDesign;
use App\Models\ShoppingCartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ShoppingCartController extends Controller
{

    // POST /shopping-cart/add
    public function addItem(Request $request)
    {
        try {
            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.',
                ], 404);
            }

            $validatedData  = $request->validate([
                'saved_design_id' => 'required|exists:saved_designs,id',
                'quantity' => 'required|integer|min:1',
            ]);

            // Ensure saved design belongs to this customer
            $savedDesign = SavedDesign::where('id', $validatedData['saved_design_id'])
                ->where('customer_id', $customer->id)
                ->first();

            if (!$savedDesign) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Saved design not found or does not belong to the customer.',
                ], 403);
            }

            DB::beginTransaction();

            $cartItem = ShoppingCartItem::create([
                'customer_id' => $customer->id,
                'saved_design_id' => $validatedData['saved_design_id'],
                'quantity' => $validatedData['quantity'],
            ]);

            $savedDesign->status = 'Carted';
            $savedDesign->save();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Item added to shopping cart successfully.',
                'data' => $cartItem,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'details' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while adding item to the cart.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }


    // GET /shopping-cart/customer/{customer_id}
    public function getCustomerCart()
    {
        try {
            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.',
                ], 404);
            }

            $cartItems = ShoppingCartItem::with([
                'savedDesign.productVariation.product',
                'savedDesign.attributes',
                'savedDesign.images',
            ])
                ->where('customer_id', $customer->id)
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'No items in the shopping cart.',
                    'data' => [],
                ], 200);
            }

            $cartData = $cartItems->map(function ($item) {
                return [
                    'cart_item_id' => $item->id,
                    'quantity' => $item->quantity,
                    'added_at' => $item->created_at,
                    'saved_design' => [
                        'id' => $item->savedDesign->id,
                        'thumbnail' => $item->savedDesign->thumbnail,
                        'status' => $item->savedDesign->status,
                        'created_at' => $item->savedDesign->created_at,
                        'product_variation' => [
                            'id' => $item->savedDesign->productVariation->id,
                            'label' => $item->savedDesign->productVariation->label,
                            'product' => [
                                'id' => $item->savedDesign->productVariation->product->id,
                                'name' => $item->savedDesign->productVariation->product->name,
                                'category' => $item->savedDesign->productVariation->product->category,
                            ],
                        ],
                        'attributes' => $item->savedDesign->attributes->map(function ($attribute) {
                            return [
                                'attribute_name' => $attribute->attribute_name,
                                'attribute_value' => $attribute->attribute_value,
                            ];
                        }),
                        'images' => $item->savedDesign->images->map(function ($image) {
                            return [
                                'image_url' => $image->image_url,
                                'position' => $image->position,
                            ];
                        }),
                    ],
                ];
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Customer cart retrieved successfully.',
                'data' => $cartData,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while retrieving the customer cart.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    // PUT /shopping-cart/update/{id}
    public function updateItem(Request $request, $id)
    {
        try {
            $validatedData = $request->validate([
                'quantity' => 'required|integer|min:1',
            ]);

            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.',
                ], 404);
            }

            $cartItem = ShoppingCartItem::where('id', $id)
                ->where('customer_id', $customer->id)
                ->first();

            if (!$cartItem) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cart item not found or does not belong to the customer.',
                ], 404);
            }

            $cartItem->update(['quantity' => $validatedData['quantity']]);

            return response()->json([
                'status' => 'success',
                'message' => 'Cart item updated successfully.',
                'data' => $cartItem,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'details' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while updating the cart item.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }


    // DELETE /shopping-cart/delete/{id}
    public function deleteItem($id)
    {
        try {
            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.',
                ], 404);
            }

            $cartItem = ShoppingCartItem::where('id', $id)
                ->where('customer_id', $customer->id)
                ->first();

            if (!$cartItem) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cart item not found or does not belong to the customer.',
                ], 404);
            }

            $cartItem->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Cart item deleted successfully.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while deleting the cart item.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
