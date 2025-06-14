import React, { useState, useEffect } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import InfocusLayout from "@/Components/Layouts/InfocusLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Checkbox } from "@/Components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
    Plus,
    Edit,
    Trash2,
    MapPin,
    CreditCard,
    Truck,
    ShoppingCart,
    AlertCircle,
    CheckCircle,
    User,
} from "lucide-react";
import { formatCurrency } from "@/types/utils";
import axios from "axios";

interface Address {
    id: number;
    title: string;
    recipient_name: string;
    phone_number: string;
    alternate_phone?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
}

interface CartItem {
    cart_item_id: number;
    quantity: number;
    total_price: number;
    unit_price: number;
    saved_design: {
        id: number;
        thumbnail: string;
        product_variation: {
            id: number;
            label: string;
            price: string;
            product: {
                id: number;
                name: string;
                category: string;
            };
        };
        image_effect?: {
            id: number;
            name: string;
        };
        edge_design?: {
            id: number;
            name: string;
        };
        hanging_mechanism?: boolean;
        hanging_variety?: {
            id: number;
            name: string;
        };
    };
}

interface ShippingType {
    id: number;
    name: string;
    price: number;
    estimated_delivery_days: number;
    description?: string;
}

const Checkout: React.FC = () => {
    console.log("Checkout component is rendering");

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<any>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [shippingTypes, setShippingTypes] = useState<ShippingType[]>([]);
    const [selectedShippingAddress, setSelectedShippingAddress] = useState<
        number | null
    >(null);
    const [selectedBillingAddress, setSelectedBillingAddress] = useState<
        number | null
    >(null);
    const [selectedShippingType, setSelectedShippingType] = useState<
        number | null
    >(null);
    const [sameAsBilling, setSameAsBilling] = useState<boolean>(true);
    const [showAddressDialog, setShowAddressDialog] = useState<boolean>(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [orderLoading, setOrderLoading] = useState<boolean>(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        recipient_name: "",
        phone_number: "",
        alternate_phone: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
        is_default: false as boolean,
    }); // Check authentication and load initial data
    useEffect(() => {
        console.log("useEffect triggered - checking authentication");
        checkAuthAndLoadData();
    }, []);

    const checkAuthAndLoadData = async () => {
        try {
            console.log("Starting authentication check...");
            setLoading(true);

            // Check authentication using shopping cart endpoint as it's reliable
            const authResponse = await axios.get("/shopping-cart/check-auth");
            console.log("Auth response:", authResponse.data);

            if (authResponse.data.authenticated) {
                console.log("User is authenticated");
                setIsAuthenticated(true);
                setUser(authResponse.data.user); // Load addresses, cart, and shipping types
                await Promise.all([
                    loadAddresses(),
                    loadCart(),
                    loadShippingTypes(),
                ]);
                console.log("All data loaded successfully");
            } else {
                console.log("User is not authenticated, redirecting to login");
                setIsAuthenticated(false);
                // Redirect to login
                router.visit("/login");
            }
        } catch (error) {
            console.error(
                "Error checking authentication or loading data:",
                error
            );
            setIsAuthenticated(false);
            setAuthError("Authentication failed. Redirecting to login...");

            // Add a delay before redirect to ensure the error is logged
            setTimeout(() => {
                router.visit("/login");
            }, 2000);
        } finally {
            console.log("Loading complete, setting loading to false");
            setLoading(false);
        }
    };

    const loadAddresses = async () => {
        try {
            const response = await axios.get("/addresses/customer");
            if (response.data.status === "success") {
                setAddresses(response.data.data);
                // Auto-select default address
                const defaultAddress = response.data.data.find(
                    (addr: Address) => addr.is_default
                );
                if (defaultAddress) {
                    setSelectedShippingAddress(defaultAddress.id);
                    if (sameAsBilling) {
                        setSelectedBillingAddress(defaultAddress.id);
                    }
                }
            }
        } catch (error) {
            console.error("Error loading addresses:", error);
        }
    };

    const loadCart = async () => {
        try {
            const response = await axios.get("/shopping-cart/customer");
            if (response.data.status === "success") {
                setCartItems(response.data.data);
            }
        } catch (error) {
            console.error("Error loading cart:", error);
        }
    };

    const loadShippingTypes = async () => {
        try {
            const response = await axios.get("/shipping-types");
            if (response.data.status === "success") {
                setShippingTypes(response.data.data);
                // Auto-select first shipping type
                if (response.data.data.length > 0) {
                    setSelectedShippingType(response.data.data[0].id);
                }
            }
        } catch (error) {
            console.error("Error loading shipping types:", error);
        }
    };

    const saveAddress = async () => {
        try {
            if (editingAddress) {
                // Update existing address
                await axios.put(`/addresses/${editingAddress.id}`, data);
            } else {
                // Create new address
                await axios.post("/addresses", data);
            }

            await loadAddresses();
            setShowAddressDialog(false);
            setEditingAddress(null);
            reset();
        } catch (error) {
            console.error("Error saving address:", error);
        }
    };

    const editAddress = (address: Address) => {
        setEditingAddress(address);
        setData({
            title: address.title,
            recipient_name: address.recipient_name,
            phone_number: address.phone_number,
            alternate_phone: address.alternate_phone || "",
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2 || "",
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
            is_default: address.is_default,
        });
        setShowAddressDialog(true);
    };

    const deleteAddress = async (addressId: number) => {
        try {
            await axios.delete(`/addresses/${addressId}`);
            await loadAddresses();

            // Clear selections if deleted address was selected
            if (selectedShippingAddress === addressId) {
                setSelectedShippingAddress(null);
            }
            if (selectedBillingAddress === addressId) {
                setSelectedBillingAddress(null);
            }
        } catch (error) {
            console.error("Error deleting address:", error);
        }
    };
    const calculateSubtotal = (): number => {
        return cartItems.reduce((total, item) => {
            // Use total_price if available, otherwise calculate from unit_price * quantity
            const itemTotal =
                item.total_price || item.unit_price * item.quantity;
            return total + itemTotal;
        }, 0);
    };

    const calculateShippingCost = (): number => {
        const shippingType = shippingTypes.find(
            (st) => st.id === selectedShippingType
        );
        return shippingType ? shippingType.price : 0;
    };

    const calculateTotal = (): number => {
        return calculateSubtotal() + calculateShippingCost();
    };

    const placeOrder = async () => {
        if (
            !selectedShippingAddress ||
            !selectedShippingType ||
            cartItems.length === 0
        ) {
            return;
        }

        try {
            setOrderLoading(true);

            const shippingAddress = addresses.find(
                (addr) => addr.id === selectedShippingAddress
            );
            const billingAddress = sameAsBilling
                ? shippingAddress
                : addresses.find((addr) => addr.id === selectedBillingAddress);

            const orderData = {
                shipping_type_id: selectedShippingType,
                is_same_billing_shipping: sameAsBilling,
                shipping_address: {
                    recipient_name: shippingAddress!.recipient_name,
                    phone_number: shippingAddress!.phone_number,
                    alternate_phone: shippingAddress!.alternate_phone,
                    address_line_1: shippingAddress!.address_line_1,
                    address_line_2: shippingAddress!.address_line_2,
                    city: shippingAddress!.city,
                    state: shippingAddress!.state,
                    postal_code: shippingAddress!.postal_code,
                    country: shippingAddress!.country,
                },
                billing_address: sameAsBilling
                    ? null
                    : {
                          recipient_name: billingAddress!.recipient_name,
                          phone_number: billingAddress!.phone_number,
                          alternate_phone: billingAddress!.alternate_phone,
                          address_line_1: billingAddress!.address_line_1,
                          address_line_2: billingAddress!.address_line_2,
                          city: billingAddress!.city,
                          state: billingAddress!.state,
                          postal_code: billingAddress!.postal_code,
                          country: billingAddress!.country,
                      },
                items: cartItems.map((item) => ({
                    saved_design_id: item.saved_design.id,
                    quantity: item.quantity,
                })),
                total_amount: calculateTotal(),
            };

            const response = await axios.post("/orders", orderData);

            if (response.data.status === "success") {
                // Redirect to success page or dashboard
                router.visit("/dashboard", {
                    data: { message: "Order placed successfully!" },
                });
            }
        } catch (error) {
            console.error("Error placing order:", error);
        } finally {
            setOrderLoading(false);
        }
    };
    if (loading) {
        console.log("Checkout component: In loading state");
        return (
            <InfocusLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-[#68b94c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading checkout...</p>
                        {authError && (
                            <p className="text-red-600 mt-4">{authError}</p>
                        )}
                    </div>
                </div>
            </InfocusLayout>
        );
    }

    if (!isAuthenticated) {
        console.log("Checkout component: User not authenticated");
        return (
            <InfocusLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                            <CardTitle>Authentication Required</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-gray-600 mb-6">
                                Please log in to continue with your checkout.
                            </p>
                            <Button
                                onClick={() => router.visit("/login")}
                                className="bg-[#68b94c] hover:bg-[#5ba33e] w-full"
                            >
                                Go to Login
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </InfocusLayout>
        );
    }
    if (cartItems.length === 0) {
        console.log("Checkout component: Cart is empty, cartItems:", cartItems);
        return (
            <InfocusLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <CardTitle>Empty Cart</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-gray-600 mb-6">
                                Your cart is empty. Add some items before
                                checkout.
                            </p>
                            <Button
                                onClick={() => router.visit("/")}
                                className="bg-[#68b94c] hover:bg-[#5ba33e] w-full"
                            >
                                Continue Shopping
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </InfocusLayout>
        );
    }

    console.log("Checkout component: Rendering main checkout page");
    return (
        <InfocusLayout>
            <Head title="Checkout" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Checkout
                        </h1>
                        <p className="text-gray-600">
                            Complete your order in just a few steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Checkout Form */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Customer Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 bg-[#68b94c] rounded-full flex items-center justify-center text-white font-semibold">
                                            {user?.name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {user?.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Shipping Address */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Shipping Address
                                        </CardTitle>
                                        <Dialog
                                            open={showAddressDialog}
                                            onOpenChange={setShowAddressDialog}
                                        >
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingAddress(null);
                                                        reset();
                                                    }}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Address
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        {editingAddress
                                                            ? "Edit Address"
                                                            : "Add New Address"}
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="title">
                                                            Address Title
                                                        </Label>
                                                        <Input
                                                            id="title"
                                                            placeholder="e.g. Home, Office"
                                                            value={data.title}
                                                            onChange={(e) =>
                                                                setData(
                                                                    "title",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="recipient_name">
                                                            Full Name *
                                                        </Label>
                                                        <Input
                                                            id="recipient_name"
                                                            placeholder="John Doe"
                                                            value={
                                                                data.recipient_name
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "recipient_name",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="phone_number">
                                                            Phone Number *
                                                        </Label>
                                                        <Input
                                                            id="phone_number"
                                                            placeholder="+91 98765 43210"
                                                            value={
                                                                data.phone_number
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "phone_number",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="alternate_phone">
                                                            Alternate Phone
                                                        </Label>
                                                        <Input
                                                            id="alternate_phone"
                                                            placeholder="+91 98765 43210"
                                                            value={
                                                                data.alternate_phone
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "alternate_phone",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="address_line_1">
                                                            Address Line 1 *
                                                        </Label>
                                                        <Textarea
                                                            id="address_line_1"
                                                            placeholder="House/Flat No., Building Name"
                                                            value={
                                                                data.address_line_1
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "address_line_1",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="address_line_2">
                                                            Address Line 2
                                                        </Label>
                                                        <Textarea
                                                            id="address_line_2"
                                                            placeholder="Street, Area, Landmark"
                                                            value={
                                                                data.address_line_2
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "address_line_2",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="city">
                                                                City *
                                                            </Label>
                                                            <Input
                                                                id="city"
                                                                placeholder="Mumbai"
                                                                value={
                                                                    data.city
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "city",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="state">
                                                                State *
                                                            </Label>
                                                            <Input
                                                                id="state"
                                                                placeholder="Maharashtra"
                                                                value={
                                                                    data.state
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "state",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="postal_code">
                                                                PIN Code *
                                                            </Label>
                                                            <Input
                                                                id="postal_code"
                                                                placeholder="400001"
                                                                value={
                                                                    data.postal_code
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "postal_code",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="country">
                                                                Country *
                                                            </Label>
                                                            <Input
                                                                id="country"
                                                                value={
                                                                    data.country
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "country",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="is_default"
                                                            checked={
                                                                data.is_default
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                setData(
                                                                    "is_default",
                                                                    checked as boolean
                                                                )
                                                            }
                                                        />
                                                        <Label htmlFor="is_default">
                                                            Set as default
                                                            address
                                                        </Label>
                                                    </div>
                                                    <div className="flex gap-4 pt-4">
                                                        <Button
                                                            onClick={() =>
                                                                setShowAddressDialog(
                                                                    false
                                                                )
                                                            }
                                                            variant="outline"
                                                            className="flex-1"
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            onClick={
                                                                saveAddress
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            className="flex-1 bg-[#68b94c] hover:bg-[#5ba33e]"
                                                        >
                                                            {processing
                                                                ? "Saving..."
                                                                : "Save Address"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {addresses.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600 mb-4">
                                                No addresses found
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Please add a shipping address to
                                                continue
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {addresses.map((address) => (
                                                <div
                                                    key={address.id}
                                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                        selectedShippingAddress ===
                                                        address.id
                                                            ? "border-[#68b94c] bg-green-50"
                                                            : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedShippingAddress(
                                                            address.id
                                                        );
                                                        if (sameAsBilling) {
                                                            setSelectedBillingAddress(
                                                                address.id
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h4 className="font-medium">
                                                                    {
                                                                        address.title
                                                                    }
                                                                </h4>
                                                                {address.is_default && (
                                                                    <Badge variant="secondary">
                                                                        Default
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="font-medium text-gray-900">
                                                                {
                                                                    address.recipient_name
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {
                                                                    address.phone_number
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {
                                                                    address.address_line_1
                                                                }
                                                                {address.address_line_2 &&
                                                                    `, ${address.address_line_2}`}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {address.city},{" "}
                                                                {address.state}{" "}
                                                                {
                                                                    address.postal_code
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {
                                                                    address.country
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    editAddress(
                                                                        address
                                                                    );
                                                                }}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    deleteAddress(
                                                                        address.id
                                                                    );
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Billing Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Billing Address
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="same_as_shipping"
                                                checked={sameAsBilling}
                                                onCheckedChange={(checked) => {
                                                    setSameAsBilling(
                                                        checked as boolean
                                                    );
                                                    if (checked) {
                                                        setSelectedBillingAddress(
                                                            selectedShippingAddress
                                                        );
                                                    } else {
                                                        setSelectedBillingAddress(
                                                            null
                                                        );
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="same_as_shipping">
                                                Same as shipping address
                                            </Label>
                                        </div>

                                        {!sameAsBilling && (
                                            <div className="space-y-4">
                                                {addresses.map((address) => (
                                                    <div
                                                        key={address.id}
                                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                            selectedBillingAddress ===
                                                            address.id
                                                                ? "border-[#68b94c] bg-green-50"
                                                                : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                        onClick={() =>
                                                            setSelectedBillingAddress(
                                                                address.id
                                                            )
                                                        }
                                                    >
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="font-medium">
                                                                {address.title}
                                                            </h4>
                                                            {address.is_default && (
                                                                <Badge variant="secondary">
                                                                    Default
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="font-medium text-gray-900">
                                                            {
                                                                address.recipient_name
                                                            }
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {
                                                                address.phone_number
                                                            }
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {
                                                                address.address_line_1
                                                            }
                                                            {address.address_line_2 &&
                                                                `, ${address.address_line_2}`}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {address.city},{" "}
                                                            {address.state}{" "}
                                                            {
                                                                address.postal_code
                                                            }
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Shipping Method */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="w-5 h-5" />
                                        Shipping Method
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {shippingTypes.length === 0 ? (
                                        <p className="text-gray-600">
                                            No shipping methods available
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {shippingTypes.map(
                                                (shippingType) => (
                                                    <div
                                                        key={shippingType.id}
                                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                            selectedShippingType ===
                                                            shippingType.id
                                                                ? "border-[#68b94c] bg-green-50"
                                                                : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                        onClick={() =>
                                                            setSelectedShippingType(
                                                                shippingType.id
                                                            )
                                                        }
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h4 className="font-medium">
                                                                    {
                                                                        shippingType.name
                                                                    }
                                                                </h4>
                                                                <p className="text-sm text-gray-600">
                                                                    Delivery in{" "}
                                                                    {
                                                                        shippingType.estimated_delivery_days
                                                                    }{" "}
                                                                    days
                                                                </p>
                                                                {shippingType.description && (
                                                                    <p className="text-sm text-gray-500 mt-1">
                                                                        {
                                                                            shippingType.description
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <p className="font-semibold text-[#68b94c]">
                                                                {formatCurrency(
                                                                    shippingType.price
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-8">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {" "}
                                    {/* Cart Items */}
                                    <div className="space-y-3">
                                        {cartItems.map((item) => (
                                            <div
                                                key={item.cart_item_id}
                                                className="flex gap-3"
                                            >
                                                {" "}
                                                <img
                                                    src={
                                                        item.saved_design
                                                            .thumbnail ||
                                                        "/assets/placeholder.jpg"
                                                    }
                                                    alt="Product"
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                    onError={(e) => {
                                                        console.error(
                                                            `Failed to load order summary image: ${item.saved_design.thumbnail}`
                                                        );
                                                        const target =
                                                            e.target as HTMLImageElement;
                                                        target.src =
                                                            "/assets/placeholder.jpg";
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {
                                                            item.saved_design
                                                                .product_variation
                                                                .product.name
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        Size:{" "}
                                                        {
                                                            item.saved_design
                                                                .product_variation
                                                                .label
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        Qty: {item.quantity}
                                                    </p>
                                                    {item.saved_design
                                                        .image_effect && (
                                                        <p className="text-xs text-gray-500">
                                                            Effect:{" "}
                                                            {
                                                                item
                                                                    .saved_design
                                                                    .image_effect
                                                                    .name
                                                            }
                                                        </p>
                                                    )}
                                                    {item.saved_design
                                                        .edge_design && (
                                                        <p className="text-xs text-gray-500">
                                                            Edge:{" "}
                                                            {
                                                                item
                                                                    .saved_design
                                                                    .edge_design
                                                                    .name
                                                            }
                                                        </p>
                                                    )}
                                                    {item.saved_design
                                                        .hanging_mechanism && (
                                                        <p className="text-xs text-gray-500">
                                                            Hanging: Yes
                                                            {item.saved_design
                                                                .hanging_variety &&
                                                                ` (${item.saved_design.hanging_variety.name})`}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-sm">
                                                        {formatCurrency(
                                                            item.total_price ||
                                                                item.unit_price *
                                                                    item.quantity
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatCurrency(
                                                            item.unit_price
                                                        )}{" "}
                                                        each
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Separator />
                                    {/* Price Breakdown */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>
                                                Subtotal ({cartItems.length}{" "}
                                                items)
                                            </span>
                                            <span>
                                                {formatCurrency(
                                                    calculateSubtotal()
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Shipping</span>
                                            <span>
                                                {formatCurrency(
                                                    calculateShippingCost()
                                                )}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total</span>
                                            <span className="text-[#68b94c]">
                                                {formatCurrency(
                                                    calculateTotal()
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Validation Messages */}
                                    {(!selectedShippingAddress ||
                                        !selectedShippingType) && (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                Please select shipping address
                                                and shipping method to continue.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    {/* Place Order Button */}
                                    <Button
                                        onClick={placeOrder}
                                        disabled={
                                            !selectedShippingAddress ||
                                            !selectedShippingType ||
                                            orderLoading ||
                                            cartItems.length === 0
                                        }
                                        className="w-full bg-[#68b94c] hover:bg-[#5ba33e] py-3"
                                        size="lg"
                                    >
                                        {orderLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                Place Order
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-gray-500 text-center">
                                        By placing your order, you agree to our
                                        Terms of Service and Privacy Policy.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </InfocusLayout>
    );
};

export default Checkout;
