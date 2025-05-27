// Components/CartItem.tsx
import React from "react";

import { Input } from "@/Components/ui/input";
import { X } from "lucide-react";
import { formatCurrency } from "@/types/utils";
import { ProductData } from "@/types/canvas";

interface CartItemProps {
    item: {
        id: string;
        productId: number;
        size: string;
        quantity: number;
        imageEffect: string | number;
        edgeDesign: string | number;
        hangingMechanism: string;
        hangingVariety?: number;
        imageUrl: string;
        imagePosition: { x: number; y: number };
        zoomLevel: number;
        price: number;
        productData: ProductData | null;
    };
    onRemove: () => void;
    onQuantityChange: (quantity: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
    item,
    onRemove,
    onQuantityChange,
}) => {
    const getEdgeDesignName = () => {
        if (typeof item.edgeDesign === "number") {
            const edge =
                item.productData?.baseEdgeDesigns?.find(
                    (e) => e.id === item.edgeDesign
                ) ||
                item.productData?.product?.product_variations?.[0]?.edge_designs?.find(
                    (ed) => ed.edge_design_id === item.edgeDesign
                )?.edge_design;
            return edge?.name || "Folded";
        }
        return item.edgeDesign;
    };

    const getImageEffectName = () => {
        if (typeof item.imageEffect === "number") {
            const effect =
                item.productData?.baseImageEffects?.find(
                    (e) => e.id === item.imageEffect
                ) ||
                item.productData?.product?.product_variations?.[0]?.image_effects?.find(
                    (ie) => ie.image_effect_id === item.imageEffect
                )?.image_effect;
            return effect?.name || "Original";
        }
        return item.imageEffect;
    };

    return (
        <div className="flex gap-4 py-4 border-b">
            <div className="relative w-24 h-24 flex-shrink-0 border rounded-md overflow-hidden">
                {item.imageUrl.startsWith("data:image") ? (
                    <img
                        src={item.imageUrl}
                        alt="Product preview"
                        className="absolute w-full h-full object-cover"
                        style={{
                            transform: `translate(${
                                item.imagePosition.x * 100
                            }%, ${item.imagePosition.y * 100}%) scale(${
                                item.zoomLevel / 100
                            })`,
                            transformOrigin: "center",
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                        Image not available
                    </div>
                )}
            </div>

            <div className="flex-1">
                <div className="flex justify-between">
                    <h3 className="font-medium">Canvas Print - {item.size}</h3>
                    <button
                        onClick={onRemove}
                        className="text-gray-500 hover:text-red-500"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="text-sm text-gray-600 mt-1">
                    <p>Effect: {getImageEffectName()}</p>
                    <p>Edge: {getEdgeDesignName()}</p>
                    <p>Hanging: {item.hangingMechanism}</p>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                                onQuantityChange(parseInt(e.target.value) || 1)
                            }
                            className="w-16 h-8"
                        />
                    </div>
                    <span className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                    </span>
                </div>
            </div>
        </div>
    );
};
