<?php

namespace App\Filament\Resources\CustomerUploadedImageResource\Pages;

use App\Filament\Resources\CustomerUploadedImageResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewCustomerUploadedImage extends ViewRecord
{
    protected static string $resource = CustomerUploadedImageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
