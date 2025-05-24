<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SavedDesign;
use App\Models\SavedDesignAttribute;
use App\Models\SavedDesignImage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class SavedDesignController extends Controller
{
    public function store(Request $request)
    {
        try {
            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.',
                ], 404);
            }

            $validatedData = $request->validate([
                'product_variation_id' => 'required|exists:product_variations,id',
                'thumbnail' => 'required|file|image|max:5120', // max 5MB
                'status' => 'required|in:Draft,Finalized,Carted',
                'attributes' => 'array',
                'attributes.*.attribute_name' => 'required|string',
                'attributes.*.attribute_value' => 'required|string',
                'images' => 'array',
                'images.*.image_file' => 'required|file|image|max:5120',
                'images.*.position' => 'required|integer',
            ]);

            $productVariation = \App\Models\ProductVariation::with('product')->find($validatedData['product_variation_id']);
            if (!$productVariation || !$productVariation->product) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid product variation or product not found.',
                ], 422);
            }

            $product = $productVariation->product;

            $attributeModelMap = [
                'image_effect_id' => \App\Models\ImageEffect::class,
                'edge_design_id' => \App\Models\EdgeDesign::class,
                'product_type_id' => \App\Models\ProductType::class,
                'frame_color_id' => \App\Models\FrameColour::class,
                'frame_thickness_id' => \App\Models\FrameThickness::class,
                'frame_type_id' => \App\Models\FrameType::class,
                'floating_frame_color_id' => \App\Models\FloatingFrameColour::class,
                'hanging_mechanism_variety_id' => \App\Models\HangingMechanismVariety::class,
            ];

            $booleanAttributes = [
                'hanging_mechanism',
                'acrylic_cover',
            ];

            if (!empty($validatedData['attributes'])) {
                foreach ($validatedData['attributes'] as $attribute) {
                    $attributeName = $attribute['attribute_name'];
                    $attributeValue = $attribute['attribute_value'];

                    if (in_array($attributeName, $booleanAttributes)) {
                        if (!in_array($attributeValue, ['yes', 'no'])) {
                            return response()->json([
                                'status' => 'error',
                                'message' => "Invalid value for {$attributeName}.",
                                'details' => "Allowed values are 'yes' or 'no'.",
                            ], 422);
                        }
                    } elseif (isset($attributeModelMap[$attributeName])) {
                        $model = $attributeModelMap[$attributeName];

                        $isValid = $model::query()
                            ->when(Schema::hasColumn((new $model)->getTable(), 'status'), function ($query) {
                                $query->where('status', 'active');
                            })
                            ->where(function ($query) use ($product) {
                                $query->where('applicability', 'all')
                                    ->orWhere('applicability', $product->category)
                                    ->orWhere(function ($q) use ($product) {
                                        $q->where('applicability', 'specific')
                                            ->where('product_id', $product->id);
                                    });
                            })
                            ->where('id', $attributeValue)
                            ->exists();

                        if (!$isValid) {
                            return response()->json([
                                'status' => 'error',
                                'message' => "Invalid attribute value for {$attributeName}.",
                            ], 422);
                        }
                    } else {
                        return response()->json([
                            'status' => 'error',
                            'message' => "Unsupported attribute name: {$attributeName}.",
                        ], 422);
                    }
                }
            }

            $maxImages = 1;
            if ($product->type === 'layout') {
                $layoutDetail = \App\Models\ProductVariationLayoutDetail::where('product_variation_id', $productVariation->id)->first();
                $maxImages = $layoutDetail ? $layoutDetail->image_count : 1;
            }

            if (!empty($validatedData['images']) && count($validatedData['images']) > $maxImages) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Too many images uploaded.",
                    'details' => "You can upload a maximum of {$maxImages} image(s) for this product type.",
                ], 422);
            }

            DB::beginTransaction();

            $thumbnailPath = $request->file('thumbnail')->store('SavedDesignThumbnail', 'public');

            $savedDesign = SavedDesign::create([
                'customer_id' => $customer->id,
                'product_variation_id' => $validatedData['product_variation_id'],
                'thumbnail' => $thumbnailPath,
                'status' => $validatedData['status'],
            ]);

            if (!empty($validatedData['attributes'])) {
                foreach ($validatedData['attributes'] as $attribute) {
                    $savedDesign->attributes()->create([
                        'attribute_name' => $attribute['attribute_name'],
                        'attribute_value' => $attribute['attribute_value'],
                    ]);
                }
            }

            if (!empty($validatedData['images'])) {
                foreach ($validatedData['images'] as $image) {
                    $imageFile = $image['image_file'];
                    $position = $image['position'];
                    $imagePath = $imageFile->store('SavedDesignImages', 'public');

                    $savedDesign->images()->create([
                        'image_url' => $imagePath,
                        'position' => $position,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Design saved successfully.',
                'data' => [
                    'saved_design_id' => $savedDesign->id,
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed.',
                'details' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while saving the design.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    // Fetch all saved designs for a specific customer
    public function getByCustomer(Request $request)
    {
        try {
            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.',
                ], 404);
            }

            $savedDesigns = SavedDesign::with(['attributes', 'images'])
                ->where('customer_id', $customer->id)
                ->get();

            if ($savedDesigns->isEmpty()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'No saved designs found for this customer.',
                    'data' => [],
                ], 200);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Saved designs fetched successfully.',
                'data' => $savedDesigns,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch saved designs.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    // Fetch a single saved design by its ID
    public function getById($id)
    {
        try {
            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.',
                ], 404);
            }

            $savedDesign = SavedDesign::with(['attributes', 'images'])
                ->where('id', $id)
                ->where('customer_id', $customer->id)
                ->first();

            if (!$savedDesign) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Saved design not found or does not belong to this customer.',
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Saved design fetched successfully.',
                'data' => $savedDesign,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch saved design.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.',
                ], 404);
            }

            $savedDesign = SavedDesign::where('id', $id)
                ->where('customer_id', $customer->id)
                ->first();

            if (!$savedDesign) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Saved design not found or does not belong to this customer.',
                ], 404);
            }

            // Delete associated images from storage
            foreach ($savedDesign->images as $image) {
                if (Storage::disk('public')->exists($image->image_url)) {
                    Storage::disk('public')->delete($image->image_url);
                }
            }

            // Delete thumbnail if exists
            if (Storage::disk('public')->exists($savedDesign->thumbnail)) {
                Storage::disk('public')->delete($savedDesign->thumbnail);
            }

            // Delete related records
            $savedDesign->attributes()->delete();
            $savedDesign->images()->delete();
            $savedDesign->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Saved design deleted successfully.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete saved design.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }




    public function update(Request $request, $id)
    {
        try {
            // dd($request->all());    
            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.',
                ], 404);
            }

            $savedDesign = SavedDesign::with(['attributes', 'images'])
                ->where('id', $id)
                ->where('customer_id', $customer->id)
                ->first();

            if (!$savedDesign) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Saved design not found or unauthorized.',
                ], 404);
            }

            $validatedData = $request->validate([
                'status' => 'nullable|in:Draft,Finalized,Carted',
                'thumbnail' => 'nullable|file|image|max:5120',
                'attributes' => 'nullable|array',
                'attributes.*.attribute_name' => 'required_with:attributes|string',
                'attributes.*.attribute_value' => 'required_with:attributes|string',
                'images' => 'nullable|array',
                'images.*.image_file' => 'required_with:images|file|image|max:5120',
                'images.*.position' => 'required_with:images|integer',
            ]);

            DB::beginTransaction();

            // Update status if provided
            if (isset($validatedData['status'])) {
                $savedDesign->status = $validatedData['status'];
            }

            // Update thumbnail if provided
            if ($request->hasFile('thumbnail')) {
                if ($savedDesign->thumbnail && Storage::disk('public')->exists($savedDesign->thumbnail)) {
                    Storage::disk('public')->delete($savedDesign->thumbnail);
                }

                $thumbnailPath = $request->file('thumbnail')->store('SavedDesignThumbnail', 'public');
                $savedDesign->thumbnail = $thumbnailPath;
            }

            $savedDesign->save();

            // Replace attributes if provided
            if (!empty($validatedData['attributes'])) {
                $savedDesign->attributes()->delete();

                foreach ($validatedData['attributes'] as $attribute) {
                    $savedDesign->attributes()->create([
                        'attribute_name' => $attribute['attribute_name'],
                        'attribute_value' => $attribute['attribute_value'],
                    ]);
                }
            }

            // Replace images if provided
            if (!empty($validatedData['images'])) {
                // Delete old images and their files
                foreach ($savedDesign->images as $oldImage) {
                    if (Storage::disk('public')->exists($oldImage->image_url)) {
                        Storage::disk('public')->delete($oldImage->image_url);
                    }
                    $oldImage->delete();
                }

                // Save new images
                foreach ($validatedData['images'] as $image) {
                    $imagePath = $image['image_file']->store('SavedDesignImages', 'public');

                    $savedDesign->images()->create([
                        'image_url' => $imagePath,
                        'position' => $image['position'],
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Saved design updated successfully.',
                'data' => $savedDesign->load(['attributes', 'images']),
            ], 200);
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
                'message' => 'Failed to update saved design.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
