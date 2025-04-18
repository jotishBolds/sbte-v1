<?php

namespace App\Filament\Resources\FrameThicknessResource\Pages;

use App\Filament\Resources\FrameThicknessResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditFrameThickness extends EditRecord
{
    protected static string $resource = FrameThicknessResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
