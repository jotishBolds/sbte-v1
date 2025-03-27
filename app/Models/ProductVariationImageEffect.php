<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariationImageEffect extends Model
{
    //
    protected $guarded = [];

    public function productVariation()
    {
        return $this->belongsTo(ProductVariation::class);
    }

    public function imageEffect()
    {
        return $this->belongsTo(ImageEffect::class);
    }
}
