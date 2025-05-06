<?php

namespace App\Filament\Resources\SavedDesignResource\Pages;

use App\Filament\Resources\SavedDesignResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewSavedDesign extends ViewRecord
{
    protected static string $resource = SavedDesignResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
