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
import {
    HangingMechanism,
    MultiCanvasFormData,
    PanelLayout,
    ProductData,
} from "@/types/canvas";
import { calculatePrice, formatCurrency } from "@/types/utils";
import { SplitLayoutSelector } from "./SplitLayoutSelector";
import { useCart } from "@/context/CartContext";

interface SplitOptionSelectorsProps {
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
    imageUrl: string | null;
}

export const SplitOptionSelectors: React.FC<SplitOptionSelectorsProps> = ({
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

    const handleAddToCart = () => {
        if (!hasImage || !imageUrl) return;

        console.log(
            "SplitOptionSelector frameThickness value:",
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
            imageUrl: imageUrl,
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
        if (!hasImage || !imageUrl) return;

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
            imageUrl: imageUrl,
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

    const currentEffect = activePanel
        ? data.panelEffects?.[activePanel] || data.imageEffect
        : data.imageEffect;

    return (
        <div className="space-y-6">
            {/* Layout Selection */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Split Layout
                </label>
                <SplitLayoutSelector
                    selectedLayout={selectedLayout}
                    onSelectLayout={onSelectLayout}
                />
            </div>

            {/* Size Selection - Only show if product variations are available */}
            {(productData?.product?.product_variations?.length ?? 0) > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Size</label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <span className="text-gray-500 text-sm">
                                        ⓘ
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        Select the size for your split canvas
                                        print
                                    </p>
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
                                        {variation.label} -{" "}
                                        {formatCurrency(
                                            parseFloat(variation.price)
                                        )}
                                    </SelectItem>
                                )
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Show message when no sizes are available */}
            {(!productData?.product?.product_variations ||
                productData.product.product_variations.length === 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="text-yellow-800">
                            <svg
                                className="w-5 h-5 mr-2 inline"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            No sizes available. Please contact support or try
                            again later.
                        </div>
                    </div>
                </div>
            )}

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

            {/* Frame Thickness */}
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
                                    {thickness.name} -{" "}
                                    {formatCurrency(
                                        parseFloat(thickness.price)
                                    )}
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
                        {availableImageEffects.map((effect: any) => {
                            const effectId =
                                typeof effect === "object" ? effect.id : effect;
                            const effectName =
                                typeof effect === "object"
                                    ? effect.name
                                    : effect;
                            const effectThumbnail =
                                typeof effect === "object"
                                    ? effect.thumbnail
                                    : null;

                            return (
                                <div
                                    key={effectId}
                                    onClick={() => handleEffectChange(effectId)}
                                    className={`border rounded p-2 cursor-pointer hover:border-[#68b94c] ${
                                        currentEffect === effectId ||
                                        currentEffect === effectName
                                            ? "border-[#68b94c] relative"
                                            : ""
                                    }`}
                                >
                                    <div className="h-16 bg-gray-200 overflow-hidden">
                                        {effectThumbnail ? (
                                            <img
                                                src={`/storage/${effectThumbnail}`}
                                                alt={effectName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target =
                                                        e.target as HTMLImageElement;
                                                    target.style.display =
                                                        "none";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                {effectName}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-center text-xs mt-1">
                                        {effectName}
                                    </p>
                                    {(currentEffect === effectId ||
                                        currentEffect === effectName) && (
                                        <div className="absolute top-1 right-1 bg-[#68b94c] text-white rounded-full w-4 h-4 flex items-center justify-center">
                                            ✓
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
                                        Choose how the edges of your split
                                        canvas will look
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {availableEdgeDesigns.map((edge: any) => {
                            const edgeId =
                                typeof edge === "object" ? edge.id : edge;
                            const edgeName =
                                typeof edge === "object" ? edge.name : edge;
                            const edgeThumbnail =
                                typeof edge === "object"
                                    ? edge.thumbnail
                                    : null;

                            return (
                                <div
                                    key={edgeId}
                                    onClick={() =>
                                        setData("edgeDesign", edgeId)
                                    }
                                    className={`border rounded p-2 cursor-pointer hover:border-[#68b94c] ${
                                        data.edgeDesign === edgeId ||
                                        data.edgeDesign === edgeName
                                            ? "border-[#68b94c] relative"
                                            : ""
                                    }`}
                                >
                                    <div className="h-16 bg-gray-200 overflow-hidden">
                                        {edgeThumbnail ? (
                                            <img
                                                src={`/storage/${edgeThumbnail}`}
                                                alt={edgeName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target =
                                                        e.target as HTMLImageElement;
                                                    target.style.display =
                                                        "none";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                {edgeName}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-center text-xs mt-1">
                                        {edgeName}
                                    </p>
                                    {(data.edgeDesign === edgeId ||
                                        data.edgeDesign === edgeName) && (
                                        <div className="absolute top-1 right-1 bg-[#68b94c] text-white rounded-full w-4 h-4 flex items-center justify-center">
                                            ✓
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Hanging Mechanism */}
            {hasHangingMechanism && (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Hanging Mechanism
                    </label>
                    <Select
                        value={data.hangingMechanism}
                        onValueChange={(value: "Yes" | "No") =>
                            setData("hangingMechanism", value)
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Hanging Varieties */}
            {showHangingVarieties && (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Hanging Style
                    </label>
                    <Select
                        value={data.hangingVariety?.toString() || ""}
                        onValueChange={(value) =>
                            setData("hangingVariety", parseInt(value))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select hanging style" />
                        </SelectTrigger>
                        <SelectContent>
                            {hangingVarieties.map((variety: any) => (
                                <SelectItem
                                    key={variety.id}
                                    value={variety.id.toString()}
                                >
                                    {variety.name} -{" "}
                                    {formatCurrency(parseFloat(variety.price))}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
