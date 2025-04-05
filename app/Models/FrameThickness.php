<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FrameThickness extends Model
{
    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function frameThicknesses()
    {
        return $this->hasMany(ProductVariationFrameThickness::class);
    }
}
