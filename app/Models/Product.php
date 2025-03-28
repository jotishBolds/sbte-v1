<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    //
    protected $guarded = [];
    public function productVariations()
    {
        return $this->hasMany(ProductVariation::class);
    }
    public function imageEffect()
    {
        return $this->hasOne(ImageEffect::class);
    }

    public function hangingMechanismBasePrice()
    {
        return $this->hasOne(HangingMechanismBasePrice::class);
    }

    public function edgeDesign()
    {
        return $this->hasOne(EdgeDesign::class);
    }
}
