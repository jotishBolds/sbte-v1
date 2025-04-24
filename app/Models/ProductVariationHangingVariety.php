<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariationHangingVariety extends Model
{
    protected $guarded = [];

    public function productVariation()
    {
        return $this->belongsTo(ProductVariation::class);
    }

    public function hangingMechanismVariety()
    {
        return $this->belongsTo(HangingMechanismVariety::class);
    }
}
