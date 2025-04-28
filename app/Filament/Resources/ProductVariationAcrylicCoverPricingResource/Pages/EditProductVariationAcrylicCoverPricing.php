<?php

namespace App\Filament\Resources\ProductVariationAcrylicCoverPricingResource\Pages;

use App\Filament\Resources\ProductVariationAcrylicCoverPricingResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditProductVariationAcrylicCoverPricing extends EditRecord
{
    protected static string $resource = ProductVariationAcrylicCoverPricingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
