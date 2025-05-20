<?php

namespace App\Filament\Resources\ShippingTypeResource\Pages;

use App\Filament\Resources\ShippingTypeResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewShippingType extends ViewRecord
{
    protected static string $resource = ShippingTypeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
