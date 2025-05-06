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
        Schema::create('saved_design_attributes', function (Blueprint $table) {
            $table->id();
            // $table->foreignId('saved_design_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('saved_design_id');
            $table->foreign('saved_design_id', 'sdsda_sd_fk')
                ->references('id')
                ->on('saved_designs')
                ->onDelete('cascade');
            $table->enum('attribute_name', [
                'product_type_id',
                'image_effect_id',
                'edge_design_id',
                'frame_colour_id',
                'frame_thickness_id',
                'frame_type_id',
                'floating_frame_colour_id',
                'acrylic_cover',
                'hanging_mechanism',
                'hanging_mechanism_variety_id'
            ]);
            $table->string('attribute_value');
            // $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_design_attributes');
    }
};
