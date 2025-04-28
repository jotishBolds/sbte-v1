<?php

namespace App\Filament\Resources\ProductVariationAcrylicCoverPricingResource\Pages;

use App\Filament\Resources\ProductVariationAcrylicCoverPricingResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListProductVariationAcrylicCoverPricings extends ListRecords
{
    protected static string $resource = ProductVariationAcrylicCoverPricingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
