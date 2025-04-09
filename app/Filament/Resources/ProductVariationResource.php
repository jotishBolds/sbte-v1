<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductVariationResource\Pages;
use App\Filament\Resources\ProductVariationResource\RelationManagers;
use App\Models\ProductVariation;
use Filament\Forms;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Forms\Components\Section;
use Filament\Tables\Actions\ActionGroup;

class ProductVariationResource extends Resource
{
    protected static ?string $model = ProductVariation::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?string $navigationGroup = 'Product Management';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('')
                    // ->description('Specify the layout details for the product variation')
                    ->columns([
                        'lg' => 2,
                        'default' => 1,
                    ])
                    ->schema([

                        Forms\Components\Select::make('product_id')
                            ->label('Product')
                            ->relationship('product', 'name')
                            ->native(false)
                            ->getOptionLabelFromRecordUsing(fn($record) => match ($record->name) {
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
                            })
                            ->reactive()
                            ->afterStateUpdated(fn($state, callable $set) => $set('product_type', \App\Models\Product::find($state)?->type)),
                        Forms\Components\Hidden::make('product_type')
                            ->reactive()
                            ->dehydrated(false)
                            ->afterStateHydrated(function ($state, callable $set, $record) {
                                if ($record && $record->product) {
                                    $set('product_type', $record->product->type);
                                }
                            }),

                        Forms\Components\TextInput::make('label')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('horizontal_length')
                            ->label('Horizontal Length')
                            ->required()
                            ->numeric(),
                        Forms\Components\TextInput::make('vertical_length')
                            ->label('Vertical Length')
                            ->required()
                            ->numeric(),
                        Forms\Components\Select::make('length_unit_id')
                            ->label('Length Unit')
                            ->relationship('lengthUnit', 'name')
                            ->native(false)
                            ->required(),
                        Forms\Components\TextInput::make('price')
                            ->required()
                            ->numeric(),
                        // ->prefix('$'),
                        Forms\Components\Select::make('status')
                            ->label('Status')
                            ->options([
                                'active' => 'Active',
                                'inactive' => 'Inactive',
                            ])
                            ->default('active')
                            ->native(false),
                    ]),
                Section::make('Layout Specifications')
                    ->description('Specify the layout details for the product variation')
                    ->visible(fn($get, $record) => ($get('product_type') === 'layout') || ($record?->product?->type === 'layout'))
                    ->columns([
                        'lg' => 2,
                        'default' => 1,
                    ])
                    ->schema([
                        Forms\Components\FileUpload::make('product_variation_layout_details.thumbnail')
                            ->label('Thumbnail')
                            ->imageEditor()
                            ->image()
                            ->required()
                            ->afterStateHydrated(function (Forms\Components\FileUpload $component) {
                                $record = $component->getContainer()->getParentComponent()->getRecord();
                                $thumbnail = $record?->layoutDetail?->thumbnail;

                                if ($thumbnail) {
                                    $component->state([$thumbnail]);
                                }
                            })
                            ->imageEditorAspectRatios([
                                '6:8',
                                '6:9',
                            ])
                            ->directory('LayoutThumbnail')
                            ->visible(fn($get, $record) => ($get('product_type') === 'layout') || ($record?->product?->type === 'layout')),
                        Forms\Components\TextInput::make('product_variation_layout_details.image_count')
                            ->label('Image Count')
                            ->numeric()
                            ->required()
                            ->afterStateHydrated(function (TextInput $component, $state) {
                                if ($record = $component->getContainer()->getParentComponent()->getRecord()) {
                                    $component->state(
                                        $record->layoutDetail?->image_count
                                    );
                                }
                            })
                            ->visible(fn($get, $record) => ($get('product_type') === 'layout') || ($record?->product?->type === 'layout')),

                    ])

            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('product.name')
                    ->label('Product')
                    ->sortable()
                    ->searchable()
                    ->formatStateUsing(fn($state) => match ($state) {
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
                    }),


                Tables\Columns\TextColumn::make('label')
                    ->searchable()
                    ->wrap(),
                Tables\Columns\TextColumn::make('horizontal_length')
                    ->label('Horizontal')
                    ->numeric()
                    ->sortable(),

                Tables\Columns\TextColumn::make('vertical_length')
                    ->label('Vertical')
                    ->numeric()
                    ->sortable(),

                Tables\Columns\TextColumn::make('lengthUnit.name')
                    ->label('Length Unit')
                    ->sortable(),

                Tables\Columns\TextColumn::make('price')
                ->label('Base Price')
                    // ->money('USD')
                    ->sortable(),

                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'success' => 'active',
                        'danger' => 'inactive',
                    ])
                    ->sortable(),

                // Show image count if layoutDetail exists
                Tables\Columns\TextColumn::make('layoutDetail.image_count')
                    ->label('Image Count')
                    ->sortable()
                    ->toggleable(),

                // Show layout thumbnail as image if exists
                Tables\Columns\ImageColumn::make('layoutDetail.thumbnail')
                    ->label('Thumbnail')
                    ->toggleable(),

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
                ])
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
            'index' => Pages\ListProductVariations::route('/'),
            'create' => Pages\CreateProductVariation::route('/create'),
            'view' => Pages\ViewProductVariation::route('/{record}'),
            'edit' => Pages\EditProductVariation::route('/{record}/edit'),
        ];
    }
}
