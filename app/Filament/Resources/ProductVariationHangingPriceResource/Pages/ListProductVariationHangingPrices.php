<?php

namespace App\Filament\Resources\ProductVariationHangingPriceResource\Pages;

use App\Filament\Resources\ProductVariationHangingPriceResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListProductVariationHangingPrices extends ListRecords
{
    protected static string $resource = ProductVariationHangingPriceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()->label('New Product Variation Hanging Price'),
        ];
    }
}
