<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductType extends Model
{
    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    public function productTypes()
    {
        return $this->hasMany(ProductVariationTypePricing::class, 'product_type_id');
    }
}
