<?php

namespace App\Filament\Resources\HangingMechanismVarietyResource\Pages;

use App\Filament\Resources\HangingMechanismVarietyResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListHangingMechanismVarieties extends ListRecords
{
    protected static string $resource = HangingMechanismVarietyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()->label('New Hanging Mechanism Variety'),
        ];
    }
}
