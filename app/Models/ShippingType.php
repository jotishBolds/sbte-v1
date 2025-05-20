<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingType extends Model
{
    //
     protected $fillable = [
        'name',
        'price',
        'min_days',
        'max_days',
        'status',
    ];
    
}
