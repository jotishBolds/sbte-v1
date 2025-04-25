<?php

namespace App\Filament\Resources\FrameTypeResource\Pages;

use App\Filament\Resources\FrameTypeResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListFrameTypes extends ListRecords
{
    protected static string $resource = FrameTypeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
