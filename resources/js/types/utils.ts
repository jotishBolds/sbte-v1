import { ProductData } from "@/types/canvas";

export const calculatePrice = (
    sizeLabel: string,
    quantity: number,
    productData: ProductData | null,
    selectedOptions: {
        imageEffect?: number;
        edgeDesign?: number;
        hangingMechanism?: boolean;
        hangingVariety?: number;
    }
) => {
    if (!productData) return { base: 0, total: 0 };

    const variation = productData.product.product_variations.find(
        (v) => v.label === sizeLabel
    );

    if (!variation) return { base: 0, total: 0 };

    let basePrice = parseFloat(variation.price) || 0;
    let total = basePrice * quantity;

    // Add image effect price if selected
    if (selectedOptions.imageEffect) {
        // Find the variation-specific price first
        const variationEffect = variation.image_effects.find(
            (ie) => ie.image_effect_id === selectedOptions.imageEffect
        );

        if (variationEffect) {
            // Use variation-specific price
            total += parseFloat(variationEffect.price) * quantity;
        } else {
            // Fall back to base price if no variation-specific price
            const baseEffect = productData.baseImageEffects.find(
                (ie) => ie.id === selectedOptions.imageEffect
            );
            if (baseEffect) {
                total += parseFloat(baseEffect.price) * quantity;
            }
        }
    }

    // Add edge design price if selected
    if (selectedOptions.edgeDesign) {
        // Find the variation-specific price first
        const variationEdge = variation.edge_designs.find(
            (ed) => ed.edge_design_id === selectedOptions.edgeDesign
        );

        if (variationEdge) {
            // Use variation-specific price
            total += parseFloat(variationEdge.price) * quantity;
        } else {
            // Fall back to base price if no variation-specific price
            const baseEdge = productData.baseEdgeDesigns.find(
                (ed) => ed.id === selectedOptions.edgeDesign
            );
            if (baseEdge) {
                total += parseFloat(baseEdge.price) * quantity;
            }
        }
    }

    // Add hanging mechanism price if selected
    if (selectedOptions.hangingMechanism) {
        // Always add base hanging price if it exists, regardless of varieties
        if (productData.hangingBasePrice?.price) {
            total += parseFloat(productData.hangingBasePrice.price) * quantity;
        }

        // Check for variation-specific hanging base price
        if (variation.hanging_price?.price) {
            total += parseFloat(variation.hanging_price.price) * quantity;
        }

        // Add selected hanging variety price if any
        if (selectedOptions.hangingVariety) {
            // Check variation-specific hanging varieties first
            const variationHangingVariety = variation.hanging_varieties?.find(
                (hv) =>
                    hv.hanging_mechanism_variety_id ===
                    selectedOptions.hangingVariety
            );

            if (variationHangingVariety) {
                total += parseFloat(variationHangingVariety.price) * quantity;
            } else {
                // Fall back to base hanging variety price
                const baseHangingVariety =
                    productData.baseHangingVarieties?.find(
                        (hv) => hv.id === selectedOptions.hangingVariety
                    );

                if (baseHangingVariety) {
                    total += parseFloat(baseHangingVariety.price) * quantity;
                }
            }
        }
    }

    return {
        base: basePrice,
        total: total,
    };
};

export const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
};
// lib/utils.ts
export const convertFileToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export const isBase64 = (str: string) => {
    try {
        return str.startsWith("data:image");
    } catch {
        return false;
    }
};
