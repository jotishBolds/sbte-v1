<?php

namespace App\Filament\Resources\HangingMechanismBasePriceResource\Pages;

use App\Filament\Resources\HangingMechanismBasePriceResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListHangingMechanismBasePrices extends ListRecords
{
    protected static string $resource = HangingMechanismBasePriceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()->label('New Hanging Mechanism Base Price'),
        ];
    }
}
