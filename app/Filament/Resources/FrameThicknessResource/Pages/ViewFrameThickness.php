<?php

namespace App\Filament\Resources\FrameThicknessResource\Pages;

use App\Filament\Resources\FrameThicknessResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewFrameThickness extends ViewRecord
{
    protected static string $resource = FrameThicknessResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
