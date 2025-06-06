<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductVariationAcrylicCoverPricingResource\Pages;
use App\Filament\Resources\ProductVariationAcrylicCoverPricingResource\RelationManagers;
use App\Models\AcrylicCoverPricing;
use App\Models\Product;
use App\Models\ProductVariationAcrylicCoverPricing;
use Filament\Forms;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ProductVariationAcrylicCoverPricingResource extends Resource
{
    protected static ?string $model = ProductVariationAcrylicCoverPricing::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?string $navigationGroup = 'Attribute Management';
    protected static ?int $navigationSort = 13;
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('product_variation_id')
                    ->label('Product Variation')
                    ->options(function (Get $get) {
                        // First, find out all applicable product IDs

                        // Products that are specifically assigned
                        $specificProductIds = AcrylicCoverPricing::whereNotNull('product_id')
                            // ->where('status', 'active')
                            ->pluck('product_id')
                            ->toArray();

                        // Categories where applicability is set to photo
                        $applicableCategories = AcrylicCoverPricing::whereNull('product_id')
                            // ->where('status', 'active')
                            ->pluck('applicability')
                            ->toArray();

                        // Products that belong to applicable categories (photo, etc.)
                        $categoryProductIds = Product::whereIn('category', $applicableCategories)
                            ->pluck('id')
                            ->toArray();

                        // Merge both arrays
                        $allApplicableProductIds = array_unique(array_merge($specificProductIds, $categoryProductIds));

                        // Now fetch only those products
                        $products = Product::query()
                            ->whereIn('id', $allApplicableProductIds)
                            ->with(['productVariations' => function ($q) {
                                $q->orderBy('label');
                            }])
                            ->orderBy('name')
                            ->get();


                        $grouped = [];
                        foreach ($products as $product) {
                            $label = match ($product->name) {
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
            'index' => Pages\ListProductVariationAcrylicCoverPricings::route('/'),
            'create' => Pages\CreateProductVariationAcrylicCoverPricing::route('/create'),
            'view' => Pages\ViewProductVariationAcrylicCoverPricing::route('/{record}'),
            'edit' => Pages\EditProductVariationAcrylicCoverPricing::route('/{record}/edit'),
        ];
    }
}
