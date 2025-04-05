<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FrameColour extends Model
{
    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function frameColours()
    {
        return $this->hasMany(ProductVariationFrameColour::class);
    }
}
