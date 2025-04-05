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
    public function productTypePricing()
    {
        return $this->belongsTo(ProductTypePricing::class);
    }
}
