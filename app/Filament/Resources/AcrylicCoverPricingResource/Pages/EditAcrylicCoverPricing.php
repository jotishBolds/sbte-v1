<?php

namespace App\Filament\Resources\AcrylicCoverPricingResource\Pages;

use App\Filament\Resources\AcrylicCoverPricingResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditAcrylicCoverPricing extends EditRecord
{
    protected static string $resource = AcrylicCoverPricingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
