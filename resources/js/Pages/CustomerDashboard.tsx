import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    Package,
    ShoppingCart,
    Heart,
    User,
    FileImage,
    MapPin,
    CreditCard,
    Calendar,
    Eye,
    Edit,
    Trash2,
    Download,
    Plus,
} from "lucide-react";
import axios from "axios";

interface SavedDesign {
    id: number;
    thumbnail: string;
    status: "Draft" | "Finalized" | "Carted";
    created_at: string;
    productVariation: {
        id: number;
        label: string;
        price: number;
        product: {
            id: number;
            name: string;
            category: string;
        };
    };
    attributes: Array<{
        attribute_name: string;
        attribute_value: string;
    }>;
    images: Array<{
        image_url: string;
        position: number;
    }>;
}

interface Order {
    id: number;
    total_amount: number;
    order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "canceled"
        | "returned";
    payment_status: "pending" | "paid" | "failed" | "refunded";
    created_at: string;
    orderItems: Array<{
        id: number;
        quantity: number;
        unit_price: number;
        total_price: number;
        thumbnail: string;
    }>;
}

interface CartItem {
    id: number;
    quantity: number;
    saved_design: SavedDesign;
}

export default function CustomerDashboard() {
    const { auth } = usePage().props as any;
    const [activeSection, setActiveSection] = useState("overview");
    const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch data when component mounts or section changes
    useEffect(() => {
        if (activeSection === "saved-designs") {
            fetchSavedDesigns();
        } else if (activeSection === "orders") {
            fetchOrders();
        } else if (activeSection === "cart") {
            fetchCartItems();
        }
    }, [activeSection]);

    const fetchSavedDesigns = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/saved-designs/customer");
            if (response.data.status === "success") {
                setSavedDesigns(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch saved designs:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // This would be an actual API endpoint for customer orders
            // For now using sample data
            setOrders([]);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/shopping-cart/customer");
            if (response.data.status === "success") {
                setCartItems(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch cart items:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteSavedDesign = async (id: number) => {
        try {
            await axios.delete(`/saved-designs/${id}`);
            setSavedDesigns(savedDesigns.filter((design) => design.id !== id));
        } catch (error) {
            console.error("Failed to delete saved design:", error);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "draft":
                return "bg-gray-100 text-gray-800";
            case "finalized":
                return "bg-blue-100 text-blue-800";
            case "carted":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "processing":
                return "bg-blue-100 text-blue-800";
            case "shipped":
                return "bg-purple-100 text-purple-800";
            case "delivered":
                return "bg-green-100 text-green-800";
            case "paid":
                return "bg-green-100 text-green-800";
            case "failed":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const sidebarItems = [
        { id: "overview", label: "Overview", icon: Package },
        { id: "saved-designs", label: "Saved Designs", icon: FileImage },
        { id: "cart", label: "Shopping Cart", icon: ShoppingCart },
        { id: "orders", label: "Order History", icon: Package },
        { id: "addresses", label: "Addresses", icon: MapPin },
        { id: "profile", label: "Profile Settings", icon: User },
    ];

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Saved Designs
                                </p>
                                <p className="text-2xl font-bold">
                                    {savedDesigns.length}
                                </p>
                            </div>
                            <FileImage className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Cart Items
                                </p>
                                <p className="text-2xl font-bold">
                                    {cartItems.length}
                                </p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Orders
                                </p>
                                <p className="text-2xl font-bold">
                                    {orders.length}
                                </p>
                            </div>
                            <Package className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Spent
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatPrice(
                                        orders.reduce(
                                            (sum, order) =>
                                                sum + order.total_amount,
                                            0
                                        )
                                    )}
                                </p>
                            </div>
                            <CreditCard className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Designs</CardTitle>
                        <CardDescription>
                            Your latest saved designs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {savedDesigns.slice(0, 3).map((design) => (
                            <div
                                key={design.id}
                                className="flex items-center space-x-4 py-3 border-b last:border-b-0"
                            >
                                <img
                                    src={
                                        design.thumbnail
                                            ? `/storage/${design.thumbnail}`
                                            : "/api/placeholder/60/60"
                                    }
                                    alt="Design thumbnail"
                                    className="w-12 h-12 rounded object-cover"
                                />
                                <div className="flex-1">
                                    <p className="font-medium">
                                        {design.productVariation.product.name.replace(
                                            /_/g,
                                            " "
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {design.productVariation.label}
                                    </p>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                        design.status
                                    )}`}
                                >
                                    {design.status}
                                </span>
                            </div>
                        ))}
                        {savedDesigns.length === 0 && (
                            <p className="text-gray-500 text-center py-8">
                                No saved designs yet
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            className="w-full justify-start"
                            variant="outline"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Design
                        </Button>
                        <Button
                            className="w-full justify-start"
                            variant="outline"
                            onClick={() => setActiveSection("cart")}
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            View Shopping Cart
                        </Button>
                        <Button
                            className="w-full justify-start"
                            variant="outline"
                            onClick={() => setActiveSection("orders")}
                        >
                            <Package className="mr-2 h-4 w-4" />
                            Track Orders
                        </Button>
                        <Button
                            className="w-full justify-start"
                            variant="outline"
                            onClick={() => setActiveSection("profile")}
                        >
                            <User className="mr-2 h-4 w-4" />
                            Update Profile
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderSavedDesigns = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Saved Designs</h2>
                    <p className="text-gray-500">
                        Manage your saved frame designs
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Design
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedDesigns.map((design) => (
                        <Card key={design.id} className="overflow-hidden">
                            <div className="aspect-video bg-gray-100">
                                <img
                                    src={
                                        design.thumbnail
                                            ? `/storage/${design.thumbnail}`
                                            : "/api/placeholder/300/200"
                                    }
                                    alt="Design thumbnail"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold">
                                            {design.productVariation.product.name.replace(
                                                /_/g,
                                                " "
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {design.productVariation.label}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                            design.status
                                        )}`}
                                    >
                                        {design.status}
                                    </span>
                                </div>
                                <p className="text-lg font-bold mb-2">
                                    {formatPrice(design.productVariation.price)}
                                </p>
                                <p className="text-sm text-gray-500 mb-4">
                                    Created {formatDate(design.created_at)}
                                </p>
                                <div className="flex space-x-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <Eye className="mr-1 h-3 w-3" />
                                        View
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <Edit className="mr-1 h-3 w-3" />
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            deleteSavedDesign(design.id)
                                        }
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {savedDesigns.length === 0 && !loading && (
                <Card className="text-center py-12">
                    <CardContent>
                        <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No saved designs yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Start creating your custom frame designs
                        </p>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Your First Design
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const renderCart = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Shopping Cart</h2>
                    <p className="text-gray-500">
                        Review items before checkout
                    </p>
                </div>
                {cartItems.length > 0 && <Button>Proceed to Checkout</Button>}
            </div>

            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <div className="space-y-4">
                    {cartItems.map((item) => (
                        <Card key={item.id}>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={
                                            item.saved_design.thumbnail
                                                ? `/storage/${item.saved_design.thumbnail}`
                                                : "/api/placeholder/80/80"
                                        }
                                        alt="Design thumbnail"
                                        className="w-20 h-20 rounded object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold">
                                            {item.saved_design.productVariation.product.name.replace(
                                                /_/g,
                                                " "
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {
                                                item.saved_design
                                                    .productVariation.label
                                            }
                                        </p>
                                        <p className="text-lg font-bold">
                                            {formatPrice(
                                                item.saved_design
                                                    .productVariation.price
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">
                                            Quantity
                                        </p>
                                        <p className="font-semibold">
                                            {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">
                                            Total
                                        </p>
                                        <p className="font-bold text-lg">
                                            {formatPrice(
                                                item.saved_design
                                                    .productVariation.price *
                                                    item.quantity
                                            )}
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {cartItems.length === 0 && !loading && (
                <Card className="text-center py-12">
                    <CardContent>
                        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            Your cart is empty
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Add some designs to your cart to continue
                        </p>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Browse Designs
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const renderOrders = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Order History</h2>
                <p className="text-gray-500">Track your previous orders</p>
            </div>

            {orders.length === 0 && (
                <Card className="text-center py-12">
                    <CardContent>
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No orders yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Your order history will appear here
                        </p>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Start Shopping
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const renderAddresses = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Addresses</h2>
                    <p className="text-gray-500">
                        Manage your shipping and billing addresses
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Address
                </Button>
            </div>

            <Card className="text-center py-12">
                <CardContent>
                    <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        No addresses saved
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Add your shipping and billing addresses
                    </p>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Address
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    const renderProfile = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Profile Settings</h2>
                <p className="text-gray-500">Manage your account information</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                        Update your personal details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={auth?.user?.name || ""}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={auth?.user?.email || ""}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="pt-4">
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case "overview":
                return renderOverview();
            case "saved-designs":
                return renderSavedDesigns();
            case "cart":
                return renderCart();
            case "orders":
                return renderOrders();
            case "addresses":
                return renderAddresses();
            case "profile":
                return renderProfile();
            default:
                return renderOverview();
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Customer Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex gap-6">
                        {/* Sidebar */}
                        <div className="w-64 flex-shrink-0">
                            <Card className="sticky top-6">
                                <CardContent className="p-0">
                                    <div className="p-6 border-b">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                {auth?.user?.name?.charAt(0) ||
                                                    "U"}
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    {auth?.user?.name || "User"}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Customer
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <nav className="p-2">
                                        {sidebarItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() =>
                                                        setActiveSection(
                                                            item.id
                                                        )
                                                    }
                                                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                                                        activeSection ===
                                                        item.id
                                                            ? "bg-blue-50 text-blue-700 font-medium"
                                                            : "text-gray-700 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                    <span>{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </nav>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">{renderContent()}</div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
