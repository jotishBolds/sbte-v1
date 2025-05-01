<?php

namespace App\Filament\Resources\CustomerUploadedImageResource\Pages;

use App\Filament\Resources\CustomerUploadedImageResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCustomerUploadedImages extends ListRecords
{
    protected static string $resource = CustomerUploadedImageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
