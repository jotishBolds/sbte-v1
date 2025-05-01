<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Blog extends Model
{
    //
    protected $guarded = [];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->slug = Str::slug($model->title);
        });

        static::saving(function ($model) {
            $model->slug = Str::slug($model->title);
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
