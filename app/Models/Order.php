<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    //
    protected $fillable = [
        'customer_id',
        'shipping_type_id',
        'total_amount',
        'order_status',
        'is_same_billing_shipping',
        'payment_status',
    ];

    public function customer() {
        return $this->belongsTo(Customer::class);
    }

    public function shippingType() {
        return $this->belongsTo(ShippingType::class);
    }

    public function orderItems() {
        return $this->hasMany(OrderItem::class);
    }

    // public function payment() {
    //     return $this->hasOne(Payment::class);
    // }

    public function shippingAddress() {
        return $this->hasOne(ShippingAddress::class);
    }

    public function billingAddress() {
        return $this->hasOne(BillingAddress::class);
    }
}
