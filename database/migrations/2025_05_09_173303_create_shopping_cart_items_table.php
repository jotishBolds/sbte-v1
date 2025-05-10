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
        Schema::create('shopping_cart_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id');
            $table->foreign('customer_id', 'c_sci_fk')
                ->references('id')
                ->on('customers')
                ->onDelete('cascade');
            $table->unsignedBigInteger('saved_design_id');
            $table->foreign('saved_design_id', 'sd_sci_fk')
                ->references('id')
                ->on('saved_designs')
                ->onDelete('cascade');
            $table->integer('quantity')->check('quantity > 0');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shopping_cart_items');
    }
};
