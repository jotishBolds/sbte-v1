<?php

namespace App\Filament\Resources\LengthUnitResource\Pages;

use App\Filament\Resources\LengthUnitResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageLengthUnits extends ManageRecords
{
    protected static string $resource = LengthUnitResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
