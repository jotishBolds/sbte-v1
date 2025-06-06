<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource\RelationManagers;
use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use App\Models\SavedDesign;
use App\Models\ShippingType;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Forms\Components\{Select, TextInput, Toggle, Repeater, Group, Grid, Section};
use Filament\Forms\Get;
use Filament\Pages\SubNavigationPosition;
use Filament\Pages\Page;
use Filament\Tables\Columns\TextColumn;
use Filament\Infolists\Infolist;
// use Filament\Infolists\Components\{TextEntry, RepeatableEntry, ImageEntry, Section as ComponentsSection};
use Filament\Infolists\Components\{
    Section as ComponentsSection,
    TextEntry,
    RepeatableEntry,
    ImageEntry,
};
use Illuminate\Support\Str;


class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?string $navigationGroup = 'Order Management';

    protected static SubNavigationPosition $subNavigationPosition = SubNavigationPosition::Top;

    public static function getRecordSubNavigation(Page $page): array
    {
        return $page->generateNavigationItems([
            Pages\ViewOrder::class,
            Pages\EditOrder::class,
            // Pages\ManagePackageTravelPeriods::class,
            // Pages\ManagePackageDiscountPercentages::class,
        ]);
    }


    public static function updateTotalAmount(callable $get, callable $set): void
    {
        $items = $get('items') ?? [];
        $shippingTypeId = $get('shipping_type_id');

        $totalAmount = 0;

        foreach ($items as $index => $item) {
            $savedDesignId = $item['saved_design_id'] ?? null;
            $quantity = (int) ($item['quantity'] ?? 1);

            if (!$savedDesignId) {
                $set("items.$index.total_price", 0);
                continue;
            }

            $savedDesign = SavedDesign::with([
                'productVariation.product',
                'attributes'
            ])->find($savedDesignId);

            if (!$savedDesign) {
                $set("items.$index.total_price", 0);
                continue;
            }

            $variation = $savedDesign->productVariation;
            $product   = $variation->product;

            $basePrice = $variation->price ?? 0;
            $attributeTotal = 0;

            foreach ($savedDesign->attributes as $attr) {
                $price = app(\App\Services\AttributePriceResolver::class)
                    ->resolve($attr->attribute_name, $attr->attribute_value, $variation);

                $attributeTotal += $price;
            }

            $unitPrice = $basePrice + $attributeTotal;
            $itemTotal = $unitPrice * $quantity;

            // Set individual design total price in repeater item state
            $set("items.$index.total_price", $itemTotal);

            // Add to total order amount
            $totalAmount += $itemTotal;
        }

        // Add shipping price if selected
        if ($shippingTypeId) {
            $shippingPrice = ShippingType::find($shippingTypeId)?->price ?? 0;
            $totalAmount += $shippingPrice;
        }

        $set('total_amount', $totalAmount);
    }


    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Order Details')
                ->columns(2)
                ->schema([
                    Select::make('customer_id')
                        ->label('Customer')
                        ->relationship('customer', 'name')
                        ->searchable()
                        ->preload()
                        ->reactive()
                        ->native(false)
                        ->required(),

                    Select::make('shipping_type_id')
                        ->label('Shipping Type')
                        ->relationship('shippingType', 'name')
                        ->native(false)
                        ->required()
                        ->disabledOn('edit')
                        ->reactive()
                        ->afterStateUpdated(function ($state, callable $get, callable $set) {
                            self::updateTotalAmount($get, $set);
                        }),

                    Section::make('Order Items (Select from Saved Designs)')
                        ->hiddenOn('edit')
                        ->schema([

                            Repeater::make('items')
                                ->label('')
                                ->reactive()
                                ->schema([
                                    Forms\Components\Select::make('saved_design_id')
                                        ->label('Saved Design')
                                        ->searchable()
                                        ->preload()
                                        ->options(function (Get $get) {
                                            $customerId = $get('../../customer_id');
                                            $query = SavedDesign::with('productVariation.product');
                                            if ($customerId) {
                                                $query->where('customer_id', $customerId)->where('status', 'Carted');
                                            }
                                            return $query->get()->mapWithKeys(function ($design) {
                                                $product = $design->productVariation->product;
                                                $variationLabel = $design->productVariation->label;
                                                $productName = ucfirst(str_replace('_', ' ', $product->name));
                                                $createdAt = $design->created_at->format('Y-m-d H:i');
                                                return [$design->id => "{$productName} ({$variationLabel}) — Saved At: {$createdAt}"];
                                            })->toArray();
                                        })
                                        ->native(false)
                                        ->placeholder('Select a saved design')
                                        ->required()
                                        ->reactive(),

                                    TextInput::make('quantity')
                                        ->numeric()
                                        ->required()
                                        ->default(1)
                                        ->reactive(),
                                    TextInput::make('total_price')
                                        ->label('Total Price')
                                        ->disabled()
                                        ->numeric()
                                        ->reactive()
                                        ->dehydrated(false),
                                ])
                                ->minItems(1)
                                ->columns(3)
                                ->addActionLabel('Add saved design to order item')
                                ->columnSpanFull()
                                ->afterStateUpdated(function ($state, callable $get, callable $set) {
                                    self::updateTotalAmount($get, $set);
                                }),


                        ]),

                    TextInput::make('total_amount')
                        ->label('Total Amount')
                        ->numeric()
                        ->required()
                        ->default(0)
                        ->reactive()
                        ->disabled()
                        ->dehydrated(true),
                    Select::make('order_status')
                        ->label('Order Status')
                        ->options([
                            'pending' => 'Pending',
                            'processing' => 'Processing',
                            'shipped' => 'Shipped',
                            'delivered' => 'Delivered',
                            'canceled' => 'Canceled',
                            'returned' => 'Returned',
                        ])
                        ->default('pending')
                        ->native(false)
                        ->required(),
                    Select::make('payment_status')
                        ->label('Payment Status')
                        ->options([
                            'pending' => 'Pending',
                            'paid' => 'Paid',
                            'failed' => 'Failed',
                            'refunded' => 'Refunded',
                        ])
                        ->default('pending')
                        ->native(false)
                        ->required(),
                ])->columnSpanFull(),




            Section::make('Shipping Details')
                ->schema([
                    Grid::make(2)->schema([
                        Select::make('address')
                            ->label('Select Address')
                            ->searchable()
                            ->preload()
                            ->reactive()
                            ->options(function (Get $get) {
                                $customerId = $get('customer_id');

                                if (!$customerId) {
                                    return [];
                                }

                                return Address::where('customer_id', $customerId)
                                    ->get()
                                    ->mapWithKeys(function ($address) {
                                        $label = implode(', ', array_filter([
                                            $address->title,
                                            $address->recipient_name,
                                            $address->phone_number,
                                            $address->alternate_phone,
                                            $address->address_line_1,
                                            $address->address_line_2,
                                            $address->city,
                                            $address->state,
                                            $address->postal_code,
                                            $address->country,
                                        ]));

                                        return [$address->id => $label];
                                    })
                                    ->toArray();
                            })
                            ->afterStateUpdated(function ($state, callable $set) {
                                if (!$state) {
                                    $set('shipping_address.recipient_name', null);
                                    $set('shipping_address.phone_number', null);
                                    $set('shipping_address.alternate_phone', null);
                                    $set('shipping_address.address_line_1', null);
                                    $set('shipping_address.address_line_2', null);
                                    $set('shipping_address.city', null);
                                    $set('shipping_address.state', null);
                                    $set('shipping_address.postal_code', null);
                                    $set('shipping_address.country', null);
                                    return;
                                }

                                $address = Address::find($state);
                                if (!$address) return;

                                $set('shipping_address.recipient_name', $address->recipient_name);
                                $set('shipping_address.phone_number', $address->phone_number);
                                $set('shipping_address.alternate_phone', $address->alternate_phone);
                                $set('shipping_address.address_line_1', $address->address_line_1);
                                $set('shipping_address.address_line_2', $address->address_line_2);
                                $set('shipping_address.city', $address->city);
                                $set('shipping_address.state', $address->state);
                                $set('shipping_address.postal_code', $address->postal_code);
                                $set('shipping_address.country', $address->country);
                            })
                            ->dehydrated(false), // Don't persist this select field

                        TextInput::make('shipping_address.recipient_name')->required(),
                        TextInput::make('shipping_address.phone_number')->required(),
                        TextInput::make('shipping_address.alternate_phone'),
                        TextInput::make('shipping_address.address_line_1')->required(),
                        TextInput::make('shipping_address.address_line_2'),
                        TextInput::make('shipping_address.city')->required(),
                        TextInput::make('shipping_address.state')->required(),
                        TextInput::make('shipping_address.postal_code')->required(),
                        TextInput::make('shipping_address.country')->required(),
                        Toggle::make('is_same_billing_shipping')
                            ->label('Billing Same as Shipping')
                            ->reactive()
                            ->inline(false)
                            ->default(true),
                    ]),
                ])->columnSpanFull(),


            Section::make('Billing Address Details')
                ->schema([
                    Grid::make(2)->schema([
                        Select::make('addressBilling')
                            ->label('Select Address')
                            ->searchable()
                            ->preload()
                            ->reactive()
                            ->options(function (Get $get) {
                                $customerId = $get('customer_id');

                                if (!$customerId) {
                                    return [];
                                }

                                return Address::where('customer_id', $customerId)
                                    ->get()
                                    ->mapWithKeys(function ($address) {
                                        $label = implode(', ', array_filter([
                                            $address->title,
                                            $address->recipient_name,
                                            $address->phone_number,
                                            $address->alternate_phone,
                                            $address->address_line_1,
                                            $address->address_line_2,
                                            $address->city,
                                            $address->state,
                                            $address->postal_code,
                                            $address->country,
                                        ]));

                                        return [$address->id => $label];
                                    })
                                    ->toArray();
                            })
                            ->afterStateUpdated(function ($state, callable $set) {
                                if (!$state) {
                                    $set('billing_address.recipient_name', null);
                                    $set('billing_address.phone_number', null);
                                    $set('billing_address.alternate_phone', null);
                                    $set('billing_address.address_line_1', null);
                                    $set('billing_address.address_line_2', null);
                                    $set('billing_address.city', null);
                                    $set('billing_address.state', null);
                                    $set('billing_address.postal_code', null);
                                    $set('billing_address.country', null);
                                    return;
                                }

                                $address = Address::find($state);
                                if (!$address) return;

                                $set('billing_address.recipient_name', $address->recipient_name);
                                $set('billing_address.phone_number', $address->phone_number);
                                $set('billing_address.alternate_phone', $address->alternate_phone);
                                $set('billing_address.address_line_1', $address->address_line_1);
                                $set('billing_address.address_line_2', $address->address_line_2);
                                $set('billing_address.city', $address->city);
                                $set('billing_address.state', $address->state);
                                $set('billing_address.postal_code', $address->postal_code);
                                $set('billing_address.country', $address->country);
                            })
                            ->dehydrated(false), // Don't persist this select field

                        TextInput::make('billing_address.recipient_name')->required(),
                        TextInput::make('billing_address.phone_number')->required(),
                        TextInput::make('billing_address.alternate_phone'),
                        TextInput::make('billing_address.address_line_1')->required(),
                        TextInput::make('billing_address.address_line_2'),
                        TextInput::make('billing_address.city')->required(),
                        TextInput::make('billing_address.state')->required(),
                        TextInput::make('billing_address.postal_code')->required(),
                        TextInput::make('billing_address.country')->required(),
                    ]),
                ])
                ->visible(fn($get) => !$get('is_same_billing_shipping')),
        ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        // dd($infolist->record->orderItems->first()->productVariation->product->name);
        return $infolist
            ->schema([
                // Order Details
                ComponentsSection::make('Order Details')
                    ->columns([
                        "sm" => "2",
                        "md" => "3",
                        "default" => "1",
                    ])
                    ->schema([
                        TextEntry::make('id')->label('Order ID')->columnSpan(1),
                        TextEntry::make('customer.name')->label('Customer Name')->columnSpan(1),
                        TextEntry::make('shippingType.name')->label('Shipping Type')->columnSpan(1),

                        TextEntry::make('total_amount')->label('Total Amount')->money('INR')->columnSpan(1),
                        TextEntry::make('order_status')->label('Order Status')->columnSpan(1)
                            ->badge()
                            ->formatStateUsing(fn(string $state) => strtoupper($state))
                            ->color(fn(string $state): string => match ($state) {
                                'pending' => 'warning',
                                'processing' => 'info',
                                'shipped' => 'primary',
                                'delivered' => 'success',
                                'canceled' => 'danger',
                                'returned' => 'gray',
                                default => 'secondary',
                            }),
                        TextEntry::make('payment_status')
                            ->label('Payment Status')
                            ->columnSpan(1)
                            ->badge()
                            ->formatStateUsing(fn(string $state) => strtoupper($state))
                            ->color(fn(string $state): string => match ($state) {
                                'pending' => 'warning',
                                'paid' => 'success',
                                'failed' => 'danger',
                                'refunded' => 'gray',
                                default => 'secondary',
                            }),

                        TextEntry::make('created_at')->label('Created At')->dateTime()->columnSpanFull(),
                    ]),

                // Order Items
                ComponentsSection::make('Order Items')
                    ->schema([
                        RepeatableEntry::make('orderItems')
                            ->label('')
                            ->schema([
                                TextEntry::make('productVariation.product.name')->label('Product')->columnSpan(1)
                                    ->formatStateUsing(
                                        fn(string $state): string => Str::of($state)->replace('_', ' ')->title()
                                    ),
                                TextEntry::make('productVariation.label')->label('Variation')->columnSpan(1),
                                TextEntry::make('quantity')->columnSpan(1),

                                TextEntry::make('unit_price')->label('Unit Price')->money('INR')->columnSpan(1),
                                TextEntry::make('total_price')->label('Total Price')->money('INR')->columnSpan(1),

                                RepeatableEntry::make('attributes')
                                    ->label('Attributes')
                                    ->schema([
                                        TextEntry::make('attribute_name')->label('Attribute')
                                            ->formatStateUsing(function (string $state): string {
                                                return match ($state) {
                                                    'product_type_id' => 'Product Type',
                                                    'image_effect_id' => 'Image Effect',
                                                    'edge_design_id' => 'Edge Design',
                                                    'frame_colour_id' => 'Frame Colour',
                                                    'frame_thickness_id' => 'Frame Thickness',
                                                    'frame_type_id' => 'Frame Type',
                                                    'floating_frame_colour_id' => 'Floating Frame Colour',
                                                    'acrylic_cover' => 'Acrylic Cover',
                                                    'hanging_mechanism' => 'Hanging Mechanism',
                                                    'hanging_mechanism_variety_id' => 'Hanging Mechanism Variety',
                                                    default => Str::of($state)->replace('_', ' ')->title(),
                                                };
                                            }),
                                        TextEntry::make('attribute_value')->label('Value')
                                            ->formatStateUsing(function ($record, $state) {
                                                // dd($record);
                                                $map = [
                                                    'image_effect_id' => \App\Models\ImageEffect::class,
                                                    'edge_design_id' => \App\Models\EdgeDesign::class,
                                                    'frame_colour_id' => \App\Models\FrameColour::class,
                                                    'frame_thickness_id' => \App\Models\FrameThickness::class,
                                                    'frame_type_id' => \App\Models\FrameType::class,
                                                    'floating_frame_colour_id' => \App\Models\FloatingFrameColour::class,
                                                    'product_type_id' => \App\Models\ProductType::class,
                                                    'hanging_mechanism_variety_id' => \App\Models\HangingMechanismVariety::class,
                                                ];

                                                $attributeName = $record?->attribute_name;
                                                if (in_array($attributeName, ['acrylic_cover', 'hanging_mechanism'])) {
                                                    return $state == 'yes' ? 'Yes' : 'No';
                                                }

                                                if (isset($map[$attributeName])) {
                                                    return $map[$attributeName]::find($state)?->name ?? 'N/A';
                                                }

                                                return $state;
                                            }),
                                    ])
                                    ->columns([
                                        "sm" => "2",
                                        "default" => "1",
                                    ])
                                    ->columnSpanFull(),

                                RepeatableEntry::make('images')
                                    ->label('Images')
                                    ->schema([
                                        TextEntry::make('position')->label('Position'),
                                        ImageEntry::make('image_url')
                                            ->label('Image')
                                            ->disk('public')
                                            ->visibility('public')
                                            ->width(100)
                                            ->height(100),
                                    ])
                                    ->columns([
                                        "sm" => "2",
                                        "default" => "1",
                                    ])->columnSpanFull(),
                            ])
                            ->columns([
                                "sm" => "2",
                                "md" => "3",
                                "default" => "1",
                            ]),
                    ]),

                // Shipping Address
                ComponentsSection::make('Shipping Address')
                    ->columns([
                        "sm" => "2",
                        "md" => "3",
                        "default" => "1",
                    ])
                    ->schema([
                        TextEntry::make('shippingAddress.recipient_name')->label('Full Name'),
                        TextEntry::make('shippingAddress.phone_number')->label('Phone'),
                        TextEntry::make('shippingAddress.tracking_number')->label('Tracking Number'),

                        TextEntry::make('shippingAddress.address_line_1')->label('Address Line 1'),
                        TextEntry::make('shippingAddress.address_line_2')->label('Address Line 2'),

                        TextEntry::make('shippingAddress.city')->label('City'),
                        TextEntry::make('shippingAddress.state')->label('State'),
                        TextEntry::make('shippingAddress.postal_code')->label('Postal Code'),

                        TextEntry::make('shippingAddress.country')->label('Country'),
                        TextEntry::make('shippingAddress.shipping_status')->label('Shipping Status')
                            ->badge()
                            ->formatStateUsing(fn(string $state) => strtoupper($state))
                            ->color(fn(string $state): string => match ($state) {
                                'pending' => 'warning',
                                // 'in_transit' => 'info',
                                'in_transit' => 'primary',
                                'delivered' => 'success',
                                'failed' => 'danger',
                                // 'returned' => 'gray',
                                default => 'secondary',
                            }),
                    ]),

                // Billing Address
                ComponentsSection::make('Billing Address')
                    ->columns([
                        "sm" => "2",
                        "md" => "3",
                        "default" => "1",
                    ])
                    ->visible(function ($record) {
                        return !$record->is_same_billing_shipping;
                    })
                    ->schema([
                        TextEntry::make('billingAddress.recipient_name')->label('Full Name'),
                        TextEntry::make('billingAddress.phone_number')->label('Phone'),

                        TextEntry::make('billingAddress.address_line_1')->label('Address Line 1'),
                        TextEntry::make('billingAddress.address_line_2')->label('Address Line 2'),

                        TextEntry::make('billingAddress.city')->label('City'),
                        TextEntry::make('billingAddress.state')->label('State'),
                        TextEntry::make('billingAddress.postal_code')->label('Postal Code'),

                        TextEntry::make('billingAddress.country')->label('Country'),
                    ]),
            ]);
    }


    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('customer.name'),
                Tables\Columns\TextColumn::make('total_amount'),
                TextColumn::make('order_status')
                    ->badge()
                    ->formatStateUsing(fn(string $state) => strtoupper($state))
                    ->color(fn(string $state): string => match ($state) {
                        'pending' => 'warning',
                        'processing' => 'info',
                        'shipped' => 'primary',
                        'delivered' => 'success',
                        'canceled' => 'danger',
                        'returned' => 'gray',
                        default => 'secondary',
                    }),

                TextColumn::make('payment_status')
                    ->badge()
                    ->formatStateUsing(fn(string $state) => strtoupper($state))
                    ->color(fn(string $state): string => match ($state) {
                        'pending' => 'warning',
                        'paid' => 'success',
                        'failed' => 'danger',
                        'refunded' => 'gray',
                        default => 'secondary',
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
            'index' => Pages\ListOrders::route('/'),
            'create' => Pages\CreateOrder::route('/create'),
            'view' => Pages\ViewOrder::route('/{record}'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }
}
