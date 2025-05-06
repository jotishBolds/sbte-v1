<?php

namespace App\Filament\Resources\SavedDesignResource\Pages;

use App\Filament\Resources\SavedDesignResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListSavedDesigns extends ListRecords
{
    protected static string $resource = SavedDesignResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
