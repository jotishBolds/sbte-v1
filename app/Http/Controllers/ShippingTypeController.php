<?php

namespace App\Http\Controllers;

use App\Models\ShippingType;
use Illuminate\Http\Request;

class ShippingTypeController extends Controller
{

    public function getActiveShippingTypes()
    {
        try {
            $shippingTypes = ShippingType::where('status', 'active')->get();

            if ($shippingTypes->isEmpty()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'No active shipping types found.',
                    'data' => [],
                ], 200);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Active shipping types fetched successfully.',
                'data' => $shippingTypes,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch shipping types.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
