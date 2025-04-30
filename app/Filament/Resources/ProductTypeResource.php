<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductTypeResource\Pages;
use App\Filament\Resources\ProductTypeResource\RelationManagers;
use App\Models\Product;
use App\Models\ProductType;
use Filament\Forms;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Pages\SubNavigationPosition;
use Filament\Pages\Page;
use Filament\Tables\Actions\ActionGroup;

class ProductTypeResource extends Resource
{
    protected static ?string $model = ProductType::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static SubNavigationPosition $subNavigationPosition = SubNavigationPosition::Top;

    public static function getRecordSubNavigation(Page $page): array
    {
        return $page->generateNavigationItems([
            Pages\ViewProductType::class,
            Pages\EditProductType::class,
            Pages\ManageProductVariationPricing::class,
        ]);
    }
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('label')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Select::make('applicability')
                    ->label('Applicability')
                    ->required()
                    ->reactive()
                    ->options([
                        'fabric' => 'Fabric',
                        'specific' => 'Specific',
                    ])
                    ->native(false),

                Forms\Components\Select::make('product_id')
                    ->label('Product')
                    // ->relationship('product', 'name')
                    ->native(false)
                    ->hint('Select if selected applicability is "specific"')
                    ->required(fn($get) => $get('applicability') === 'specific')
                    ->disabled(fn($get) => $get('applicability') !== 'specific')->options(function () {
                        $products = Product::where('category', 'fabric')
                            ->orderBy('name')->get();

                        $options = [];
                        foreach ($products as $product) {
                            $label = match ($product->name) {
                                'fabric_frame' => 'Fabric Frame',
                                'fabric_layout' => 'Fabric Layout',
                                'fabric_split' => 'Fabric Split',
                                default => ucfirst(str_replace('_', ' ', $product->name)), // Fallback readable label
                            };
                            $options[$product->id] = $label;
                        }
                        return $options;
                    }),
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
                // Tables\Columns\ImageColumn::make('thumbnail')
                //     ->label('Thumbnail')
                //     ->size(80),
                Tables\Columns\TextColumn::make('label')
                    ->searchable(),
                Tables\Columns\TextColumn::make('applicability')
                    ->label('Applicability')
                    ->getStateUsing(fn($record) => match ($record->applicability ?? null) {
                        'specific' => 'Specific',
                        'fabric' => 'Fabric',
                        // 'all' => 'All',
                        // 'canvas' => 'Canvas',
                        // 'photo' => 'Photo',
                        default => '—',
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('product.name')
                    ->label('Product')
                    ->sortable()
                    ->searchable()
                    ->getStateUsing(fn($record) => match ($record->product->name ?? null) {
                        'fabric_frame' => 'Fabric Frame',
                        'fabric_layout' => 'Fabric Layout',
                        'fabric_split' => 'Fabric Split',
                        default => '—',
                    }),

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
                ActionGroup::make([
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\ViewAction::make(),
                    Tables\Actions\DeleteAction::make(),
                ]),
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
            'index' => Pages\ListProductTypes::route('/'),
            'create' => Pages\CreateProductType::route('/create'),
            'view' => Pages\ViewProductType::route('/{record}'),
            'edit' => Pages\EditProductType::route('/{record}/edit'),
            'productVariationPricing' => Pages\ManageProductVariationPricing::route('/{record}/product-variation-pricing'),
        ];
    }
}
