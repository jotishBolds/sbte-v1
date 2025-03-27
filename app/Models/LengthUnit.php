<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LengthUnit extends Model
{
    //
    protected $guarded = [];
    public $timestamps = \false;

    public function productVariations()
    {
        return $this->hasMany(ProductVariation::class);
    }

}
