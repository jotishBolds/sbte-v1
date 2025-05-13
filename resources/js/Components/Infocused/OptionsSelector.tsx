// Updated OptionSelectors.tsx
import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { Input } from "@/Components/ui/input";
import { Checkbox } from "@/Components/ui/checkbox";
import { Button } from "@/Components/ui/button";
import { CanvasFormData } from "@/types/canvas";
import { calculatePrice, formatCurrency } from "@/types/utils";
import { ProductData } from "@/types/canvas";
import { useCart } from "@/context/CartContext";

interface OptionSelectorsProps {
    data: CanvasFormData;
    setData: (key: string, value: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    processing: boolean;
    hasImage: boolean;
    productData: ProductData | null;
    imageUrl: string | null;
}

export const OptionSelectors: React.FC<OptionSelectorsProps> = ({
    data,
    setData,
    onSubmit,
    processing,
    hasImage,
    productData,
    imageUrl,
}) => {
    const { addToCart } = useCart();
    const priceInfo = calculatePrice(data.size, data.quantity, productData, {
        imageEffect:
            typeof data.imageEffect === "number" ? data.imageEffect : undefined,
        edgeDesign:
            typeof data.edgeDesign === "number" ? data.edgeDesign : undefined,
        hangingMechanism: data.hangingMechanism === "Yes",
        hangingVariety: data.hangingVariety,
    });
    const handleAddToCart = () => {
        if (!hasImage || !imageUrl) return;

        addToCart({
            productId: productData?.product?.id || 0,
            size: data.size,
            quantity: data.quantity,
            imageEffect: data.imageEffect,
            edgeDesign: data.edgeDesign,
            hangingMechanism: data.hangingMechanism,
            hangingVariety: data.hangingVariety,
            imageUrl: imageUrl, // Now this will work
            imagePosition: data.imagePosition,
            zoomLevel: data.zoomLevel,
            price: priceInfo.total / data.quantity,
            productData: productData,
        });
        console.log("Adding to cart", data, priceInfo);
    };
    // Find the selected product variation
    const selectedVariation = productData?.product?.product_variations?.find(
        (variation: any) => variation.label === data.size
    );

    // Get available edge designs for the selected variation
    const availableEdgeDesigns =
        selectedVariation?.edge_designs?.map((ed: any) => ed.edge_design) ||
        productData?.baseEdgeDesigns ||
        [];

    // Get available image effects for the selected variation
    const availableImageEffects =
        selectedVariation?.image_effects?.map((ie: any) => ie.image_effect) ||
        productData?.baseImageEffects ||
        [];

    // Check if hanging mechanism is available for this variation
    const hasHangingMechanism =
        selectedVariation?.hanging_price !== null ||
        productData?.hangingBasePrice !== null ||
        selectedVariation?.hanging_varieties?.length > 0 ||
        productData?.baseHangingVarieties?.length > 0;

    // Get hanging varieties (from variation or base)
    const hangingVarieties =
        (selectedVariation?.hanging_varieties ?? []).length > 0
            ? selectedVariation?.hanging_varieties?.map(
                  (hv: any) => hv.hanging_mechanism_variety
              ) ?? []
            : productData?.baseHangingVarieties ?? [];

    // Check if we should show hanging varieties selector
    const showHangingVarieties =
        hangingVarieties.length > 0 && data.hangingMechanism === "Yes";

    return (
        <div className="space-y-6">
            {/* Size Selection */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Size</label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <span className="text-gray-500 text-sm">ⓘ</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Select the size for your canvas print</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Select
                    value={data.size}
                    onValueChange={(value) => setData("size", value)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                        {productData?.product?.product_variations?.map(
                            (variation: any) => (
                                <SelectItem
                                    key={variation.id}
                                    value={variation.label}
                                >
                                    {variation.label} (
                                    {variation.horizontal_length}x
                                    {variation.vertical_length}{" "}
                                    {variation.length_unit.name})
                                </SelectItem>
                            )
                        )}
                    </SelectContent>
                </Select>
            </div>
            {/* Quantity */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Quantity
                </label>
                <Input
                    type="number"
                    min="1"
                    value={data.quantity}
                    onChange={(e) =>
                        setData("quantity", parseInt(e.target.value) || 1)
                    }
                    className="w-full"
                />
            </div>
            {/* Image Effects */}
            {availableImageEffects.length > 0 && (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Image Effects
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {availableImageEffects.map((effect: any) => (
                            <div
                                key={effect.id}
                                onClick={() =>
                                    setData("imageEffect", effect.id)
                                }
                                className={`border rounded p-2 cursor-pointer hover:border-[#68b94c] ${
                                    data.imageEffect === effect.id
                                        ? "border-[#68b94c] relative"
                                        : ""
                                }`}
                            >
                                <div className="h-16 bg-gray-200 overflow-hidden">
                                    {effect.thumbnail && (
                                        <img
                                            src={`/storage/${effect.thumbnail}`}
                                            alt={effect.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target =
                                                    e.target as HTMLImageElement;
                                                console.error(
                                                    `Failed to load image: ${effect.thumbnail}`
                                                );
                                                target.style.display = "none";
                                                if (target.parentElement) {
                                                    target.parentElement.style.backgroundColor =
                                                        "#f3f4f6";
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                                <p className="text-center text-xs mt-1">
                                    {effect.name}
                                </p>
                                {data.imageEffect === effect.id && (
                                    <div className="absolute top-1 right-1 bg-[#68b94c] text-white rounded-full w-4 h-4 flex items-center justify-center">
                                        ✓
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Edge Design */}
            {availableEdgeDesigns.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">
                            Edge Design
                        </label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <span className="text-gray-500 text-sm">
                                        ⓘ
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        Choose how the edges of your canvas will
                                        look
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {availableEdgeDesigns.map((edge: any) => (
                            <div
                                key={edge.id}
                                onClick={() => setData("edgeDesign", edge.id)}
                                className={`border rounded p-2 cursor-pointer hover:border-[#68b94c] ${
                                    data.edgeDesign === edge.id
                                        ? "border-[#68b94c] relative"
                                        : ""
                                }`}
                            >
                                <div className="h-16 bg-gray-200 overflow-hidden">
                                    {edge.thumbnail && (
                                        <img
                                            src={`/storage/${edge.thumbnail}`}
                                            alt={edge.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target =
                                                    e.target as HTMLImageElement;
                                                console.error(
                                                    `Failed to load image: ${edge.thumbnail}`
                                                );
                                                target.style.display = "none";
                                                if (target.parentElement) {
                                                    target.parentElement.style.backgroundColor =
                                                        "#f3f4f6";
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                                <p className="text-center text-xs mt-1">
                                    {edge.name}
                                </p>
                                {data.edgeDesign === edge.id && (
                                    <div className="absolute top-1 right-1 bg-[#68b94c] text-white rounded-full w-4 h-4 flex items-center justify-center">
                                        ✓
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Hanging Mechanism */}

            {hasHangingMechanism && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">
                        Hanging Mechanism
                    </label>
                    <Select
                        value={data.hangingMechanism}
                        onValueChange={(value: string) => {
                            setData("hangingMechanism", value);
                            // Reset hanging variety when changing to No
                            if (value === "No") {
                                setData("hangingVariety", undefined);
                            }
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Hanging Varieties (shown only when hanging mechanism is Yes) */}
                    {data.hangingMechanism === "Yes" &&
                        hangingVarieties.length > 0 && (
                            <div className="mt-2">
                                <label className="block text-sm font-medium mb-2">
                                    Hanging Style
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {hangingVarieties.map((variety: any) => (
                                        <div
                                            key={variety.id}
                                            onClick={() =>
                                                setData(
                                                    "hangingVariety",
                                                    variety.id
                                                )
                                            }
                                            className={`border rounded p-2 cursor-pointer hover:border-[#68b94c] ${
                                                data.hangingVariety ===
                                                variety.id
                                                    ? "border-[#68b94c] relative"
                                                    : ""
                                            }`}
                                        >
                                            <div className="h-16 bg-gray-200 overflow-hidden">
                                                {variety.thumbnail && (
                                                    <img
                                                        src={`/storage/${variety.thumbnail}`}
                                                        alt={variety.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <p className="text-center text-xs mt-1">
                                                {variety.name} (₹{variety.price}
                                                )
                                            </p>
                                            {data.hangingVariety ===
                                                variety.id && (
                                                <div className="absolute top-1 right-1 bg-[#68b94c] text-white rounded-full w-4 h-4 flex items-center justify-center">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                </div>
            )}
            {/* Total Price */}
            <div className="flex justify-between pt-4 border-t">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold text-[#68b94c]">
                    {formatCurrency(priceInfo.total)}
                </span>
            </div>

            {/* Shipping Cost */}
            <div className="border p-2 bg-gray-50 rounded flex justify-between">
                <span className="text-sm">Shipping Cost Estimation</span>
                <span className="text-sm">📋</span>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-center gap-2">
                <Checkbox id="terms" />
                <label htmlFor="terms" className="text-sm">
                    I agree to Terms of Use
                </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button
                    onClick={handleAddToCart}
                    className="flex-1 bg-white border border-[#68b94c] text-[#68b94c] hover:bg-gray-50"
                    disabled={processing || !hasImage}
                >
                    Add to Cart
                </Button>
                <Button
                    type="submit"
                    className="flex-1 bg-[#68b94c] hover:bg-[#5ba33e] text-white"
                    onClick={onSubmit}
                    disabled={processing || !hasImage}
                >
                    Checkout
                </Button>
            </div>
        </div>
    );
};
