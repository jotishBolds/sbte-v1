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
        Schema::create('saved_designs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('product_variation_id');
            $table->foreign('product_variation_id', 'pvsd_pv_fk')
                ->references('id')
                ->on('product_variations')
                ->onDelete('cascade');
            $table->string('thumbnail')->nullable();
            $table->enum('status', ['draft', 'finalized', 'carted'])->default('draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_designs');
    }
};
