<?php

namespace App\Filament\Resources\EdgeDesignResource\Pages;

use App\Filament\Resources\EdgeDesignResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditEdgeDesign extends EditRecord
{
    protected static string $resource = EdgeDesignResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
