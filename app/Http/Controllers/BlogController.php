<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    //
    // public function index()
    // {
    //     $blogs = Blog::where('status', 'Active')
    //                  ->orderBy('published_at', 'desc')
    //                  ->get();

    //     return response()->json($blogs);
    // }

    public function index()
    {
        try {
            $blogs = Blog::where('status', 'Active')
                ->orderBy('published_at', 'desc')
                ->get();

            if ($blogs->isEmpty()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'No active blogs found.',
                    'data' => [],
                ], 200);
            }

            $formattedBlogs = $blogs->map(function ($blog) {
                return [
                    'id' => $blog->id,
                    'title' => $blog->title,
                    'slug' => $blog->slug,
                    'content' => $blog->content,
                    'thumbnail' => $blog->thumbnail,
                    'author' => $blog->author,
                    'published_at' => $blog->published_at,
                    'created_at' => $blog->created_at,
                    'updated_at' => $blog->updated_at,
                ];
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Active blogs retrieved successfully.',
                'data' => $formattedBlogs,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while retrieving blogs.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function getBlogById($id)
    {
        try {
            $blog = Blog::where('status', 'Active')->find($id);

            if (!$blog) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Blog not found.',
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Blog retrieved successfully.',
                'data' => [
                    'id' => $blog->id,
                    'title' => $blog->title,
                    'slug' => $blog->slug,
                    'content' => $blog->content,
                    'thumbnail' => $blog->thumbnail,
                    'author' => $blog->author,
                    'published_at' => $blog->published_at,
                    'created_at' => $blog->created_at,
                    'updated_at' => $blog->updated_at,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while retrieving the blog.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function getBlogBySlug($slug)
    {
        try {
            $blog = Blog::where('slug', $slug)
                ->where('status', 'Active')
                ->first();

            if (!$blog) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Blog not found.',
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Blog retrieved successfully.',
                'data' => [
                    'id' => $blog->id,
                    'title' => $blog->title,
                    'slug' => $blog->slug,
                    'content' => $blog->content,
                    'thumbnail' => $blog->thumbnail,
                    'author' => $blog->author,
                    'published_at' => $blog->published_at,
                    'created_at' => $blog->created_at,
                    'updated_at' => $blog->updated_at,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while retrieving the blog.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
