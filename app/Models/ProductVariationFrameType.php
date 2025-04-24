<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariationFrameType extends Model
{
    protected $guarded = [];

    public function productVariation()
    {
        return $this->belongsTo(ProductVariation::class);
    }
    public function frameType()
    {
        return $this->belongsTo(FrameType::class);
    }
}
