<?php

namespace App\Filament\Resources\AcrylicCoverPricingResource\Pages;

use App\Filament\Resources\AcrylicCoverPricingResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAcrylicCoverPricings extends ListRecords
{
    protected static string $resource = AcrylicCoverPricingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
