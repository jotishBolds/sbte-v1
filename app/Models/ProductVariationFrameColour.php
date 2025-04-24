<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariationFrameColour extends Model
{
    protected $guarded = [];

    public function productVariation()
    {
        return $this->belongsTo(ProductVariation::class);
    }

    public function frameColour()
    {
        return $this->belongsTo(FrameColour::class);
    }
}
