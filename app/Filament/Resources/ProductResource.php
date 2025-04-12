<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Filament\Resources\ProductResource\RelationManagers;
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

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;
    protected static ?string $navigationIcon = 'heroicon-s-printer';
    protected static ?string $activeNavigationIcon = 'heroicon-o-printer';
    protected static ?string $navigationGroup = 'Product Management';
    protected static ?int $navigationSort = 1;
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('name')
                    ->label('Product Name')
                    ->options([
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
                    ])
                    ->required()
                    ->native(false)
                    ->unique(ignoreRecord: true),

                Forms\Components\Select::make('category')
                    ->label('Category')
                    ->options([
                        'canvas' => 'Canvas',
                        'fabric' => 'Fabric',
                        'photo' => 'Photo',
                    ])
                    ->required()
                    ->native(false),

                Forms\Components\Select::make('type')
                    ->label('Type')
                    ->options([
                        'size' => 'Size',
                        'layout' => 'Layout',
                    ])
                    ->required()
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
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->label('Product Name')
                    ->sortable()
                    ->searchable()
                    ->state(function ($record) {
                        if ($record->name == 'canvas_print') {
                            return 'Canvas Print';
                        } elseif ($record->name == 'canvas_layout') {
                            return 'Canvas Layout';
                        } elseif ($record->name == 'canvas_split') {
                            return 'Canvas Split';
                        } elseif ($record->name == 'fabric_frame') {
                            return 'Fabric Frame';
                        } elseif ($record->name == 'fabric_layout') {
                            return 'Fabric Layout';
                        } elseif ($record->name == 'fabric_split') {
                            return 'Fabric Split';
                        } elseif ($record->name == 'photo_frame') {
                            return 'Photo Frame';
                        } elseif ($record->name == 'photo_layout') {
                            return 'Photo Layout';
                        } elseif ($record->name == 'photo_split') {
                            return 'Photo Split';
                        } elseif ($record->name == 'photo_tiles') {
                            return 'Photo Tiles';
                        } else {
                            return 'Unknown Product';
                        }
                    }),

                Tables\Columns\TextColumn::make('category')
                    ->sortable()
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'Fabric' => 'fabric',
                        'Photo' => 'staff',
                        'Canvas' => 'danger',
                        default => 'gray',
                    })
                    ->state(function ($record) {
                        return match ($record->category) {
                            null => 'Unknown Category',
                            'canvas' => 'Canvas',
                            'fabric' => 'Fabric',
                            'photo' => 'Photo',
                            default => 'Unknown Category',
                        };
                    }),

                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'Size' => 'success',
                        'Layout' => 'warning',
                        default => 'gray',
                    })
                    ->state(function ($record) {
                        return match ($record->type) {
                            null => 'Unknown Type',
                            'size' => 'Size',
                            'layout' => 'Layout',
                            default => 'Unknown Type',
                        };
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created At')
                    ->dateTime()
                    ->sortable(),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Updated At')
                    ->dateTime()
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
                ActionGroup::make([
                    Tables\Actions\EditAction::make(),
                    // Tables\Actions\ViewAction::make(),
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
            'index' => Pages\ListProducts::route('/'),
            // 'create' => Pages\CreateProduct::route('/create'),
            // 'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
