<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImageEffect extends Model
{
    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function imageEffect()
    {
        return $this->hasOne(ProductVariationImageEffect::class);
    }
}
