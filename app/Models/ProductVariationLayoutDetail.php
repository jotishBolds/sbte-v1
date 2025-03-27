<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariationLayoutDetail extends Model
{
    //
    protected $guarded = [];
    public $timestamps = \false;

    public function productVariation()
    {
        return $this->belongsTo(ProductVariation::class);
    }

}
