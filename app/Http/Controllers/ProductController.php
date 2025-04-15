<?php

namespace App\Http\Controllers;

use App\Models\EdgeDesign;
use App\Models\HangingMechanismBasePrice;
use App\Models\HangingMechanismVariety;
use App\Models\ImageEffect;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function showCanvasProduct($productName)
    {
        try {
            $allowedNames = [
                'canvas_print',
                'canvas_layout',
                'canvas_split',
                'fabric_frame',
                'fabric_layout',
                'fabric_split',
                'photo_frame',
                'photo_layout',
                'photo_split',
                'photo_tiles'
            ];

            $product = Product::with([
                'productVariations.lengthUnit',
                'productVariations.layoutDetail',
                'productVariations.imageEffects' => function ($query) {
                    $query->where('status', 'active')->with('imageEffect');
                },
                'productVariations.edgeDesigns' => function ($query) {
                    $query->where('status', 'active')->with('edgeDesign');
                },
                'productVariations.hangingPrice' => function ($query) {
                    $query->where('status', 'active');
                },
                'productVariations.hangingVarieties' => function ($query) {
                    $query->where('status', 'active')->with('hangingMechanismVariety');
                },
                // 'productVariations.imageEffects.imageEffect',
                // 'productVariations.edgeDesigns.edgeDesign',
                // 'productVariations.hangingPrice',
                // 'productVariations.hangingVarieties.hangingMechanismVariety',
            ])
                ->where('category', 'canvas')
                ->where('name', $productName)
                ->firstOrFail();

            // Fetch base image effects (applicable to canvas or all)
            $imageEffects = ImageEffect::whereIn('applicability', ['canvas', 'all'])
                ->where(function ($query) use ($product) {
                    $query->whereNull('product_id')
                        ->orWhere('product_id', $product->id);
                })
                ->where('status', 'active')
                ->get();

            // Fetch base edge designs
            $edgeDesigns = EdgeDesign::whereIn('applicability', ['canvas'])
                ->where(function ($query) use ($product) {
                    $query->whereNull('product_id')
                        ->orWhere('product_id', $product->id);
                })
                ->where('status', 'active')
                ->get();

            // Fetch base hanging mechanism prices
            $hangingBasePrice = HangingMechanismBasePrice::whereIn('applicability', ['canvas', 'all'])
                ->where(function ($query) use ($product) {
                    $query->whereNull('product_id')
                        ->orWhere('product_id', $product->id);
                })
                ->where('status', 'active')
                ->first();

            // Fetch all hanging mechanism varieties
            $hangingVarieties = HangingMechanismVariety::whereIn('applicability', ['canvas', 'all'])
                ->where(function ($query) use ($product) {
                    $query->whereNull('product_id')
                        ->orWhere('product_id', $product->id);
                })
                ->where('status', 'active')
                ->get();

            return response()->json([
                'product' => $product,
                'baseImageEffects' => $imageEffects,
                'baseEdgeDesigns' => $edgeDesigns,
                'hangingBasePrice' => $hangingBasePrice,
                'baseHangingVarieties' => $hangingVarieties
            ], 200);

            // return Inertia::render('Product/CanvasProduct', [
            //     'product' => $product,
            //     'baseImageEffects' => $imageEffects,
            //     'baseEdgeDesigns' => $edgeDesigns,
            //     'hangingBasePrice' => $hangingBasePrice,
            //     'baseHangingVarieties' => $hangingVarieties
            // ]);
        } catch (\Exception $e) {
            Log::error('Error fetching canvas product details: ' . $e->getMessage());
            return Inertia::render('Product/CanvasProduct', [
                'product' => [],
                'error' => 'Failed to fetch canvas product details',
                'message' => $e->getMessage(),
            ]);
        }
    }
    // show()
    // {
    //     try {

    //         return response()->json(['product' => $products], 200);
    //         return Inertia::render('Product', [
    //             'product' => $product
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Error fetching product details: ' . $e->getMessage());
    //         return Inertia::render('Product', [
    //             'product' => [],
    //             'error' => 'Failed to fetch product details',
    //             'message' => $e->getMessage(),
    //         ]);
    //     }
    // }
}
