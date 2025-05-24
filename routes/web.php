<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CustomerUploadedImageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SavedDesignController;
use App\Http\Controllers\ShoppingCartController;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/canva-print', function () {
    return Inertia::render('PrintLayouts/CanvasPrintDesigner');
});
Route::get('/canva-print-layout', function () {
    return Inertia::render('PrintLayouts/MultiCanvasPrintDesigner');
})->name('canva.print.layout');
Route::get('/canva-print-split-layout', function () {
    return Inertia::render('PrintLayouts/SplitPrint');
})->name('canva.print.split');
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


//Details
Route::get('/canva-details', function () {
    return Inertia::render('Details/CanvaDetails');
});
Route::get('/fabric-details', function () {
    return Inertia::render('Details/FabricDetails');
});
Route::get('/photo-details', function () {
    return Inertia::render('Details/PhotoFrames');
});

//Blog
Route::get('/recent-blogs', function () {
    return Inertia::render('Blogs/RecentBlogs');
});

Route::get('/recent-blogs-details', function () {
    return Inertia::render('Blogs/BlogDetails');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

//FetchCSRF
Route::get('/fetchCSRF', [ProductController::class, 'csrf']);


Route::get('/canvas-product/{productName}', [ProductController::class, 'showCanvasProduct']);


//Shopping Cart Routes
Route::prefix('shopping-cart')->group(function () {
    Route::post('/add', [ShoppingCartController::class, 'addItem']);
    Route::put('/update/{id}', [ShoppingCartController::class, 'updateItem']);
    Route::delete('/delete/{id}', [ShoppingCartController::class, 'deleteItem']);
    Route::get('/customer/{customer_id}', [ShoppingCartController::class, 'getCustomerCart']);
});

//Blogs
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{id}', [BlogController::class, 'getBlogById']);
Route::get('/blogs/slug/{slug}', [BlogController::class, 'getBlogBySlug']);

//Customer Uploaded Images Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/customer-uploaded-images', [CustomerUploadedImageController::class, 'getByCustomer']);
    Route::post('/customer-uploaded-images', [CustomerUploadedImageController::class, 'store']);
    Route::delete('/customer-uploaded-images/{id}', [CustomerUploadedImageController::class, 'destroy']);
});

//Address Routes
Route::prefix('addresses')->middleware('auth:sanctum')->group(function () {
    Route::post('/', [AddressController::class, 'store']); // Create
    Route::put('/{id}', [AddressController::class, 'update']); // Update
    Route::delete('/{id}', [AddressController::class, 'destroy']); // Delete
    Route::get('/customer', [AddressController::class, 'getByCustomer']); // Get all for customer
    Route::get('/{id}', [AddressController::class, 'show']); // Get by ID
});

//Saved Design Routes
Route::middleware('auth:sanctum')->group(function () {
    // Create a new saved design
    Route::post('/saved-designs', [SavedDesignController::class, 'store']);
    // Get all saved designs by customer ID
    Route::get('/saved-designs/customer', [SavedDesignController::class, 'getByCustomer']);
    // Get a single saved design by ID
    Route::get('/saved-designs/{id}', [SavedDesignController::class, 'getById']);
    // Delete a saved design by ID
    Route::delete('/saved-designs/{id}', [SavedDesignController::class, 'destroy']);
    // Update a saved design by ID
    // Route::put('/saved-designs/{id}', [SavedDesignController::class, 'update']);
    Route::post('/saved-designs/{id}', [SavedDesignController::class, 'update']);

});



// Route::middleware('auth:sanctum')->post('/addresses', [AddressController::class, 'store']);


Route::middleware('auth:sanctum')->get('/me', function () {
    return Auth::user();
});


Route::post('/loginwithsanctum', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    return response()->json([
        'token' => $user->createToken('api-token')->plainTextToken,
    ]);
});
require __DIR__ . '/auth.php';
