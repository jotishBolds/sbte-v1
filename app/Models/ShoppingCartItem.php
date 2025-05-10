<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShoppingCartItem extends Model
{
    protected $fillable = [
        'customer_id',
        'saved_design_id',
        'quantity',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function savedDesign()
    {
        return $this->belongsTo(SavedDesign::class);
    }
}
