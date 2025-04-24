// components/OptionSelectors.tsx
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
import { CanvasFormData, HangingMechanism } from "@/types/canvas";
import { calculatePrice, formatCurrency } from "@/types/utils";
import {
    EDGE_DESIGNS,
    HANGING_MECHANISMS,
    IMAGE_EFFECTS,
    SIZE_OPTIONS,
} from "@/types/constants";

// Define image paths with keys that match exactly with IMAGE_EFFECTS and EDGE_DESIGNS values
const EFFECT_IMAGES = {
    Original: {
        id: "original",
        src: "/assets/effects/original.jpg",
        alt: "Original effect",
    },
    "B&W": {
        id: "blackandwhite",
        src: "/assets/effects/blackandwhite.jpg",
        alt: "Black and white effect",
    },
    Sepia: {
        id: "vintage",
        src: "/assets/effects/sepia.jpg",
        alt: "Vintage effect",
    },
};

const EDGE_IMAGES = {
    Mirrored: {
        id: "mirror",
        src: "/assets/effects/border-mirror.jpg",
        alt: "Mirrored edges",
    },
    Black: {
        id: "black",
        src: "/assets/effects/border-black.jpg",
        alt: "Black edges",
    },
    White: {
        id: "white",
        src: "/assets/effects/border-white.jpg",
        alt: "White edges",
    },
    Folded: {
        id: "color",
        src: "/assets/effects/border-color.jpg",
        alt: "Color wrap edges",
    },
};

interface OptionSelectorsProps {
    data: CanvasFormData;
    setData: (key: string, value: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    processing: boolean;
    hasImage: boolean;
}

export const OptionSelectors: React.FC<OptionSelectorsProps> = ({
    data,
    setData,
    onSubmit,
    processing,
    hasImage,
}) => {
    const priceInfo = calculatePrice(data.size, data.quantity);

    // Add some debugging to help understand what's going on
    console.log("IMAGE_EFFECTS:", IMAGE_EFFECTS);
    console.log("Selected Effect:", data.imageEffect);
    console.log("EFFECT_IMAGES keys:", Object.keys(EFFECT_IMAGES));
    console.log("Effect Image Path:", EFFECT_IMAGES[data.imageEffect]?.src);

    console.log("EDGE_DESIGNS:", EDGE_DESIGNS);
    console.log("Selected Edge:", data.edgeDesign);
    console.log("EDGE_IMAGES keys:", Object.keys(EDGE_IMAGES));
    console.log("Edge Image Path:", EDGE_IMAGES[data.edgeDesign]?.src);

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
                        {SIZE_OPTIONS.map((size) => (
                            <SelectItem key={size.id} value={size.label}>
                                {size.label}
                            </SelectItem>
                        ))}
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
            <div>
                <label className="block text-sm font-medium mb-2">
                    Image Effects
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {IMAGE_EFFECTS.map((effect) => {
                        // Make sure we're using the correct key to look up the image
                        const effectImage = EFFECT_IMAGES[effect];
                        return (
                            <div
                                key={effect}
                                onClick={() => setData("imageEffect", effect)}
                                className={`border rounded p-2 cursor-pointer hover:border-[#68b94c] ${
                                    data.imageEffect === effect
                                        ? "border-[#68b94c] relative"
                                        : ""
                                }`}
                            >
                                <div className="h-16 bg-gray-200 overflow-hidden">
                                    {effectImage && (
                                        <img
                                            src={effectImage.src}
                                            alt={effectImage.alt}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target =
                                                    e.target as HTMLImageElement;
                                                console.error(
                                                    `Failed to load image: ${effectImage.src}`
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
                                    {effect}
                                </p>
                                {data.imageEffect === effect && (
                                    <div className="absolute top-1 right-1 bg-[#68b94c] text-white rounded-full w-4 h-4 flex items-center justify-center">
                                        ✓
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Edge Design */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Edge Design</label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <span className="text-gray-500 text-sm">ⓘ</span>
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
                    {EDGE_DESIGNS.map((edge) => {
                        // Make sure we're using the correct key to look up the image
                        const edgeImage = EDGE_IMAGES[edge];
                        return (
                            <div
                                key={edge}
                                onClick={() => setData("edgeDesign", edge)}
                                className={`border rounded p-2 cursor-pointer hover:border-[#68b94c] ${
                                    data.edgeDesign === edge
                                        ? "border-[#68b94c] relative"
                                        : ""
                                }`}
                            >
                                <div className="h-16 bg-gray-200 overflow-hidden">
                                    {edgeImage && (
                                        <img
                                            src={edgeImage.src}
                                            alt={edgeImage.alt}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target =
                                                    e.target as HTMLImageElement;
                                                console.error(
                                                    `Failed to load image: ${edgeImage.src}`
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
                                    {edge}
                                </p>
                                {data.edgeDesign === edge && (
                                    <div className="absolute top-1 right-1 bg-[#68b94c] text-white rounded-full w-4 h-4 flex items-center justify-center">
                                        ✓
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Hanging Mechanism */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Hanging Mechanism
                </label>
                <Select
                    value={data.hangingMechanism}
                    onValueChange={(value: HangingMechanism) =>
                        setData("hangingMechanism", value)
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                        {HANGING_MECHANISMS.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

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

            {/* Checkout Button */}
            <Button
                type="submit"
                className="w-full bg-[#68b94c] hover:bg-[#5ba33e] text-white"
                onClick={onSubmit}
                disabled={processing || !hasImage}
            >
                Continue Checkout 🛒
            </Button>
        </div>
    );
};
