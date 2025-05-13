// types/utils.ts
export const calculatePrice = (
    size: string,
    quantity: number,
    panelCount: number = 1
) => {
    const basePrice = 50; // Base price per panel
    const sizeMultiplier = size.includes("Large") ? 1.5 : 1;
    const total = basePrice * sizeMultiplier * quantity * panelCount;
    return {
        base: basePrice,
        sizeMultiplier,
        quantity,
        panelCount,
        total,
    };
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
};
