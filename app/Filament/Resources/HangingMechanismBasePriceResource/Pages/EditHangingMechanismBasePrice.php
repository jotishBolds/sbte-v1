<?php

namespace App\Filament\Resources\HangingMechanismBasePriceResource\Pages;

use App\Filament\Resources\HangingMechanismBasePriceResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditHangingMechanismBasePrice extends EditRecord
{
    protected static string $resource = HangingMechanismBasePriceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
