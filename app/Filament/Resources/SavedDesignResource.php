<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SavedDesignResource\Pages;
use App\Filament\Resources\SavedDesignResource\RelationManagers;
use App\Models\Customer;
use App\Models\Product;
use App\Models\SavedDesign;
use Filament\Forms;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\ActionGroup;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class SavedDesignResource extends Resource
{
    protected static ?string $model = SavedDesign::class;


    protected static ?string $navigationGroup = 'Customer Management';
    protected static ?int $navigationSort = 4;
    protected static ?string $navigationIcon = 'heroicon-s-printer';
    protected static ?string $activeNavigationIcon = 'heroicon-o-printer';

    public static function canAccess(): bool
    {
        return Auth::check() && Auth::user()->role === 'Customer';
    }
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Design Basic Detail')
                    // ->description('You can add attributes for the design below. To delete any attribute, click the delete button in the right')
                    ->schema([
                        Forms\Components\Select::make('customer_id')
                            ->label('Customer')
                            ->searchable()
                            ->options(Customer::all()->pluck('name', 'id'))
                            ->native(false)
                            ->placeholder('Select a customer')
                            ->required(),

                        Forms\Components\Select::make('product_variation_id')
                            ->label('Product Variation')
                            ->options(function () {
                                $products = Product::query()
                                    ->with(['productVariations' => function ($q) {
                                        $q->orderBy('label');
                                    }])
                                    ->orderBy('name')
                                    ->get();

                                $grouped = [];

                                foreach ($products as $product) {
                                    $label = match ($product->name) {
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
                                    };

                                    $grouped[$label] = $product->productVariations
                                        ->pluck('label', 'id')
                                        ->toArray();
                                }

                                return $grouped;
                            })
                            ->searchable()
                            ->preload()
                            ->reactive()
                            ->required(),



                        Forms\Components\FileUpload::make('thumbnail')
                            ->label('Thumbnail')
                            ->imageEditor()
                            ->image()
                            ->required()
                            ->imageEditorAspectRatios([
                                '6:8',
                                '6:9',
                            ])
                            ->directory('SavedDesignThumbnail'),
                        Forms\Components\Select::make('status')
                            ->native(false)
                            ->options([
                                'Draft' => 'Draft',
                                'Finalized' => 'Finalized',
                                'Carted' => 'Carted'
                            ])
                            ->default('Draft'),
                        DateTimePicker::make('created_at')
                            ->hiddenOn(['create', 'edit'])
                            ->displayFormat('Y-m-d H:i:s'),
                        DateTimePicker::make('updated_at')
                            ->hiddenOn(['create', 'edit'])
                            ->displayFormat('Y-m-d H:i:s'),
                    ])
                    ->columns(2),

                Section::make('Design Attributes')
                    ->description('You can add attributes for the design below. To delete any attribute, click the delete button in the right')
                    ->schema([
                        Repeater::make('attributes')
                            ->label('')
                            ->relationship('attributes') // tells Filament to link to the `attributes()` relation
                            ->schema([
                                Select::make('attribute_name')
                                    ->label('Attribute')
                                    ->options([
                                        'product_type_id' => 'Product Type',
                                        'image_effect_id' => 'Image Effect',
                                        'edge_design_id' => 'Edge Design',
                                        'frame_color_id' => 'Frame Color',
                                        'frame_thickness_id' => 'Frame Thickness',
                                        'frame_type_id' => 'Frame Type',
                                        'floating_frame_color_id' => 'Floating Frame Color',
                                        'acrylic_cover' => 'Acrylic Cover',
                                        'hanging_mechanism' => 'Hanging Mechanism',
                                        'hanging_mechanism_variety_id' => 'Hanging Mechanism Variety',
                                    ])
                                    ->required()
                                    ->reactive()
                                    ->native(false),

                                Select::make('attribute_value')
                                    ->label('Value')
                                    ->options(function ($get, $set, $state, $context) {
                                        $attributeName = $get('attribute_name');
                                        $productVariationId = $get('../../product_variation_id');
                                        if (! $attributeName || ! $productVariationId) {
                                            return [];
                                        }
                                        $attributeModelMap = [
                                            'image_effect_id' => \App\Models\ImageEffect::class,
                                            'edge_design_id' => \App\Models\EdgeDesign::class,
                                            'product_type_id' => \App\Models\ProductType::class,
                                            'frame_colour_id' => \App\Models\FrameColour::class,
                                            'frame_thickness_id' => \App\Models\FrameThickness::class,
                                            'frame_type_id' => \App\Models\FrameType::class,
                                            'floating_frame_colour_id' => \App\Models\FloatingFrameColour::class,
                                            'hanging_mechanism_variety_id' => \App\Models\HangingMechanismVariety::class,
                                            // Add other mappings here...
                                        ];
                                        // Map of attribute names that are just Yes/No
                                        $booleanAttributes = [
                                            'hanging_mechanism',
                                            'acrylic_cover',
                                        ];

                                        // If it's a Yes/No type attribute
                                        if (in_array($attributeName, $booleanAttributes)) {
                                            return [
                                                'yes' => 'Yes',
                                                'no' => 'No',
                                            ];
                                        }


                                        // If attribute is not in the map, return empty
                                        if (! array_key_exists($attributeName, $attributeModelMap)) {
                                            return [];
                                        }
                                        $modelClass = $attributeModelMap[$attributeName];



                                        // Build query dynamically
                                        return $modelClass::query()
                                            ->when(Schema::hasColumn((new $modelClass)->getTable(), 'status'), function ($query) {
                                                $query->where('status', 'active'); // Optional: only if 'status' column exists
                                            })
                                            ->where(function ($query) use ($productVariationId) {
                                                $product = \App\Models\ProductVariation::with('product')->find($productVariationId)?->product;

                                                if (!$product) {
                                                    $query->whereNull('id'); // Return nothing if no product found
                                                    return;
                                                }

                                                $category = $product->category;
                                                $productId = $product->id;

                                                $query->where('applicability', 'all')
                                                    ->orWhere('applicability', $category)
                                                    ->orWhere(function ($q) use ($productId) {
                                                        $q->where('applicability', 'specific')
                                                            ->where('product_id', $productId);
                                                    });
                                            })
                                            ->pluck('name', 'id')
                                            ->toArray();
                                    })
                                    ->searchable()
                                    ->required()
                                    ->native(false)
                                    ->disabled(fn($get) => !$get('attribute_name')) // disable until attribute is selected
                                    ->placeholder('Select an attribute value')
                                    ->reactive(),
                            ])
                            ->columns(2)
                            ->columnSpanFull()
                            ->createItemButtonLabel('Add Attribute')
                            ->defaultItems(0),
                    ]),
                Section::make('Design Images')
                    ->description('You can add images for the design below. To delete any image, click the delete button in the right')
                    ->schema([
                        Repeater::make('images')
                            ->relationship('images')
                            ->label('')
                            ->schema([
                                FileUpload::make('image_url')
                                    ->label('Image')
                                    ->imageEditor()
                                    ->image()
                                    ->required()
                                    ->imageEditorAspectRatios([
                                        '6:8',
                                        '6:9',
                                    ])
                                    ->directory('SavedDesignImages'),

                                TextInput::make('position')
                                    ->numeric()
                                    ->required()
                                    ->default(function ($get, $record) {
                                        $productVariationId = $get('../../product_variation_id') ?? $record?->product_variation_id;

                                        if (!$productVariationId) {
                                            return null;
                                        }

                                        $productVariation = \App\Models\ProductVariation::with('product')->find($productVariationId);

                                        if (!$productVariation || !$productVariation->product) {
                                            return null;
                                        }

                                        $productType = $productVariation->product->type;

                                        if ($productType === 'size') {
                                            return 1;
                                        }

                                        return null;
                                    })
                                    ->reactive(),
                            ])
                            ->columns(2)
                            ->columnSpanFull()
                            ->defaultItems(0)
                            ->createItemButtonLabel('Add Image')
                            ->maxItems(function ($get, Set $set, $record) {
                                // We try to get the product_variation_id from the parent context
                                $productVariationId = $get('../../product_variation_id') ?? $record?->product_variation_id;

                                if (!$productVariationId) {
                                    return 1; // fallback: allow 1 image if no product variation is available yet
                                }

                                $productVariation = \App\Models\ProductVariation::with('product')->find($productVariationId);

                                if (!$productVariation || !$productVariation->product) {
                                    return 1; // fallback
                                }

                                // Check the type
                                $productType = $productVariation->product->type;

                                if ($productType === 'size') {
                                    return 1; // Only 1 image allowed
                                }

                                if ($productType === 'layout') {
                                    // Fetch the image_count from layout details
                                    $layoutDetail = \App\Models\ProductVariationLayoutDetail::where('product_variation_id', $productVariationId)->first();

                                    if ($layoutDetail) {
                                        return $layoutDetail->image_count ?? 1; // Use image_count or default to 1 if null
                                    }
                                    return 1; // fallback if no layout detail found
                                }
                                return 1;
                            }),

                    ]),


            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('thumbnail')
                    ->size(100),
                Tables\Columns\TextColumn::make('customer.name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('productVariation.label')
                    ->label('Product Variation')
                    ->searchable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'Draft' => 'warning',
                        'Finalized' => 'primary',
                        'Carted' => 'success',
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
            'index' => Pages\ListSavedDesigns::route('/'),
            'create' => Pages\CreateSavedDesign::route('/create'),
            'view' => Pages\ViewSavedDesign::route('/{record}'),
            'edit' => Pages\EditSavedDesign::route('/{record}/edit'),
        ];
    }
}
