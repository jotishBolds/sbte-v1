<?php

namespace App\Filament\Resources\EdgeDesignResource\Pages;

use App\Filament\Resources\EdgeDesignResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewEdgeDesign extends ViewRecord
{
    protected static string $resource = EdgeDesignResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
