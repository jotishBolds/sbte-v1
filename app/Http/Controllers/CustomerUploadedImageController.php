<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerUploadedImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CustomerUploadedImageController extends Controller
{

    public function getByCustomer($customer_id)
    {
        try {
            $customer = Customer::find($customer_id);

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Customer not found.',
                ], 404);
            }

            $images = CustomerUploadedImage::where('customer_id', $customer_id)
                ->where('status', 'Active')
                ->get();

            if ($images->isEmpty()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'No uploaded images found for this customer.',
                    'data' => [],
                ], 200);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Uploaded images fetched successfully.',
                'data' => $images,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch uploaded images.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'customer_id' => 'required|exists:customers,id',
                'image_file' => 'required|file|image|max:5120', // max 5MB
                'title' => 'nullable|string|max:255',
            ]);

            // Store image
            $imagePath = $request->file('image_file')->store('customer_uploaded_images', 'public');

            // Save to DB
            $uploadedImage = CustomerUploadedImage::create([
                'customer_id' => $validated['customer_id'],
                'image_path' => $imagePath,
                'title' => $validated['title'] ?? null,
                'status' => 'Active',
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Image uploaded successfully.',
                'data' => $uploadedImage,
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
                'message' => 'Failed to upload image.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $uploadedImage = CustomerUploadedImage::find($id);

            if (!$uploadedImage) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Customer uploaded image not found.',
                ], 404);
            }

            // Delete image file from storage
            if (Storage::disk('public')->exists($uploadedImage->image_path)) {
                Storage::disk('public')->delete($uploadedImage->image_path);
            }

            // Delete record from DB
            $uploadedImage->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Image deleted successfully.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete image.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
