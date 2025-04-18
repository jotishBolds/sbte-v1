<?php

namespace App\Filament\Resources\FrameColourResource\Pages;

use App\Filament\Resources\FrameColourResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListFrameColours extends ListRecords
{
    protected static string $resource = FrameColourResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
