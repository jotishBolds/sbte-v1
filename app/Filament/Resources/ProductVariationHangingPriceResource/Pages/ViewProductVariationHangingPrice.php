<?php

namespace App\Filament\Resources\ProductVariationHangingPriceResource\Pages;

use App\Filament\Resources\ProductVariationHangingPriceResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewProductVariationHangingPrice extends ViewRecord
{
    protected static string $resource = ProductVariationHangingPriceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
