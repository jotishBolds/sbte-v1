// contexts/CartContext.tsx
import { PanelLayout, ProductData } from "@/types/canvas";
import { convertFileToBase64 } from "@/types/utils";
import React, { createContext, useContext, useEffect, useState } from "react";

interface CartItem {
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
    createdAt: number;
    layout: PanelLayout | null;
    frameThickness: number;
    panelImages: Record<string, string>;
    panelEffects: Record<string, string | number>;
}
interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "id" | "createdAt">) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Load cart from localStorage on initial render
    useEffect(() => {
        const savedCart = localStorage.getItem("canvasCart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error("Failed to parse cart data", error);
                localStorage.removeItem("canvasCart");
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("canvasCart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = async (item: Omit<CartItem, "id" | "createdAt">) => {
        // Convert image to base64 for persistent storage
        let persistentImageUrl = item.imageUrl;

        if (item.imageUrl.startsWith("blob:")) {
            try {
                const response = await fetch(item.imageUrl);
                const blob = await response.blob();
                persistentImageUrl = await convertFileToBase64(blob);
            } catch (error) {
                console.error("Error converting image to base64:", error);
            }
        }

        const newItem: CartItem = {
            ...item,
            imageUrl: persistentImageUrl,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
        };

        setCart((prev) => [...prev, newItem]);
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, quantity) }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
