<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ShoppingCartItemResource\Pages;
use App\Filament\Resources\ShoppingCartItemResource\RelationManagers;
use App\Models\Customer;
use App\Models\SavedDesign;
use App\Models\ShoppingCartItem;
use Filament\Forms;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ShoppingCartItemResource extends Resource
{
    protected static ?string $model = ShoppingCartItem::class;
    protected static ?string $navigationGroup = 'Customer Management';
    protected static ?int $navigationSort = 5;
    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('customer_id')
                    ->label('Customer')
                    ->searchable()
                    ->options(Customer::all()->pluck('name', 'id'))
                    ->native(false)
                    ->placeholder('Select a customer')
                    ->required(),
                Forms\Components\Select::make('saved_design_id')
                    ->label('SavedDesign')
                    ->searchable()
                    ->options(function () {
                        return SavedDesign::with('productVariation.product')
                            ->get()
                            ->mapWithKeys(function ($design) {
                                $product = $design->productVariation->product;
                                $variationLabel = $design->productVariation->label;
                                $productName = ucfirst(str_replace('_', ' ', $product->name));
                                $createdAt = $design->created_at->format('Y-m-d H:i');

                                $label = "{$productName} ({$variationLabel}) — Saved At: {$createdAt}";
                                return [$design->id => $label];
                            })
                            ->toArray();
                    })->native(false)
                    ->placeholder('Select a saved design')
                    ->required(),
                Forms\Components\TextInput::make('quantity')
                    ->required()
                    ->numeric()
                    ->minValue(1)
                    ->placeholder('Enter quantity'),
                DateTimePicker::make('created_at')
                    ->hiddenOn(['create', 'edit'])
                    ->displayFormat('Y-m-d H:i:s'),
                DateTimePicker::make('updated_at')
                    ->hiddenOn(['create', 'edit'])
                    ->displayFormat('Y-m-d H:i:s'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('customer.name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('savedDesignLabel')
                    ->label('Saved Design')
                    ->getStateUsing(function ($record) {
                        if (!$record->savedDesign) {
                            return 'N/A';
                        }

                        $design = $record->savedDesign;
                        $product = $design->productVariation->product;
                        $variationLabel = $design->productVariation->label;
                        $productName = ucfirst(str_replace('_', ' ', $product->name));
                        $createdAt = $design->created_at->format('Y-m-d H:i');

                        return "{$productName} ({$variationLabel}) — Created: {$createdAt}";
                    })
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('quantity')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListShoppingCartItems::route('/'),
            'create' => Pages\CreateShoppingCartItem::route('/create'),
            'view' => Pages\ViewShoppingCartItem::route('/{record}'),
            'edit' => Pages\EditShoppingCartItem::route('/{record}/edit'),
        ];
    }
}
