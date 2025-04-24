<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariationFrameThickness extends Model
{
    protected $guarded = [];

    public function productVariation()
    {
        return $this->belongsTo(ProductVariation::class);
    }
    public function frameThickness()
    {
        return $this->belongsTo(FrameThickness::class);
    }
}
