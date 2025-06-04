<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    //
    protected $fillable = [
        'order_id', 'product_variation_id',
        'quantity', 'unit_price', 'total_price',
        'thumbnail',
    ];

    public function order() {
        return $this->belongsTo(Order::class);
    }

    public function productVariation() {
        return $this->belongsTo(ProductVariation::class);
    }

    public function attributes() {
        return $this->hasMany(OrderItemAttribute::class);
    }

    public function images() {
        return $this->hasMany(OrderItemImage::class);
    }
}
