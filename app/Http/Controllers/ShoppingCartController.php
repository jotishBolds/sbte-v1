<?php

namespace App\Http\Controllers;

use App\Models\SavedDesign;
use App\Models\ShoppingCartItem;
use App\Models\ImageEffect;
use App\Models\EdgeDesign;
use App\Models\HangingMechanismVariety;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ShoppingCartController extends Controller
{
    // GET /shopping-cart/check-auth
    public function checkAuth()
    {
        if (Auth::check()) {
            $user = Auth::user();
            $customer = $user->customer;
            
            if (!$customer) {
                // Create customer record for the authenticated user if it doesn't exist
                $customer = \App\Models\Customer::create([
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'status' => 'Active'
                ]);
                
                // Associate the customer with the user
                $user->customer()->associate($customer);
                $user->save();
            }
            
            return response()->json([
                'status' => 'success',
                'authenticated' => true,
                'user' => $user,
                'customer' => $customer
            ]);
        }
        
        return response()->json([
            'status' => 'error',
            'authenticated' => false,
            'redirect' => route('login')
        ], 401);
    }

    // POST /shopping-cart/set-intended-url
    public function setIntendedUrl(Request $request)
    {
        $request->validate([
            'intended_url' => 'required|string'
        ]);

        // Store the intended URL in the session for post-login redirect
        $request->session()->put('url.intended', $request->intended_url);

        return response()->json([
            'status' => 'success',
            'message' => 'Intended URL set successfully'
        ]);
    }

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
                // Calculate unit price from product variation + attributes
                $basePrice = (float) $item->savedDesign->productVariation->price;
                $attributeTotal = 0;
                
                // Add attribute prices using the same logic as OrderService
                foreach ($item->savedDesign->attributes as $attr) {
                    $attributeTotal += app(\App\Services\AttributePriceResolver::class)
                        ->resolve($attr->attribute_name, $attr->attribute_value, $item->savedDesign->productVariation);
                }
                
                $unitPrice = $basePrice + $attributeTotal;
                $totalPrice = $unitPrice * $item->quantity;
                
                // Extract image effect and edge design from attributes
                $imageEffect = null;
                $edgeDesign = null;
                $hangingMechanism = false;
                $hangingVariety = null;
                
                foreach ($item->savedDesign->attributes as $attribute) {
                    if ($attribute->attribute_name === 'image_effect_id') {
                        $imageEffectModel = \App\Models\ImageEffect::find($attribute->attribute_value);
                        if ($imageEffectModel) {
                            $imageEffect = [
                                'id' => $imageEffectModel->id,
                                'name' => $imageEffectModel->name,
                            ];
                        }
                    } elseif ($attribute->attribute_name === 'edge_design_id') {
                        $edgeDesignModel = \App\Models\EdgeDesign::find($attribute->attribute_value);
                        if ($edgeDesignModel) {
                            $edgeDesign = [
                                'id' => $edgeDesignModel->id,
                                'name' => $edgeDesignModel->name,
                            ];
                        }
                    } elseif ($attribute->attribute_name === 'hanging_mechanism') {
                        $hangingMechanism = $attribute->attribute_value === 'true' || $attribute->attribute_value === '1';
                    } elseif ($attribute->attribute_name === 'hanging_variety_id') {
                        $hangingVarietyModel = \App\Models\HangingMechanismVariety::find($attribute->attribute_value);
                        if ($hangingVarietyModel) {
                            $hangingVariety = [
                                'id' => $hangingVarietyModel->id,
                                'name' => $hangingVarietyModel->name,
                            ];
                        }
                    }
                }
                
                return [
                    'cart_item_id' => $item->id,
                    'quantity' => $item->quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'added_at' => $item->created_at,
                    'saved_design' => [
                        'id' => $item->savedDesign->id,
                        'thumbnail' => $item->savedDesign->thumbnail ? asset('storage/' . $item->savedDesign->thumbnail) : null,
                        'status' => $item->savedDesign->status,
                        'created_at' => $item->savedDesign->created_at,
                        'product_variation' => [
                            'id' => $item->savedDesign->productVariation->id,
                            'label' => $item->savedDesign->productVariation->label,
                            'price' => $item->savedDesign->productVariation->price,
                            'product' => [
                                'id' => $item->savedDesign->productVariation->product->id,
                                'name' => $item->savedDesign->productVariation->product->name,
                                'category' => $item->savedDesign->productVariation->product->category,
                            ],
                        ],
                        'image_effect' => $imageEffect,
                        'edge_design' => $edgeDesign,
                        'hanging_mechanism' => $hangingMechanism,
                        'hanging_variety' => $hangingVariety,
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
