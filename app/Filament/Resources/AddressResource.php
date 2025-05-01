<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AddressResource\Pages;
use App\Filament\Resources\AddressResource\RelationManagers;
use App\Models\Address;
use App\Models\Customer;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\ActionGroup;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class AddressResource extends Resource
{
    protected static ?string $model = Address::class;

    // protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?string $navigationGroup = 'Customer Management';
    protected static ?int $navigationSort = 2;
    protected static ?string $navigationIcon = 'heroicon-s-map-pin';
    protected static ?string $activeNavigationIcon = 'heroicon-o-map-pin';


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
                    // ->required()
                    ->maxLength(100),
                Forms\Components\TextInput::make('recipient_name')
                    ->label('Recipient Name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('phone_number')
                    ->tel()
                    ->label('Phone Number')
                    ->required()
                    ->maxLength(20),
                Forms\Components\TextInput::make('alternate_phone')
                    ->tel()
                    ->maxLength(20)
                    ->label('Alternate Number'),
                Forms\Components\Textarea::make('address_line_1')
                    ->required()
                    ->autosize()
                    ->label('Address Line 1')
                    ->columnSpanFull(),
                Forms\Components\Textarea::make('address_line_2')
                    ->label('Address Line 2')
                    ->autosize()
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('city')
                    ->required()
                    ->maxLength(100),
                Forms\Components\TextInput::make('state')
                    ->required()
                    ->maxLength(100),
                Forms\Components\TextInput::make('postal_code')
                    ->required()
                    ->label('Postal Code')
                    ->maxLength(20),
                Forms\Components\TextInput::make('country')
                    ->required()
                    ->maxLength(100),
                Forms\Components\Toggle::make('is_default')
                    ->label('Is Default')
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('customer.name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('title')
                    ->searchable(),
                Tables\Columns\TextColumn::make('recipient_name')
                    ->label('Recipient Name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('phone_number')
                    ->label('Phone Number')
                    ->searchable(),
                // Tables\Columns\TextColumn::make('alternate_phone')
                //     ->searchable(),
                // Tables\Columns\TextColumn::make('city')
                //     ->searchable(),
                // Tables\Columns\TextColumn::make('state')
                //     ->searchable(),
                Tables\Columns\TextColumn::make('postal_code')
                    ->label('Postal Code')
                    ->searchable(),
                // Tables\Columns\TextColumn::make('country')
                //     ->searchable(),
                Tables\Columns\ToggleColumn::make('is_default')
                    ->label('Is Default'),
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
            'index' => Pages\ListAddresses::route('/'),
            'create' => Pages\CreateAddress::route('/create'),
            'view' => Pages\ViewAddress::route('/{record}'),
            'edit' => Pages\EditAddress::route('/{record}/edit'),
        ];
    }
}
