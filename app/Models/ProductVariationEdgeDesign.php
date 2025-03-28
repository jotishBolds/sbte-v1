<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariationEdgeDesign extends Model
{
    protected $guarded = [];

    public function productVariation()
    {
        return $this->belongsTo(ProductVariation::class);
    }

    public function edgeDesign()
    {
        return $this->belongsTo(EdgeDesign::class);
    }
}
