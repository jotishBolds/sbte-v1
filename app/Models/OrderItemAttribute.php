<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItemAttribute extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'order_item_id',
        'attribute_name',
        'attribute_value',
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
