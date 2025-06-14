// Components/CartSheet.tsx
import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/Components/ui/sheet";
import { Button } from "@/Components/ui/button";

import { formatCurrency } from "@/types/utils";

import { Link, router } from "@inertiajs/react";
import { CartItem } from "./CartItem";
import { useCart } from "@/context/CartContext";
import axios from "axios";

interface CartSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({ open, onOpenChange }) => {
    const {
        cart,
        cartTotal,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoading,
        isAuthenticated,
        checkAuthentication,
    } = useCart();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="text-xl font-bold">
                        Your Cart
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-full">
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <p className="mb-4">Loading your cart...</p>
                        </div>
                    ) : !isAuthenticated ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <p className="mb-4">
                                Please login to view your cart
                            </p>
                            <Button
                                onClick={async () => {
                                    onOpenChange(false);

                                    // Set the current URL as intended URL for post-login redirect
                                    try {
                                        const currentUrl = window.location.href;
                                        await axios.post(
                                            "/shopping-cart/set-intended-url",
                                            {
                                                intended_url: currentUrl,
                                            }
                                        );
                                    } catch (error) {
                                        console.error(
                                            "Failed to set intended URL:",
                                            error
                                        );
                                    }

                                    router.visit("/login");
                                }}
                                className="bg-[#68b94c] hover:bg-[#5ba33e]"
                            >
                                Login
                            </Button>
                        </div>
                    ) : cart.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <p className="mb-4">Your cart is empty</p>
                            <Button
                                onClick={() => onOpenChange(false)}
                                className="bg-[#68b94c] hover:bg-[#5ba33e]"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto py-4">
                                {cart.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onRemove={() => removeFromCart(item.id)}
                                        onQuantityChange={(quantity: any) =>
                                            updateQuantity(item.id, quantity)
                                        }
                                    />
                                ))}
                            </div>

                            <SheetFooter className="border-t pt-4">
                                <div className="w-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-semibold">
                                            Subtotal
                                        </span>
                                        <span className="font-bold">
                                            {formatCurrency(cartTotal)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={clearCart}
                                            className="flex-1"
                                        >
                                            Clear Cart
                                        </Button>
                                        <Button
                                            className="flex-1 bg-[#68b94c] hover:bg-[#5ba33e]"
                                            onClick={async () => {
                                                // Verify authentication before checkout
                                                const isAuth =
                                                    await checkAuthentication();
                                                if (!isAuth) {
                                                    return; // The checkAuthentication will handle redirect
                                                }
                                                // Navigate to checkout
                                                window.location.href =
                                                    "/checkout";
                                            }}
                                        >
                                            Checkout
                                        </Button>
                                    </div>
                                </div>
                            </SheetFooter>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
