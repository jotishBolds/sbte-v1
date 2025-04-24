<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariationFloatingFrameColour extends Model
{
    protected $guarded = [];

    public function productVariation()
    {
        return $this->belongsTo(ProductVariation::class);
    }

    public function floatingFrameColour()
    {
        return $this->belongsTo(FloatingFrameColour::class);
    }
}
