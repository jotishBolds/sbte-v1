<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $guarded = [];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }
    public function images()
    {
        return $this->hasMany(CustomerUploadedImage::class, 'customer_id');
    }
}
