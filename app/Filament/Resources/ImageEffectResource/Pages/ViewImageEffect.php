<?php

namespace App\Filament\Resources\ImageEffectResource\Pages;

use App\Filament\Resources\ImageEffectResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewImageEffect extends ViewRecord
{
    protected static string $resource = ImageEffectResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
