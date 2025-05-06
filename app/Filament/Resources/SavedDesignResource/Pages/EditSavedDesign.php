<?php

namespace App\Filament\Resources\SavedDesignResource\Pages;

use App\Filament\Resources\SavedDesignResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSavedDesign extends EditRecord
{
    protected static string $resource = SavedDesignResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
