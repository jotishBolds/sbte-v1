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

    public function imageEffect()
    {
        return $this->hasOne(ProductVariationImageEffect::class);
    }

    public function edgeDesign()
    {
        return $this->hasOne(ProductVariationEdgeDesign::class);
    }
    public function hangingPrice()
    {
        return $this->hasOne(ProductVariationHangingPrice::class);
    }

    public function hangingVariety()
    {
        return $this->hasMany(ProductVariationHangingVariety::class);
    }

    public function lengthUnit()
    {
        return $this->belongsTo(LengthUnit::class);
    }


}
