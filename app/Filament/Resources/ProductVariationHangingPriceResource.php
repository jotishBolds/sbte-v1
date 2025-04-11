<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductVariationHangingPriceResource\Pages;
use App\Filament\Resources\ProductVariationHangingPriceResource\RelationManagers;
use App\Models\Product;
use App\Models\ProductVariationHangingPrice;
use Filament\Forms;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ProductVariationHangingPriceResource extends Resource
{
    protected static ?string $model = ProductVariationHangingPrice::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?string $navigationGroup = 'Hanging Management';


    public static function form(Form $form): Form
    {
        return $form
            ->schema([

                Forms\Components\Select::make('product_variation_id')
                    ->label('Product Variation')
                    ->options(function (Get $get) {

                        $query = Product::query()
                            ->with(['productVariations' => function ($q) {
                                $q->orderBy('label');
                            }])
                            ->orderBy('name');
                        $products = $query->get();
                        $grouped = [];
                        foreach ($products as $product) {
                            $label = match ($product->name) {
                                'canvas_print' => 'Canvas Print',
                                'canvas_layout' => 'Canvas Layout',
                                'canvas_split' => 'Canvas Split',
                                'fabric_frame' => 'Fabric Frame',
                                'fabric_layout' => 'Fabric Layout',
                                'fabric_split' => 'Fabric Split',
                                'photo_frame' => 'Photo Frame',
                                'photo_layout' => 'Photo Layout',
                                'photo_split' => 'Photo Split',
                                'photo_tiles' => 'Photo Tiles',
                                default => 'Unknown Product',
                            };
                            $grouped[$label] = $product->productVariations
                                ->pluck('label', 'id')
                                ->toArray();
                        }
                        return $grouped;
                    })

                    ->searchable()
                    ->preload()
                    ->required(),
                Forms\Components\TextInput::make('price')
                    ->required()
                    ->numeric()
                    ->default(0.00),
                Forms\Components\Select::make('status')
                    ->label('Status')
                    ->options([
                        'active' => 'Active',
                        'inactive' => 'Inactive',
                    ])
                    ->default('active')
                    ->native(false),
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
                Tables\Columns\TextColumn::make('productVariation.label')
                    ->label('Product Variation')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('price')
                    ->sortable(),

                Tables\Columns\TextColumn::make('status')
                    ->sortable()
                    ->badge()
                    ->colors([
                        'success' => 'Active',
                        'danger' => 'Inactive',
                    ])
                    ->state(fn($record) => match ($record->status) {
                        'active' => 'Active',
                        'inactive' => 'Inactive',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->label('Created')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->label('Updated')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
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
            'index' => Pages\ListProductVariationHangingPrices::route('/'),
            'create' => Pages\CreateProductVariationHangingPrice::route('/create'),
            'view' => Pages\ViewProductVariationHangingPrice::route('/{record}'),
            'edit' => Pages\EditProductVariationHangingPrice::route('/{record}/edit'),
        ];
    }
}
