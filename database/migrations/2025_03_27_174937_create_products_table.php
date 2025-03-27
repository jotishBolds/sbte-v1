<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->enum('name', [
                'canvas_print',
                'canvas_layout',
                'canvas_split',
                'fabric_frame',
                'fabric_layout',
                'fabric_split',
                'photo_frame',
                'photo_layout',
                'photo_split',
                'photo_tiles'
            ])->unique();
            $table->enum('category', ['canvas', 'fabric', 'photo']);
            $table->enum('type', ['size', 'layout']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
