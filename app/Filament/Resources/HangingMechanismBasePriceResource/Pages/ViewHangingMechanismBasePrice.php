<?php

namespace App\Filament\Resources\HangingMechanismBasePriceResource\Pages;

use App\Filament\Resources\HangingMechanismBasePriceResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewHangingMechanismBasePrice extends ViewRecord
{
    protected static string $resource = HangingMechanismBasePriceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
