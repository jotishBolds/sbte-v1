<?php

namespace App\Filament\Resources\ProductTypeResource\Pages;

use App\Filament\Resources\ProductTypeResource;
use App\Models\Product;
use Filament\Actions;
use Filament\Forms;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Form;
use Filament\Resources\Pages\ManageRelatedRecords;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ManageProductVariationPricing extends ManageRelatedRecords
{
    protected static string $resource = ProductTypeResource::class;
    protected static ?string $label = 'Product Variation Pricing';
    protected static string $relationship = 'productTypes';
    protected static ?string $navigationIcon = 'heroicon-o-currency-dollar';

    public static function getNavigationLabel(): string
    {
        return 'Product Variation Pricing';
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('product_variation_id')
                    ->label('Product Variation')
                    ->options(function () {
                        $productType = $this->getOwnerRecord(); // The parent productType
                        $applicability = $productType->applicability;
                        $productId = $productType->product_id;

                        $query = Product::query()
                            ->with(['productVariations' => function ($q) {
                                $q->orderBy('label');
                            }])
                            ->orderBy('name');

                        if (in_array($applicability, ['fabric'])) {
                            $query->where('category', $applicability);
                        } elseif ($applicability === 'specific' && $productId) {
                            $query->where('id', $productId);
                        }

                        $products = $query->get();

                        $grouped = [];

                        foreach ($products as $product) {
                            $label = match ($product->name) {
                                // 'canvas_print' => 'Canvas Print',
                                // 'canvas_layout' => 'Canvas Layout',
                                // 'canvas_split' => 'Canvas Split',
                                'fabric_frame' => 'Fabric Frame',
                                'fabric_layout' => 'Fabric Layout',
                                'fabric_split' => 'Fabric Split',
                                // 'photo_frame' => 'Photo Frame',
                                // 'photo_layout' => 'Photo Layout',
                                // 'photo_split' => 'Photo Split',
                                // 'photo_tiles' => 'Photo Tiles',
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
                    ->rules([
                        function (callable $get) {
                            return \Illuminate\Validation\Rule::unique('product_variation_type_pricings', 'product_variation_id')
                                ->where(function ($query) use ($get) {
                                    return $query->where('product_type_id', $this->getOwnerRecord()->id);
                                })
                                ->ignore($this->record?->id);
                        }
                    ])
                    ->required(),

                Forms\Components\TextInput::make('price')
                    ->numeric()
                    ->default(0)
                    ->required(),

                Forms\Components\Select::make('status')
                    ->options([
                        'active' => 'Active',
                        'inactive' => 'Inactive',
                    ])
                    ->default('active')
                    ->native(false)
                    ->required(),
                DateTimePicker::make('created_at')
                    ->hiddenOn(['create', 'edit'])
                    ->displayFormat('Y-m-d H:i:s'),
                DateTimePicker::make('updated_at')
                    ->hiddenOn(['create', 'edit'])
                    ->displayFormat('Y-m-d H:i:s'),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            // ->recordTitleAttribute('id')
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
                    ->label('Created')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Updated')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()->label('New Product Variation Pricing'),
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
}
