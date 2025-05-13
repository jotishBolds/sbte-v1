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

import { useCart } from "@/context/CartContext";
import { Link } from "@inertiajs/react";
import { CartItem } from "./CartItem";

interface CartSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({ open, onOpenChange }) => {
    const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } =
        useCart();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="text-xl font-bold">
                        Your Cart
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-full">
                    {cart.length === 0 ? (
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
                                            asChild
                                            className="flex-1 bg-[#68b94c] hover:bg-[#5ba33e]"
                                        >
                                            <Link href="/checkout">
                                                Checkout
                                            </Link>
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
