<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedDesignImage extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'saved_design_id',
        'image_url',
        'position',
    ];

    public function savedDesign()
    {
        return $this->belongsTo(SavedDesign::class);
    }
}
