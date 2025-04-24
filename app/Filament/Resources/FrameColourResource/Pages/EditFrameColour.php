<?php

namespace App\Filament\Resources\FrameColourResource\Pages;

use App\Filament\Resources\FrameColourResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditFrameColour extends EditRecord
{
    protected static string $resource = FrameColourResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
