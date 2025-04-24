<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariation extends Model
{
    //
    protected $fillable = [
        'product_id',
        'label',
        'horizontal_length',
        'vertical_length',
        'length_unit_id',
        'price',
        'status'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    public function layoutDetail()
    {
        return $this->hasOne(ProductVariationLayoutDetail::class);
    }

    // public function imageEffect()
    // {
    //     return $this->hasMany(ProductVariationImageEffect::class);
    // }
    public function imageEffects()
    {
        return $this->hasMany(ProductVariationImageEffect::class)
            ->with('imageEffect'); // eager load actual effect details
    }
    public function edgeDesigns()
    {
        return $this->hasMany(ProductVariationEdgeDesign::class)->with('edgeDesign');
    }

    public function frameThicknesses()
    {
        return $this->hasMany(ProductVariationFrameThickness::class)
            ->with('frameThickness'); // eager load actual effect details
    }

    // public function edgeDesign()
    // {
    //     return $this->hasMany(ProductVariationEdgeDesign::class);
    // }
    public function hangingPrice()
    {
        return $this->hasOne(ProductVariationHangingPrice::class);
    }

    // public function hangingVariety()
    // {
    //     return $this->hasMany(ProductVariationHangingVariety::class);
    // }
    public function hangingVarieties()
    {
        return $this->hasMany(ProductVariationHangingVariety::class)->with('hangingMechanismVariety');
    }
    public function lengthUnit()
    {
        return $this->belongsTo(LengthUnit::class);
    }
}
