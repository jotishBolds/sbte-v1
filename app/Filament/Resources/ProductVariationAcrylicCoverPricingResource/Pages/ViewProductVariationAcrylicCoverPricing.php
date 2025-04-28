<?php

namespace App\Filament\Resources\ProductVariationAcrylicCoverPricingResource\Pages;

use App\Filament\Resources\ProductVariationAcrylicCoverPricingResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewProductVariationAcrylicCoverPricing extends ViewRecord
{
    protected static string $resource = ProductVariationAcrylicCoverPricingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
