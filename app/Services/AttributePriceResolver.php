<?php

namespace App\Services;

use App\Models\ProductVariation;
use Illuminate\Support\Facades\DB;

class AttributePriceResolver
{
    public static function resolve(string $attributeName, $attributeValue, ProductVariation $variation): float
    {
        if (! $attributeValue) {
            return 0.0;
        }

        $productId = $variation->product_id;

        if ($attributeName === 'hanging_mechanism') {
            // 1. Try to get variation-specific hanging base price
            $variationPrice = DB::table('product_variation_hanging_prices')
                ->where('product_variation_id', $variation->id)
                ->where('status', 'active')
                ->value('price');


            if ($variationPrice !== null) {
                // dd($variationPrice);
                return (float) $variationPrice;
            }

            // 2. Fallback to general base price by applicability
            $product = $variation->product;

            $basePrice = \App\Models\HangingMechanismBasePrice::query()
                ->where('status', 'active')
                ->where(function ($query) use ($product) {
                    $query->where('applicability', 'all')
                        ->orWhere(function ($q) use ($product) {
                            $q->where('applicability', $product->category);
                        })
                        ->orWhere(function ($q) use ($product) {
                            $q->where('applicability', 'specific')
                                ->where('product_id', $product->id);
                        });
                })
                ->orderByRaw("FIELD(applicability, 'specific', '{$product->category}', 'all')") // prioritize specific > category > all
                ->value('price');
            dd($basePrice);

            return (float) $basePrice;
        }
        if ($attributeName === 'acrylic_cover') {
            // Try variation-specific acrylic cover price first
            $variationPrice = DB::table('product_variation_acrylic_cover_pricings')
                ->where('product_variation_id', $variation->id)
                ->where('status', 'active')
                ->value('price');

            if ($variationPrice !== null) {
                return (float) $variationPrice;
            }

            // Fallback to base acrylic cover pricing by applicability
            $product = $variation->product;

            $basePrice = \App\Models\AcrylicCoverPricing::query()
                ->where('status', 'active')
                ->where(function ($query) use ($product) {
                    $query->where('applicability', 'all')
                        ->orWhere(function ($q) use ($product) {
                            $q->where('applicability', $product->category);
                        })
                        ->orWhere(function ($q) use ($product) {
                            $q->where('applicability', 'specific')
                                ->where('product_id', $product->id);
                        });
                })
                ->orderByRaw("FIELD(applicability, 'specific', '{$product->category}', 'all')") // prioritize specific > category > all
                ->value('price');

            return (float) $basePrice;
        }



        $map = [
            'image_effect' => [
                'model' => \App\Models\ImageEffect::class,
                'pivot_table' => 'product_variation_image_effects',
                'foreign_key' => 'image_effect_id',
            ],
            'edge_design' => [
                'model' => \App\Models\EdgeDesign::class,
                'pivot_table' => 'product_variation_edge_designs',
                'foreign_key' => 'edge_design_id',
            ],
            'hanging_mechanism_variety' => [
                'model' => \App\Models\HangingMechanismVariety::class,
                'pivot_table' => 'product_variation_hanging_varieties',
                'foreign_key' => 'hanging_mechanism_variety_id',
            ],
            'frame_colour' => [
                'model' => \App\Models\FrameColour::class,
                'pivot_table' => 'product_variation_frame_colours',
                'foreign_key' => 'frame_colour_id',
            ],
            'frame_thickness' => [
                'model' => \App\Models\FrameThickness::class,
                'pivot_table' => 'product_variation_frame_thicknesses',
                'foreign_key' => 'frame_thickness_id',
            ],
            'product_type' => [
                'model' => \App\Models\ProductType::class,
                'pivot_table' => 'product_variation_type_pricings',
                'foreign_key' => 'product_type_id',
            ],
            'frame_type' => [
                'model' => \App\Models\FrameType::class,
                'pivot_table' => 'product_variation_frame_types',
                'foreign_key' => 'frame_type_id',
            ],
            'floating_frame_colour' => [
                'model' => \App\Models\FloatingFrameColour::class,
                'pivot_table' => 'product_variation_floating_frame_colours',
                'foreign_key' => 'floating_frame_colour_id',
            ],
        ];

        $config = $map[$attributeName] ?? null;
        if (! $config) {
            return 0.0;
        }

        // First try pivot table for variation-specific price
        if (isset($config['pivot_table'])) {
            $pivotPrice = DB::table($config['pivot_table'])
                ->where('product_variation_id', $variation->id)
                ->where($config['foreign_key'], $attributeValue)
                ->where('status', 'active')
                ->value('price');

            if ($pivotPrice !== null) {
                return (float) $pivotPrice;
            }
        }

        // Then fallback to general or product-specific model price
        $modelClass = $config['model'];
        $model = $modelClass::where('id', $attributeValue)
            ->where('status', 'active')
            ->first();

        if (! $model) {
            return 0.0;
        }

        $product = $variation->product; // assumes relation is set correctly
        $applicability = $model->applicability ?? 'all';

        switch ($applicability) {
            case 'all':
                return (float) ($model->price ?? 0.0);

            case 'specific':
                if (($model->product_id ?? null) === $product->id) {
                    return (float) ($model->price ?? 0.0);
                }
                return 0.0;

            case 'canvas':
            case 'fabric':
            case 'photo':
                if (($product->category ?? null) === $applicability) {
                    return (float) ($model->price ?? 0.0);
                }
                return 0.0;

            default:
                return 0.0;
        }


        return (float) ($model->price ?? 0.0);
    }
}
