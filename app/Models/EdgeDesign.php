<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EdgeDesign extends Model
{
    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function edgeDesigns()
    {
        return $this->hasMany(ProductVariationEdgeDesign::class);
    }
}
