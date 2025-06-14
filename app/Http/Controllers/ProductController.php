<?php

namespace App\Http\Controllers;

use App\Models\EdgeDesign;
use App\Models\FrameThickness;
use App\Models\HangingMechanismBasePrice;
use App\Models\HangingMechanismVariety;
use App\Models\ImageEffect;
use App\Models\Product;
use App\Models\ShippingType;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{

    public function csrf()
    {
        return csrf_token();
    }
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

            $shippingTypes = ShippingType::where('status', 'active')->get();


            return response()->json([
                'product' => $product,
                'baseImageEffects' => $imageEffects,
                'baseEdgeDesigns' => $edgeDesigns,
                'baseFrameThicknesses' => $frameThicknesses,
                'hangingBasePrice' => $hangingBasePrice,
                'baseHangingVarieties' => $hangingVarieties,
                'shippingTypes' => $shippingTypes

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

    /**
     * Get valid edge designs for a product variation
     */
    public function getEdgeDesigns($id)
    {
        try {
            // Get the product variation
            $productVariation = \App\Models\ProductVariation::with('product')->find($id);
            
            if (!$productVariation || !$productVariation->product) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Product variation not found',
                ], 404);
            }
            
            $product = $productVariation->product;
            
            // Get edge designs for this product
            $edgeDesigns = EdgeDesign::query()
                ->when(true, function ($query) {
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
                ->get(['id', 'name', 'description', 'applicability']);
                
            // Also get any edge designs from the product variation relationship
            $variationEdgeDesigns = $productVariation->edgeDesigns()->with('edgeDesign')->get()
                ->map(function($item) {
                    return [
                        'id' => $item->edge_design_id,
                        'name' => $item->edgeDesign->name ?? null,
                        'description' => $item->edgeDesign->description ?? null,
                        'applicability' => $item->edgeDesign->applicability ?? null,
                    ];
                });
                
            // Merge both collections
            $mergedDesigns = $edgeDesigns->concat($variationEdgeDesigns)
                ->unique('id')
                ->values();
            
            return response()->json([
                'status' => 'success',
                'data' => $mergedDesigns,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'variation_id' => $productVariation->id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch edge designs: ' . $e->getMessage(),
            ], 500);
        }
    }
}
