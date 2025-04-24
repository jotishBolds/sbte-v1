<?php

namespace App\Filament\Resources\HangingMechanismVarietyResource\Pages;

use App\Filament\Resources\HangingMechanismVarietyResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditHangingMechanismVariety extends EditRecord
{
    protected static string $resource = HangingMechanismVarietyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
