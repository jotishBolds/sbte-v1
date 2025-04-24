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
        Schema::create('product_variation_floating_frame_colours', function (Blueprint $table) {
            $table->id();
            // $table->foreignId('product_variation_id')->constrained('product_variations')->onDelete('cascade');
            $table->unsignedBigInteger('product_variation_id');
            $table->foreign('product_variation_id', 'pvffc_pv_fk')
                ->references('id')
                ->on('product_variations')
                ->onDelete('cascade');
            // $table->foreignId('floating_frame_color_id')->constrained('floating_frame_colors')->onDelete('cascade');
            $table->unsignedBigInteger('floating_frame_colour_id');
            $table->foreign('floating_frame_colour_id', 'pv_ff_colour_fk')
                ->references('id')
                ->on('floating_frame_colours')
                ->onDelete('cascade');
            $table->decimal('price', 10, 2)->default(0.00);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            // $table->unique(['product_variation_id', 'floating_frame_colour_id']);
            $table->unique(
                ['product_variation_id', 'floating_frame_colour_id'],
                'pv_ffc_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variation_floating_frame_colours');
    }
};
