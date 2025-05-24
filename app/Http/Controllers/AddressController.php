<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:100',
                'recipient_name' => 'required|string',
                'phone_number' => 'required|string|max:20',
                'alternate_phone' => 'nullable|string|max:20',
                'address_line_1' => 'required|string',
                'address_line_2' => 'nullable|string',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:100',
                'postal_code' => 'required|string|max:20',
                'country' => 'required|string|max:100',
                'is_default' => 'boolean',
            ]);

            $customer = Auth::user()->customer;
            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.'
                ], 404);
            }

            if (!empty($validated['is_default'])) {
                Address::where('customer_id', $customer->id)->update(['is_default' => false]);
            }

            $validated['customer_id'] = $customer->id;
            $address = Address::create($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Address created successfully.',
                'data' => $address
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create address.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }


    // DELETE: Delete address
    public function destroy($id)
    {
        try {
            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.'
                ], 404);
            }

            $address = Address::where('id', $id)
                ->where('customer_id', $customer->id)
                ->first();

            if (!$address) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Address not found or does not belong to you.'
                ], 404);
            }

            $address->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Address deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete address.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    // GET: Get all addresses for a customer
    public function getByCustomer()
    {
        try {
            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.',
                ], 404);
            }

            $addresses = Address::where('customer_id', $customer->id)->get();

            if ($addresses->isEmpty()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'No addresses found for this customer.',
                    'data' => [],
                ], 200);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Addresses fetched successfully.',
                'data' => $addresses,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch addresses.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }


    // GET: Get address by ID
    public function show($id)
    {
        try {
            $address = Address::find($id);

            if (!$address) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Address not found.',
                ], 404);
            }

            $customer = Auth::user()->customer;

            if (!$customer || $address->customer_id !== $customer->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You are not authorized to view this address.',
                ], 403);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Address fetched successfully.',
                'data' => $address,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch address.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:100',
                'recipient_name' => 'sometimes|required|string',
                'phone_number' => 'sometimes|required|string|max:20',
                'alternate_phone' => 'nullable|string|max:20',
                'address_line_1' => 'sometimes|required|string',
                'address_line_2' => 'nullable|string',
                'city' => 'sometimes|required|string|max:100',
                'state' => 'sometimes|required|string|max:100',
                'postal_code' => 'sometimes|required|string|max:20',
                'country' => 'sometimes|required|string|max:100',
                'is_default' => 'boolean',
            ]);

            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.'
                ], 404);
            }

            $address = Address::where('id', $id)
                ->where('customer_id', $customer->id)
                ->first();

            if (!$address) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Address not found or access denied.'
                ], 404);
            }

            if (!empty($validated['is_default'])) {
                Address::where('customer_id', $customer->id)->update(['is_default' => false]);
            }

            $address->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Address updated successfully.',
                'data' => $address
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update address.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
