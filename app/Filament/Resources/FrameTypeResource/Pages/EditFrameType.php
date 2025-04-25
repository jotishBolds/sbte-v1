<?php

namespace App\Filament\Resources\FrameTypeResource\Pages;

use App\Filament\Resources\FrameTypeResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditFrameType extends EditRecord
{
    protected static string $resource = FrameTypeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
