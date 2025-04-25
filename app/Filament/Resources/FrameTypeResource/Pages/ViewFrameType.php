<?php

namespace App\Filament\Resources\FrameTypeResource\Pages;

use App\Filament\Resources\FrameTypeResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewFrameType extends ViewRecord
{
    protected static string $resource = FrameTypeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
