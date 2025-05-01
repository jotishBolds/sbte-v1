<?php

namespace App\Filament\Resources\CustomerUploadedImageResource\Pages;

use App\Filament\Resources\CustomerUploadedImageResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCustomerUploadedImage extends EditRecord
{
    protected static string $resource = CustomerUploadedImageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
