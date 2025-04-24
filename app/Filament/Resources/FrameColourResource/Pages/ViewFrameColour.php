<?php

namespace App\Filament\Resources\FrameColourResource\Pages;

use App\Filament\Resources\FrameColourResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewFrameColour extends ViewRecord
{
    protected static string $resource = FrameColourResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
