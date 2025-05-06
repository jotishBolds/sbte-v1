<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SavedDesign;
use App\Models\SavedDesignAttribute;
use App\Models\SavedDesignImage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SavedDesignController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'product_variation_id' => 'required|exists:product_variations,id',
            'thumbnail' => 'required|string',
            'status' => 'required|in:Draft,Finalized,Carted',
            'attributes' => 'array',
            'attributes.*.attribute_name' => 'required|string',
            'attributes.*.attribute_value' => 'required|string',
            'images' => 'array',
            'images.*.image_url' => 'required|string',
            'images.*.position' => 'required|integer',
        ]);

        $productVariation = \App\Models\ProductVariation::with('product')->find($validatedData['product_variation_id']);
        if (!$productVariation) {
            return response()->json([
                'message' => 'Invalid product variation.',
            ], 422);
        }

        $product = $productVariation->product;
        if (!$product) {
            return response()->json([
                'message' => 'Product associated with this variation not found.',
            ], 422);
        }

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
                            'message' => "Invalid value for {$attributeName}. Allowed values are 'yes' or 'no'.",
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
                            'message' => "Invalid attribute value for {$attributeName}.",
                        ], 422);
                    }
                } else {
                    return response()->json([
                        'message' => "Unsupported attribute name: {$attributeName}.",
                    ], 422);
                }
            }
        }

        $maxImages = 1;
        if ($product->type === 'layout') {
            $layoutDetail = \App\Models\ProductVariationLayoutDetail::where('product_variation_id', $productVariation->id)->first();
            $maxImages = $layoutDetail ? $layoutDetail->image_count : 1;
        } elseif ($product->type === 'size') {
            $maxImages = 1;
        }

        if (!empty($validatedData['images']) && count($validatedData['images']) > $maxImages) {
            return response()->json([
                'message' => "You can upload a maximum of {$maxImages} image(s) for this product type.",
            ], 422);
        }

        DB::beginTransaction();
        try {
            $savedDesign = SavedDesign::create([
                'customer_id' => $validatedData['customer_id'],
                'product_variation_id' => $validatedData['product_variation_id'],
                'thumbnail' => $validatedData['thumbnail'],
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
                    $savedDesign->images()->create([
                        'image_url' => $image['image_url'],
                        'position' => $image['position'],
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Design saved successfully',
                'saved_design_id' => $savedDesign->id,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to save design',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
