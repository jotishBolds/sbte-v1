<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItemImage extends Model
{
    public $timestamps = false;

    protected $fillable = ['order_item_id', 'image_url', 'position'];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
