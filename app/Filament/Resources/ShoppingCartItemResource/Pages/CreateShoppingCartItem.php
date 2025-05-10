<?php

namespace App\Filament\Resources\ShoppingCartItemResource\Pages;

use App\Filament\Resources\ShoppingCartItemResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateShoppingCartItem extends CreateRecord
{
    protected static string $resource = ShoppingCartItemResource::class;
}
