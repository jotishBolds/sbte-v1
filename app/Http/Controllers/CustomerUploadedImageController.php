<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerUploadedImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CustomerUploadedImageController extends Controller
{
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

            $images = CustomerUploadedImage::where('customer_id', $customer->id)
                ->where('status', 'Active')
                ->get();

            return response()->json([
                'status' => 'success',
                'message' => $images->isEmpty()
                    ? 'No uploaded images found for this customer.'
                    : 'Uploaded images fetched successfully.',
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
                'image_file' => 'required|file|image|max:5120', // max 5MB
                'title' => 'nullable|string|max:255',
            ]);

            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.',
                ], 404);
            }

            // Store image
            $imagePath = $request->file('image_file')->store('customer_uploaded_images', 'public');

            // Save to DB
            $uploadedImage = CustomerUploadedImage::create([
                'customer_id' => $customer->id,
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
            $customer = Auth::user()->customer;

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Authenticated customer not found.',
                ], 404);
            }

            $uploadedImage = CustomerUploadedImage::where('id', $id)
                ->where('customer_id', $customer->id)
                ->first();

            if (!$uploadedImage) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Customer uploaded image not found or does not belong to the authenticated customer.',
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
