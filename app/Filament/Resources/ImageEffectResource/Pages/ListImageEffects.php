<?php

namespace App\Filament\Resources\ImageEffectResource\Pages;

use App\Filament\Resources\ImageEffectResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListImageEffects extends ListRecords
{
    protected static string $resource = ImageEffectResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()->label('New Image Effect'),
        ];
    }
}
