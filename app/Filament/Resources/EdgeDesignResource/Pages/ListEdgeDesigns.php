<?php

namespace App\Filament\Resources\EdgeDesignResource\Pages;

use App\Filament\Resources\EdgeDesignResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListEdgeDesigns extends ListRecords
{
    protected static string $resource = EdgeDesignResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()->label('New Edge Design'),
        ];
    }
}
