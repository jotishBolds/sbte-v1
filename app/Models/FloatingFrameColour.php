<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FloatingFrameColour extends Model
{
    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function floatingFrameColours()
    {
        return $this->hasMany(ProductVariationFloatingFrameColour::class);
    }
}
