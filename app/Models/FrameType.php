<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FrameType extends Model
{
    protected $guarded = [];
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function frameType()
    {
        return $this->hasMany(ProductVariationFrameType::class);
    }
}
