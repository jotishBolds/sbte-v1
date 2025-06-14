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
import { MultiCanvasFormData, PanelLayout } from "@/types/canvas";
import { calculatePrice, formatCurrency } from "@/types/utils";
import { MultiLayoutSelector } from "./MultiLayoutSelector";
import { ProductData } from "@/types/canvas";
import { useCart } from "@/context/CartContext";

interface MultiOptionSelectorsProps {
    data: MultiCanvasFormData;
    setData: (key: string, value: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    processing: boolean;
    hasImage: boolean;
    selectedLayout: PanelLayout | null;
    onSelectLayout: (layout: PanelLayout) => void;
    activePanel: string | null;
    onPanelEffectChange?: (effect: string | number) => void;
    productData: ProductData | null;
    imageUrl?: string | null;
}

export const MultiOptionSelectors: React.FC<MultiOptionSelectorsProps> = ({
    data,
    setData,
    onSubmit,
    processing,
    hasImage,
    selectedLayout,
    onSelectLayout,
    activePanel,
    onPanelEffectChange,
    productData,
    imageUrl,
}) => {
    const { addToCart, checkAuthentication } = useCart();

    // Find the selected product variation
    const selectedVariation = productData?.product?.product_variations?.find(
        (variation: any) => variation.label === data.size
    );

    // Get available edge designs (prefer variation-specific, fall back to base)
    const availableEdgeDesigns =
        (selectedVariation?.edge_designs?.length ?? 0) > 0
            ? selectedVariation!.edge_designs.map((ed: any) => ed.edge_design)
            : productData?.baseEdgeDesigns || [];

    // Get available image effects (prefer variation-specific, fall back to base)
    const availableImageEffects =
        (selectedVariation?.image_effects?.length ?? 0) > 0
            ? selectedVariation!.image_effects.map((ie: any) => ie.image_effect)
            : productData?.baseImageEffects || [];

    // Get available frame thicknesses (prefer variation-specific, fall back to base)
    const availableFrameThicknesses =
        (selectedVariation?.frame_thicknesses?.length ?? 0) > 0
            ? selectedVariation!.frame_thicknesses.map(
                  (ft: any) => ft.frame_thickness
              )
            : productData?.baseFrameThicknesses || [];

    // Check if hanging mechanism is available for this variation
    const hasHangingMechanism =
        selectedVariation?.hanging_price !== null ||
        productData?.hangingBasePrice !== null ||
        (selectedVariation?.hanging_varieties?.length ?? 0) > 0 ||
        (productData?.baseHangingVarieties?.length ?? 0) > 0;

    // Get hanging varieties (prefer variation-specific, fall back to base)
    const hangingVarieties =
        (selectedVariation?.hanging_varieties?.length ?? 0) > 0
            ? selectedVariation?.hanging_varieties?.map(
                  (hv: any) => hv.hanging_mechanism_variety
              ) ?? []
            : productData?.baseHangingVarieties ?? [];

    // Check if we should show hanging varieties selector
    const showHangingVarieties =
        hangingVarieties.length > 0 && data.hangingMechanism === "Yes";

    const priceInfo = calculatePrice(data.size, data.quantity, productData, {
        imageEffect:
            typeof data.imageEffect === "number" ? data.imageEffect : undefined,
        edgeDesign:
            typeof data.edgeDesign === "number" ? data.edgeDesign : undefined,
        hangingMechanism: data.hangingMechanism === "Yes",
        hangingVariety: data.hangingVariety,
    });

    const handleEffectChange = (effect: string | number) => {
        if (activePanel && onPanelEffectChange) {
            onPanelEffectChange(effect);
        } else {
            setData("imageEffect", effect);
        }
    };

    const currentEffect = activePanel
        ? data.panelEffects?.[activePanel] || data.imageEffect
        : data.imageEffect;

    const handleAddToCart = () => {
        if (!hasImage) return;

        console.log(
            "MultiOptionSelector frameThickness value:",
            data.frameThickness
        );
        addToCart({
            productId: productData?.product?.id || 0,
            size: data.size,
            quantity: data.quantity,
            imageEffect: data.imageEffect,
            edgeDesign: data.edgeDesign,
            hangingMechanism: data.hangingMechanism,
            hangingVariety: data.hangingVariety,
            imageUrl: imageUrl || data.imageUrl || "",
            imagePosition: data.imagePosition,
            zoomLevel: data.zoomLevel,
            price: priceInfo.total / data.quantity,
            productData: productData,
            layout: selectedLayout,
            frameThickness: data.frameThickness,
            panelImages: data.panelImages || {},
            panelEffects: data.panelEffects || {},
        });
        console.log("Adding to cart", data, priceInfo);
    };

    const handleCheckout = async () => {
        if (!hasImage) return;

        // Check authentication before proceeding to checkout
        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) {
            return; // checkAuthentication will handle redirect to login
        }

        // Add item to cart first
        await addToCart({
            productId: productData?.product?.id || 0,
            size: data.size,
            quantity: data.quantity,
            imageEffect: data.imageEffect,
            edgeDesign: data.edgeDesign,
            hangingMechanism: data.hangingMechanism,
            hangingVariety: data.hangingVariety,
            imageUrl: imageUrl || data.imageUrl || "",
            imagePosition: data.imagePosition,
            zoomLevel: data.zoomLevel,
            price: priceInfo.total / data.quantity,
            productData: productData,
            layout: selectedLayout,
            frameThickness: data.frameThickness,
            panelImages: data.panelImages || {},
            panelEffects: data.panelEffects || {},
        });

        // Redirect to checkout page
        window.location.href = "/checkout";
    };

    return (
        <div className="space-y-6">
            {/* Layout Selection */}
            <div>
                <label className="block text-sm font-medium mb-2">Layout</label>
                <MultiLayoutSelector
                    selectedLayout={selectedLayout}
                    onSelectLayout={onSelectLayout}
                />
            </div>

            {/* Size section completely hidden for multi-layout canvas */}

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

            {/* Frame Thickness - Only show if product has frame thickness options */}
            {availableFrameThicknesses.length > 0 && (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Frame Thickness
                    </label>
                    <Select
                        value={data.frameThickness?.toString() || ""}
                        onValueChange={(value) =>
                            setData("frameThickness", parseInt(value))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select thickness" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableFrameThicknesses.map((thickness: any) => (
                                <SelectItem
                                    key={thickness.id}
                                    value={thickness.id.toString()}
                                >
                                    {thickness.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Image Effects */}
            {availableImageEffects.length > 0 && (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        {activePanel
                            ? `Panel ${activePanel} Effect`
                            : "Image Effect"}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {availableImageEffects.map((effect: any) => (
                            <div
                                key={effect.id}
                                onClick={() => handleEffectChange(effect.id)}
                                className={`border rounded p-2 cursor-pointer hover:border-[#68b94c] ${
                                    (
                                        typeof currentEffect === "number"
                                            ? currentEffect === effect.id
                                            : currentEffect === effect.name
                                    )
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
                                {(typeof currentEffect === "number"
                                    ? currentEffect === effect.id
                                    : currentEffect === effect.name) && (
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
                                    (
                                        typeof data.edgeDesign === "number"
                                            ? data.edgeDesign === edge.id
                                            : data.edgeDesign === edge.name
                                    )
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
                                {(typeof data.edgeDesign === "number"
                                    ? data.edgeDesign === edge.id
                                    : data.edgeDesign === edge.name) && (
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
                    {showHangingVarieties && (
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
                                            data.hangingVariety === variety.id
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
                                            {variety.name} (₹{variety.price})
                                        </p>
                                        {data.hangingVariety === variety.id && (
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
                    onClick={handleCheckout}
                    className="flex-1 bg-[#68b94c] hover:bg-[#5ba33e] text-white"
                    disabled={processing || !hasImage}
                >
                    Checkout
                </Button>
            </div>
        </div>
    );
};
