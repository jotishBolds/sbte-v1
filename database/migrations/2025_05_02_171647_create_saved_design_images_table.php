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
        Schema::create('saved_design_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('saved_design_id');
            $table->foreign('saved_design_id', 'sdsdi_sd_fk')
                ->references('id')
                ->on('saved_designs')
                ->onDelete('cascade');
            $table->text('image_url');
            $table->integer('position');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_design_images');
    }
};
