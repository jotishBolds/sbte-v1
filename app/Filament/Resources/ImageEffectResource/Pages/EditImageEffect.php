<?php

namespace App\Filament\Resources\ImageEffectResource\Pages;

use App\Filament\Resources\ImageEffectResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditImageEffect extends EditRecord
{
    protected static string $resource = ImageEffectResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
