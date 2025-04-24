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
        Schema::create('product_variation_frame_colours', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_variation_id');
            $table->foreign('product_variation_id', 'pvfc_pv_fk')
                ->references('id')
                ->on('product_variations')
                ->onDelete('cascade');
            // $table->foreignId('product_variation_id')->constrained('product_variations')->onDelete('cascade');
            $table->unsignedBigInteger('frame_colour_id');
            $table->foreign('frame_colour_id', 'pvfc_fc_fk')
                ->references('id')
                ->on('frame_colours')
                ->onDelete('cascade');
            // $table->foreignId('frame_colour_id')->constrained('frame_colours')->onDelete('cascade');
            $table->decimal('price', 10, 2)->default(0.00);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->unique(
                ['product_variation_id', 'frame_colour_id'],
                'pv_fc_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variation_frame_colours');
    }
};
