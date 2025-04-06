<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Filament\Resources\UserResource\RelationManagers;
use App\Models\User;
use Carbon\Carbon;
use Filament\Forms;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Tables\Actions\ActionGroup;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationGroup = 'User Management';
    protected static ?int $navigationSort = 1;
    protected static ?string $navigationIcon = 'heroicon-s-user-group';
    protected static ?string $activeNavigationIcon = 'heroicon-o-user-group';
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('role')
                    ->native(false)
                    ->options([
                        'Admin' => 'Admin',
                        'Staff' => 'Staff',
                        'Customer' => 'Customer',
                    ])
                    ->reactive()
                    ->required(),
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('email')
                    ->email()
                    ->required()
                    ->maxLength(255),
                Forms\Components\DateTimePicker::make('email_verified_at'),
                Forms\Components\TextInput::make('password')
                    ->password()
                    ->revealable()
                    ->required()
                    ->hiddenon(['edit', 'view'])
                    ->maxLength(255),
                Forms\Components\Select::make('status')
                    ->native(false)
                    ->options([
                        'Active' => 'Active',
                        'Inactive' => 'Inactive',
                        'Suspended' => 'Suspended'
                    ])
                    ->default('Active'),
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
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->copyable()
                    ->copyMessage('Email address copied')
                    ->icon('heroicon-m-envelope'),

                Tables\Columns\TextColumn::make('email_verified_at')
                    ->label('Email Verified At')
                    // ->dateTime()
                    ->badge(function ($record) {
                        if ($record->email_verified_at == null)
                            return true;
                        else
                            return false;
                    })
                    ->color(function ($record) {
                        if ($record->email_verified_at == null)
                            return 'danger';
                        else
                            return false;
                    })
                    ->state(function ($record) {
                        if ($record->email_verified_at == null)
                            return "Not Verified";
                        else
                            return Carbon::parse($record->email_verified_at)->toDayDateTimeString();
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('role')
                    // ->size(TextColumn\TextColumnSize::Large)
                    // ->weight(FontWeight::Bold)
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'Admin' => 'admin',
                        'Staff' => "staff",
                        'Customer' => "customer",
                    })

                    ->label('Role'),
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
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            // 'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
