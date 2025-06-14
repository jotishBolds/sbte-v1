import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Button } from "@/Components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/types/utils";
import { CartItem as CartItemComponent } from "@/Components/CartItem";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import axios from "axios";

export default function Checkout({ auth }) {
    const { cart, cartTotal, removeFromCart, updateQuantity, isLoading } =
        useCart();
    const [shippingAddress, setShippingAddress] = useState({
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "United Kingdom",
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState("");

    // Load user's addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await axios.get("/addresses/customer");
                if (
                    response.data.status === "success" &&
                    response.data.data.length > 0
                ) {
                    const address = response.data.data[0];
                    setShippingAddress({
                        address_line_1: address.address_line_1,
                        address_line_2: address.address_line_2 || "",
                        city: address.city,
                        state: address.state,
                        postal_code: address.postal_code,
                        country: address.country,
                    });
                }
            } catch (error) {
                console.error("Error fetching addresses:", error);
            }
        };

        if (auth.user) {
            fetchAddresses();
        }
    }, [auth.user]);

    const handlePlaceOrder = async () => {
        try {
            setIsProcessing(true);

            // Create/update shipping address
            let shippingAddressId;
            try {
                // Attempt to create a new address
                const addressResponse = await axios.post("/addresses", {
                    ...shippingAddress,
                    is_default: true,
                });
                shippingAddressId = addressResponse.data.data.id;
            } catch (error) {
                console.error("Error creating address:", error);
                setMessage("Failed to create shipping address");
                setIsProcessing(false);
                return;
            }

            // Place order
            const orderResponse = await axios.post("/orders", {
                shipping_address_id: shippingAddressId,
                billing_address_id: shippingAddressId, // Use same address for billing
                shipping_type_id: 1, // Default shipping type
                payment_method: "Credit Card", // Default payment method
            });

            setMessage("Order placed successfully!");
            // Redirect to confirmation page or show success message
        } catch (error) {
            console.error("Error placing order:", error);
            setMessage("Failed to place order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    if (isLoading) {
        return (
            <AppLayout>
                <Head title="Checkout" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                Loading your cart...
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!auth.user) {
        return (
            <AppLayout>
                <Head title="Checkout" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <p className="mb-4">
                                    Please login to view your cart and checkout
                                </p>
                                <Button
                                    className="bg-[#68b94c] hover:bg-[#5ba33e]"
                                    onClick={() =>
                                        (window.location.href = "/login")
                                    }
                                >
                                    Login
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (cart.length === 0) {
        return (
            <AppLayout>
                <Head title="Checkout" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <p className="mb-4">Your cart is empty</p>
                                <Button
                                    className="bg-[#68b94c] hover:bg-[#5ba33e]"
                                    onClick={() => (window.location.href = "/")}
                                >
                                    Continue Shopping
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Checkout" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-8">Checkout</h1>

                    {message && (
                        <div
                            className={`p-4 rounded-md mb-6 ${
                                message.includes("Failed")
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Cart Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <CartItemComponent
                                                key={item.id}
                                                item={item}
                                                onRemove={() =>
                                                    removeFromCart(item.id)
                                                }
                                                onQuantityChange={(quantity) =>
                                                    updateQuantity(
                                                        item.id,
                                                        quantity
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="mt-8">
                                <CardHeader>
                                    <CardTitle>Shipping Information</CardTitle>
                                    <CardDescription>
                                        Enter your shipping details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <Label htmlFor="address_line_1">
                                                Address Line 1
                                            </Label>
                                            <Input
                                                id="address_line_1"
                                                name="address_line_1"
                                                value={
                                                    shippingAddress.address_line_1
                                                }
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="address_line_2">
                                                Address Line 2 (Optional)
                                            </Label>
                                            <Input
                                                id="address_line_2"
                                                name="address_line_2"
                                                value={
                                                    shippingAddress.address_line_2
                                                }
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="city">
                                                    City
                                                </Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    value={shippingAddress.city}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="postal_code">
                                                    Postal Code
                                                </Label>
                                                <Input
                                                    id="postal_code"
                                                    name="postal_code"
                                                    value={
                                                        shippingAddress.postal_code
                                                    }
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="state">
                                                    State/County
                                                </Label>
                                                <Input
                                                    id="state"
                                                    name="state"
                                                    value={
                                                        shippingAddress.state
                                                    }
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="country">
                                                    Country
                                                </Label>
                                                <Input
                                                    id="country"
                                                    name="country"
                                                    value={
                                                        shippingAddress.country
                                                    }
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>
                                                {formatCurrency(cartTotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Shipping</span>
                                            <span>To be calculated</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between font-bold">
                                                <span>Total</span>
                                                <span>
                                                    {formatCurrency(cartTotal)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full bg-[#68b94c] hover:bg-[#5ba33e]"
                                        onClick={handlePlaceOrder}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing
                                            ? "Processing..."
                                            : "Place Order"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
