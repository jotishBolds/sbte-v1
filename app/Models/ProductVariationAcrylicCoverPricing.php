<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariationAcrylicCoverPricing extends Model
{
    protected $guarded = [];

    public function productVariation()
    {
        return $this->belongsTo(ProductVariation::class);
    }
}
