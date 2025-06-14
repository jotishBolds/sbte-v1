<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Frame Thickness Records:\n";
foreach (App\Models\FrameThickness::all() as $ft) {
    echo "ID: {$ft->id}, Name: {$ft->name}, Status: {$ft->status}\n";
}
