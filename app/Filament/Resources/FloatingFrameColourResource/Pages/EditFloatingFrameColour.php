<?php

namespace App\Filament\Resources\FloatingFrameColourResource\Pages;

use App\Filament\Resources\FloatingFrameColourResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditFloatingFrameColour extends EditRecord
{
    protected static string $resource = FloatingFrameColourResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
