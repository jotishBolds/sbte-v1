<?php

namespace App\Filament\Resources\ShoppingCartItemResource\Pages;

use App\Filament\Resources\ShoppingCartItemResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditShoppingCartItem extends EditRecord
{
    protected static string $resource = ShoppingCartItemResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}
