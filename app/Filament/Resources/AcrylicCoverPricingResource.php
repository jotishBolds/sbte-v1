<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AcrylicCoverPricingResource\Pages;
use App\Filament\Resources\AcrylicCoverPricingResource\RelationManagers;
use App\Models\AcrylicCoverPricing;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\ActionGroup;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class AcrylicCoverPricingResource extends Resource
{
    protected static ?string $model = AcrylicCoverPricing::class;

    protected static ?string $navigationGroup = 'Attribute Management';
    protected static ?int $navigationSort = 12;
    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('applicability')
                    ->label('Applicability')
                    ->required()
                    ->reactive()
                    ->options([
                        // 'all' => 'All',
                        // 'canvas' => 'Canvas',
                        // 'fabric' => 'Fabric',
                        'photo' => 'Photo',
                        'specific' => 'Specific',
                    ])
                    ->native(false),

                Forms\Components\Select::make('product_id')
                    ->label('Product')
                    // ->relationship('product', 'name')
                    ->native(false)
                    ->hint('Select if selected applicability is "specific"')
                    ->required(fn($get) => $get('applicability') === 'specific')
                    ->disabled(fn($get) => $get('applicability') !== 'specific')
                    ->options(function () {
                        $products = Product::where('category', 'photo')
                            ->orderBy('name')->get();

                        $options = [];
                        foreach ($products as $product) {
                            $label = match ($product->name) {
                                'photo_frame' => 'Photo Frame',
                                'photo_layout' => 'Photo Layout',
                                'photo_split' => 'Photo Split',
                                'photo_tiles' => 'Photo Tiles',
                                default => ucfirst(str_replace('_', ' ', $product->name)), // Fallback readable label
                            };
                            $options[$product->id] = $label;
                        }
                        return $options;
                    }),
                // ->getOptionLabelFromRecordUsing(fn($record) => match ($record->name) {
                //     // 'canvas_print' => 'Canvas Print',
                //     // 'canvas_layout' => 'Canvas Layout',
                //     // 'canvas_split' => 'Canvas Split',
                //     // 'fabric_frame' => 'Fabric Frame',
                //     // 'fabric_layout' => 'Fabric Layout',
                //     // 'fabric_split' => 'Fabric Split',
                //     'photo_frame' => 'Photo Frame',
                //     'photo_layout' => 'Photo Layout',
                //     'photo_split' => 'Photo Split',
                //     'photo_tiles' => 'Photo Tiles',
                //     default => 'Unknown Product',
                // }),
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
                Tables\Columns\TextColumn::make('applicability')
                    ->label('Applicability')
                    ->getStateUsing(fn($record) => match ($record->applicability ?? null) {
                        // 'all' => 'All',
                        'specific' => 'Specific',
                        // 'canvas' => 'Canvas',
                        // 'fabric' => 'Fabric',
                        'photo' => 'Photo',
                        default => '—',
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('product.name')
                    ->label('Product')
                    ->sortable()
                    ->searchable()
                    ->getStateUsing(fn($record) => match ($record->product->name ?? null) {
                        // 'canvas_print' => 'Canvas Print',
                        // 'canvas_layout' => 'Canvas Layout',
                        // 'canvas_split' => 'Canvas Split',
                        // 'fabric_frame' => 'Fabric Frame',
                        // 'fabric_layout' => 'Fabric Layout',
                        // 'fabric_split' => 'Fabric Split',
                        'photo_frame' => 'Photo Frame',
                        'photo_layout' => 'Photo Layout',
                        'photo_split' => 'Photo Split',
                        'photo_tiles' => 'Photo Tiles',
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
            'index' => Pages\ListAcrylicCoverPricings::route('/'),
            'create' => Pages\CreateAcrylicCoverPricing::route('/create'),
            'view' => Pages\ViewAcrylicCoverPricing::route('/{record}'),
            'edit' => Pages\EditAcrylicCoverPricing::route('/{record}/edit'),
        ];
    }
}
