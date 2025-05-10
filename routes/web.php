<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SavedDesignController;
use App\Http\Controllers\ShoppingCartController;
use Illuminate\Foundation\Application;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

//FetchCSRF
Route::get('/fetchCSRF', [ProductController::class, 'csrf']);


Route::get('/canvas-product/{productName}', [ProductController::class, 'showCanvasProduct']);
Route::post('/save-design', [SavedDesignController::class, 'store']);

//Shopping Cart Routes
Route::prefix('shopping-cart')->group(function () {
    Route::post('/add', [ShoppingCartController::class, 'addItem']);
    Route::put('/update/{id}', [ShoppingCartController::class, 'updateItem']);
    Route::delete('/delete/{id}', [ShoppingCartController::class, 'deleteItem']);
    Route::get('/customer/{customer_id}', [ShoppingCartController::class, 'getCustomerCart']);
});

require __DIR__ . '/auth.php';
