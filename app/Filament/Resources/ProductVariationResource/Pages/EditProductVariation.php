<?php

namespace App\Filament\Resources\ProductVariationResource\Pages;

use App\Filament\Resources\ProductVariationResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditProductVariation extends EditRecord
{
    protected static string $resource = ProductVariationResource::class;
    protected function afterSave(): void
    {
        $productVariation = $this->record;

        $thumbnailPath = null;
        if (isset($this->data['product_variation_layout_details']['thumbnail'])) {
            $thumbnail = $this->data['product_variation_layout_details']['thumbnail'];
            $thumbnailPath = reset($thumbnail); // Get the first value of the array

            $productVariation->layoutDetail()->updateOrCreate(
                [],
                [
                    'thumbnail' =>  $thumbnailPath,
                    'image_count' => $this->data['product_variation_layout_details']['image_count'] ?? null,
                ]
            );
        } else {
            $productVariation->layoutDetail()?->delete();
        }
    }
    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
