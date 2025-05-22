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
        Schema::create('order_item_attributes', function (Blueprint $table) {
            $table->id();
            // $table->foreignId('order_item_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('order_item_id');
            $table->foreign('order_item_id', 'oioia_oi_fk')
                ->references('id')
                ->on('order_items')
                ->onDelete('cascade');
            $table->enum('attribute_name', [
                'product_type_id',
                'image_effect_id',
                'edge_design_id',
                'frame_color_id',
                'frame_thickness_id',
                'frame_type_id',
                'floating_frame_color_id',
                'acrylic_cover',
                'hanging_mechanism',
                'hanging_mechanism_variety_id',
            ]);
            $table->string('attribute_value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_item_attributes');
    }
};
