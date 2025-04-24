<?php

namespace App\Filament\Resources\ProductVariationResource\Pages;

use App\Filament\Resources\ProductVariationResource;
use App\Models\ProductVariation;
use App\Models\ProductVariationLayoutDetail;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateProductVariation extends CreateRecord
{
    protected static string $resource = ProductVariationResource::class;

    // protected function afterCreate(): void
    // {
    //     $productVariation = $this->record;
    //     // dd(vars: $productVariation);
    //     // dd(vars: $this->data);
    //     // product_variation_layout_details
    //     // if ($this->data['product_type'] === 'size') {
    //     //     dd("hehe");
    //     // }
    //     if ($this->data['product_type'] === 'layout') {
    //         $productVariationLayoutDetail = ProductVariationLayoutDetail::create([
    //             "product_variation_id" => $productVariation->id,
    //             "image_count" => $this->data['product_variation_layout_details']['image_count'] ?? null,
    //             "thumbnail" => $this->data['product_variation_layout_details']['thumbnail'] ?? null,
    //         ]);
    //     }
    // }
    protected function afterCreate(): void
    {
        $productVariation = $this->record;
        // dd(vars: $this->data);
        $thumbnailPath = null;
        if (isset($this->data['product_variation_layout_details']['thumbnail'])) {
            $thumbnail = $this->data['product_variation_layout_details']['thumbnail'];
            $thumbnailPath = reset($thumbnail); // Get the first value of the array
        }

        if ($this->data['product_type'] === 'layout') {
            ProductVariationLayoutDetail::create([
                'product_variation_id' => $productVariation->id,
                'image_count' => $this->data['product_variation_layout_details']['image_count'] ?? null,
                'thumbnail' => $thumbnailPath,
            ]);
        }
    }


}
