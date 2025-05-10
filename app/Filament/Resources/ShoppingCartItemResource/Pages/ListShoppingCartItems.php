<?php

namespace App\Filament\Resources\ShoppingCartItemResource\Pages;

use App\Filament\Resources\ShoppingCartItemResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListShoppingCartItems extends ListRecords
{
    protected static string $resource = ShoppingCartItemResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
