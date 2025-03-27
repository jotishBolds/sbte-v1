<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariation extends Model
{
    //
    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    public function layoutDetail()
    {
        return $this->hasOne(ProductVariationLayoutDetail::class);
    }

    public function imageEffect()
    {
        return $this->hasOne(ProductVariationImageEffect::class);
    }

    public function lengthUnit()
    {
        return $this->belongsTo(LengthUnit::class);
    }

}
