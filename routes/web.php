<?php

use App\Http\Controllers\ProfileController;
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

require __DIR__.'/auth.php';
