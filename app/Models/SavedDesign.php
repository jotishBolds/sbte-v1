<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedDesign extends Model
{
    protected $guarded = [];
    protected $fillable = [
        'customer_id',
        'product_variation_id',
        'thumbnail',
        'status',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function productVariation()
    {
        return $this->belongsTo(ProductVariation::class);
    }

    public function attributes()
    {
        return $this->hasMany(SavedDesignAttribute::class);
    }

    public function images()
    {
        return $this->hasMany(SavedDesignImage::class);
    }

    public function shoppingCartItems()
    {
        return $this->hasMany(ShoppingCartItem::class);
    }
}
