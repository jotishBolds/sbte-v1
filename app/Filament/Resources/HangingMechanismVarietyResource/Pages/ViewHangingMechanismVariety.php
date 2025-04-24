<?php

namespace App\Filament\Resources\HangingMechanismVarietyResource\Pages;

use App\Filament\Resources\HangingMechanismVarietyResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewHangingMechanismVariety extends ViewRecord
{
    protected static string $resource = HangingMechanismVarietyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
