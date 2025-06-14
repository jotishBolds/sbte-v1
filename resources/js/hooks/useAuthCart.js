import React from "react";
import { useCart } from "@/context/CartContext";

export const useAuthCart = () => {
    const { addToCart, checkAuthentication, isAuthenticated } = useCart();

    const authAddToCart = async (item) => {
        if (!isAuthenticated) {
            const isAuth = await checkAuthentication();
            if (!isAuth) {
                return false;
            }
        }

        await addToCart(item);
        return true;
    };

    return {
        authAddToCart,
        isAuthenticated,
    };
};
