<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedDesignAttribute extends Model
{
    public $timestamps = false; // No timestamps in your table

    protected $fillable = [
        'saved_design_id',
        'attribute_name',
        'attribute_value',
    ];

    public function savedDesign()
    {
        return $this->belongsTo(SavedDesign::class);
    }
}
