<?php

namespace App\Filament\Resources\FloatingFrameColourResource\Pages;

use App\Filament\Resources\FloatingFrameColourResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewFloatingFrameColour extends ViewRecord
{
    protected static string $resource = FloatingFrameColourResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
