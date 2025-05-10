<?php

namespace App\Filament\Resources\ShoppingCartItemResource\Pages;

use App\Filament\Resources\ShoppingCartItemResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewShoppingCartItem extends ViewRecord
{
    protected static string $resource = ShoppingCartItemResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
