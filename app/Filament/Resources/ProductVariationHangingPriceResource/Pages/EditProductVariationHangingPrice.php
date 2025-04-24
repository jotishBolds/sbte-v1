<?php

namespace App\Filament\Resources\ProductVariationHangingPriceResource\Pages;

use App\Filament\Resources\ProductVariationHangingPriceResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditProductVariationHangingPrice extends EditRecord
{
    protected static string $resource = ProductVariationHangingPriceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
