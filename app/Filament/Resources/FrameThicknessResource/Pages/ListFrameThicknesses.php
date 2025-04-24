<?php

namespace App\Filament\Resources\FrameThicknessResource\Pages;

use App\Filament\Resources\FrameThicknessResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListFrameThicknesses extends ListRecords
{
    protected static string $resource = FrameThicknessResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
