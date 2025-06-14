<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "Checking edge designs...\n";
    $count = \App\Models\EdgeDesign::count();
    echo "Total edge designs: $count\n";

    if ($count > 0) {
        echo "\nFirst 5 edge designs:\n";
        $designs = \App\Models\EdgeDesign::limit(5)->get(['id', 'name', 'status', 'applicability']);
        foreach ($designs as $design) {
            echo "ID: {$design->id}, Name: {$design->name}, Status: {$design->status}, Applicability: {$design->applicability}\n";
        }
    } else {
        echo "No edge designs found!\n";
    }

    echo "\nChecking products...\n";
    $productCount = \App\Models\Product::count();
    echo "Total products: $productCount\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
