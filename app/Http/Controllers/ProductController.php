<?php

namespace App\Http\Controllers;

use App\Models\EdgeDesign;
use App\Models\FrameThickness;
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
            // $allowedNames = [
            //     'canvas_print',
            //     'canvas_layout',
            //     'canvas_split',
            // ];

            $product = Product::with([
                'productVariations.lengthUnit',
                'productVariations.layoutDetail',
                'productVariations.imageEffects' => function ($query) {
                    $query->where('status', 'active')->with('imageEffect');
                },
                'productVariations.edgeDesigns' => function ($query) {
                    $query->where('status', 'active')->with('edgeDesign');
                },
                'productVariations.frameThicknesses' => function ($query) {
                    $query->where('status', 'active')->with('frameThickness');
                },
                'productVariations.hangingPrice' => function ($query) {
                    $query->where('status', 'active');
                },
                'productVariations.hangingVarieties' => function ($query) {
                    $query->where('status', 'active')->with('hangingMechanismVariety');
                },

            ])
                ->where('category', 'canvas')
                ->where('name', $productName)
                ->firstOrFail();

            $imageEffects = ImageEffect::where('status', 'active')
                ->where(function ($query) use ($product) {
                    $query->whereIn('applicability', ['canvas', 'all'])
                        ->orWhere(function ($q) use ($product) {
                            $q->where('applicability', 'specific')
                                ->where('product_id', $product->id);
                        });
                })
                ->get();

            $edgeDesigns = EdgeDesign::where('status', 'active')
                ->where(function ($query) use ($product) {
                    $query->whereIn('applicability', ['canvas', 'all'])
                        ->orWhere(function ($q) use ($product) {
                            $q->where('applicability', 'specific')
                                ->where('product_id', $product->id);
                        });
                })
                ->get();


            $frameThicknesses = FrameThickness::where('status', 'active')
                ->where(function ($query) use ($product) {
                    $query->whereIn('applicability', ['canvas', 'all'])
                        ->orWhere(function ($q) use ($product) {
                            $q->where('applicability', 'specific')
                                ->where('product_id', $product->id);
                        });
                })
                ->get();



            $hangingBasePrice = HangingMechanismBasePrice::where('status', 'active')
                ->where(function ($query) use ($product) {
                    $query->whereIn('applicability', ['canvas', 'all'])
                        ->orWhere(function ($q) use ($product) {
                            $q->where('applicability', 'specific')
                                ->where('product_id', $product->id);
                        });
                })
                ->first();


            $hangingVarieties = HangingMechanismVariety::where('status', 'active')
                ->where(function ($query) use ($product) {
                    $query->whereIn('applicability', ['canvas', 'all'])
                        ->orWhere(function ($q) use ($product) {
                            $q->where('applicability', 'specific')
                                ->where('product_id', $product->id);
                        });
                })
                ->get();

            return response()->json([
                'product' => $product,
                'baseImageEffects' => $imageEffects,
                'baseEdgeDesigns' => $edgeDesigns,
                'baseFrameThicknesses' => $frameThicknesses,
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
            return response()->json([
                'error' => 'Failed to fetch canvas product details',
                'message' => $e->getMessage(),
            ], 500);

            return Inertia::render('Product/CanvasProduct', [
                'product' => [],
                'error' => 'Failed to fetch canvas product details',
                'message' => $e->getMessage(),
            ]);
        }
    }
}
