<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FrameColourResource\Pages;
use App\Filament\Resources\FrameColourResource\RelationManagers;
use App\Models\FrameColour;
use App\Models\Product;
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

class FrameColourResource extends Resource
{
    protected static ?string $model = FrameColour::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?string $navigationGroup = 'Attribute Management';
    protected static ?int $navigationSort = 5;


    protected static SubNavigationPosition $subNavigationPosition = SubNavigationPosition::Top;

    public static function getRecordSubNavigation(Page $page): array
    {
        return $page->generateNavigationItems([
            Pages\ViewFrameColour::class,
            Pages\EditFrameColour::class,
            Pages\ManageProductVariationPricing::class,
        ]);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),

                Forms\Components\FileUpload::make('thumbnail')
                    ->label('Thumbnail')
                    ->imageEditor()
                    ->image()
                    ->required()
                    ->imageEditorAspectRatios([
                        '6:8',
                        '6:9',
                    ])
                    ->directory('FrameColourThumbnail'),
                Forms\Components\Select::make('applicability')
                    ->label('Applicability')
                    ->required()
                    ->reactive()
                    ->options([
                        // 'all' => 'All',
                        // 'canvas' => 'Canvas',
                        'fabric' => 'Fabric',
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
                        $products = Product::whereIn('category', ['photo', 'fabric'])
                            ->orderBy('name')->get();

                        $options = [];
                        foreach ($products as $product) {
                            $label = match ($product->name) {
                                'photo_frame' => 'Photo Frame',
                                'photo_layout' => 'Photo Layout',
                                'photo_split' => 'Photo Split',
                                'photo_tiles' => 'Photo Tiles',
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
                Tables\Columns\ImageColumn::make('thumbnail')
                    ->label('Thumbnail')
                    ->size(80),
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('applicability')
                    ->label('Applicability')
                    ->getStateUsing(fn($record) => match ($record->applicability ?? null) {
                        'all' => 'All',
                        'specific' => 'Specific',
                        // 'canvas' => 'Canvas',
                        'fabric' => 'Fabric',
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
                        'fabric_frame' => 'Fabric Frame',
                        'fabric_layout' => 'Fabric Layout',
                        'fabric_split' => 'Fabric Split',
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
            'index' => Pages\ListFrameColours::route('/'),
            'create' => Pages\CreateFrameColour::route('/create'),
            'view' => Pages\ViewFrameColour::route('/{record}'),
            'edit' => Pages\EditFrameColour::route('/{record}/edit'),
            'productVariationPricing' => Pages\ManageProductVariationPricing::route('/{record}/product-variation-pricing'),
        ];
    }
}
