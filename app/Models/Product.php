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
        return $this->hasMany(ImageEffect::class);
    }

    public function hangingMechanismBasePrice()
    {
        return $this->hasOne(HangingMechanismBasePrice::class);
    }
    public function hangingMechanismVariety()
    {
        return $this->hasMany(HangingMechanismVariety::class);
    }

    public function edgeDesign()
    {
        return $this->hasMany(EdgeDesign::class);
    }
    public function productTypePricings()
    {
        return $this->hasMany(ProductTypePricing::class);
    }
    public function acrylicCoverPricing()
    {
        return $this->hasOne(AcrylicCoverPricing::class);
    }
}
