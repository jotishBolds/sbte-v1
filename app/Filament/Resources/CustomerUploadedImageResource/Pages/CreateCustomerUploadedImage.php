<?php

namespace App\Filament\Resources\CustomerUploadedImageResource\Pages;

use App\Filament\Resources\CustomerUploadedImageResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateCustomerUploadedImage extends CreateRecord
{
    protected static string $resource = CustomerUploadedImageResource::class;
}
