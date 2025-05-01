<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CustomerUploadedImageResource\Pages;
use App\Filament\Resources\CustomerUploadedImageResource\RelationManagers;
use App\Models\Customer;
use App\Models\CustomerUploadedImage;
use Filament\Forms;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\ActionGroup;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class CustomerUploadedImageResource extends Resource
{
    protected static ?string $model = CustomerUploadedImage::class;

    protected static ?string $navigationGroup = 'Customer Management';
    protected static ?int $navigationSort = 3;
    protected static ?string $navigationIcon = 'heroicon-s-photo';
    protected static ?string $activeNavigationIcon = 'heroicon-o-photo';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('customer_id')
                    ->label('Customer')
                    ->searchable()
                    // ->disabled()
                    ->options(Customer::all()->pluck('name', 'id'))
                    ->native(false)
                    ->placeholder('Select a customer')
                    ->required(),

                Forms\Components\TextInput::make('title')
                    ->maxLength(255),
                Forms\Components\Select::make('status')
                    ->label('Status')
                    ->options([
                        'active' => 'Active',
                        'inactive' => 'Inactive',
                    ])
                    ->default('active')
                    ->native(false),
                Forms\Components\FileUpload::make('image_path')
                    ->label('Image')
                    ->imageEditor()
                    ->image()
                    ->required()
                    ->imageEditorAspectRatios([
                        '6:8',
                        '6:9',
                    ])
                    ->directory('CustomerUploadedImages'),
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

                Tables\Columns\ImageColumn::make('image_path')
                    // ->circular()
                    ->size(150)
                    ->label('Image'),
                Tables\Columns\TextColumn::make('customer.name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('title')
                    ->searchable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'Inactive' => 'warning',
                        'Active' => 'success',
                        'Suspended' => 'danger',
                    })
                    ->label('Status'),

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
            'index' => Pages\ListCustomerUploadedImages::route('/'),
            'create' => Pages\CreateCustomerUploadedImage::route('/create'),
            'view' => Pages\ViewCustomerUploadedImage::route('/{record}'),
            'edit' => Pages\EditCustomerUploadedImage::route('/{record}/edit'),
        ];
    }
}
