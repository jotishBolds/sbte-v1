<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariationTypePricing extends Model
{
    protected $guarded = [];

    public function productVariation()
    {
        return $this->belongsTo(ProductVariation::class);
    }
    public function productType()
    {
        return $this->belongsTo(ProductType::class,'product_type_id');
    }
}
