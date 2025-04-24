import { PriceCalculation } from "./canvas";
import { SIZE_OPTIONS } from "./constants";

// utils.ts - Contains utility functions
export const calculatePrice = (
    size: string,
    quantity: number
): PriceCalculation => {
    const selectedSize = SIZE_OPTIONS.find((option) => option.label === size);
    const basePrice = selectedSize?.price || 950.0;

    return {
        basePrice,
        quantity,
        total: basePrice * quantity,
    };
};

export const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
};
