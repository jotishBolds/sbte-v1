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
    Truck,
} from "lucide-react";
import axios from "axios";

interface SavedDesign {
    id: number;
    thumbnail: string;
    status: "Draft" | "Finalized" | "Carted";
    created_at: string;
    productVariation?: {
        id: number;
        label: string;
        price: number;
        product: {
            id: number;
            name: string;
            category: string;
        };
    };
    product_variation?: {
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
        product_variation: {
            id: number;
            label: string;
            product: {
                id: number;
                name: string;
                category: string;
            };
        };
    }>;
}

interface CartItem {
    id: number;
    cart_item_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    added_at: string;
    saved_design: {
        id: number;
        thumbnail: string | null;
        status: string;
        created_at: string;
        product_variation: {
            id: number;
            label: string;
            price: number;
            product: {
                id: number;
                name: string;
                category: string;
            };
        };
        image_effect?: {
            id: number;
            name: string;
        } | null;
        edge_design?: {
            id: number;
            name: string;
        } | null;
        hanging_mechanism: boolean;
        hanging_variety?: {
            id: number;
            name: string;
        } | null;
        attributes: Array<{
            attribute_name: string;
            attribute_value: string;
        }>;
        images: Array<{
            image_url: string;
            position: number;
        }>;
    };
}

interface Address {
    id: number;
    customer_id: number;
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
    created_at: string;
}

export default function Dashboard() {
    const { auth } = usePage().props as any;
    const [activeSection, setActiveSection] = useState("overview");
    const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);

    // Helper function to get product variation data (handles both camelCase and snake_case)
    const getProductVariation = (design: SavedDesign) => {
        return design.productVariation || design.product_variation;
    };

    // Debug logging
    console.log("Dashboard rendered with auth:", auth);
    console.log("Active section:", activeSection); // Fetch data when component mounts or section changes
    useEffect(() => {
        if (activeSection === "saved-designs") {
            fetchSavedDesigns();
        } else if (activeSection === "orders") {
            fetchOrders();
        } else if (activeSection === "cart") {
            fetchCartItems();
        } else if (activeSection === "addresses") {
            fetchAddresses();
        }
    }, [activeSection]); // Fetch overview data on mount
    useEffect(() => {
        console.log("Dashboard mount effect running...");
        try {
            fetchSavedDesigns();
            fetchCartItems();
        } catch (error) {
            console.error("Error in mount effect:", error);
        }
    }, []);
    const fetchSavedDesigns = async () => {
        try {
            setLoading(true);
            console.log("Fetching saved designs...");
            const response = await axios.get("/saved-designs/customer");
            console.log("Saved designs response:", response.data);
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
            console.log("Fetching orders...");
            const response = await axios.get("/orders/customer");
            console.log("Orders response:", response.data);
            if (response.data.status === "success") {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };
    const fetchCartItems = async () => {
        try {
            setLoading(true);
            console.log("Fetching cart items...");
            const response = await axios.get("/shopping-cart/customer");
            console.log("Cart items response:", response.data);
            if (response.data.status === "success") {
                setCartItems(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch cart items:", error);
            if (axios.isAxiosError(error)) {
                console.error("Response status:", error.response?.status);
                console.error("Response data:", error.response?.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            console.log("Fetching addresses...");
            const response = await axios.get("/addresses/customer");
            console.log("Addresses response:", response.data);
            if (response.data.status === "success") {
                setAddresses(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
            if (axios.isAxiosError(error)) {
                console.error("Response status:", error.response?.status);
                console.error("Response data:", error.response?.data);
            }
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
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
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
    const renderOverview = () => {
        try {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Saved Designs
                                        </p>{" "}
                                        <p className="text-2xl font-bold">
                                            {savedDesigns?.length || 0}
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
                                        </p>{" "}
                                        <p className="text-2xl font-bold">
                                            {cartItems?.length || 0}
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
                                        </p>{" "}
                                        <p className="text-2xl font-bold">
                                            {orders?.length || 0}
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
                                            {" "}
                                            {formatPrice(
                                                (orders || []).reduce(
                                                    (sum, order) =>
                                                        sum +
                                                        order.total_amount,
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
                            </CardHeader>{" "}
                            <CardContent>
                                {savedDesigns && savedDesigns.length > 0 ? (
                                    savedDesigns.slice(0, 3).map((design) => (
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
                                            />{" "}
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {getProductVariation(
                                                        design
                                                    )?.product?.name?.replace(
                                                        /_/g,
                                                        " "
                                                    ) || "Unknown Product"}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {getProductVariation(design)
                                                        ?.label || "No label"}
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
                                    ))
                                ) : (
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
                                    {" "}
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    View Shopping Cart ({cartItems?.length || 0}
                                    )
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
        } catch (error) {
            console.error("Error in renderOverview:", error);
            return <div>Error loading overview</div>;
        }
    };
    const renderSavedDesigns = () => {
        try {
            return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">
                                Saved Designs
                            </h2>
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
                            {savedDesigns && savedDesigns.length > 0
                                ? savedDesigns.map((design) => (
                                      <Card
                                          key={design.id}
                                          className="overflow-hidden"
                                      >
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
                                                  {" "}
                                                  <div>
                                                      <h3 className="font-semibold">
                                                          {getProductVariation(
                                                              design
                                                          )?.product?.name?.replace(
                                                              /_/g,
                                                              " "
                                                          ) ||
                                                              "Unknown Product"}
                                                      </h3>
                                                      <p className="text-sm text-gray-500">
                                                          {getProductVariation(
                                                              design
                                                          )?.label ||
                                                              "No label"}
                                                      </p>
                                                  </div>
                                                  <span
                                                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                                          design.status
                                                      )}`}
                                                  >
                                                      {design.status}
                                                  </span>
                                              </div>{" "}
                                              <p className="text-lg font-bold mb-2">
                                                  {getProductVariation(design)
                                                      ?.price
                                                      ? formatPrice(
                                                            getProductVariation(
                                                                design
                                                            )!.price
                                                        )
                                                      : "Price unavailable"}
                                              </p>
                                              <p className="text-sm text-gray-500 mb-4">
                                                  Created{" "}
                                                  {formatDate(
                                                      design.created_at
                                                  )}
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
                                                          deleteSavedDesign(
                                                              design.id
                                                          )
                                                      }
                                                      className="text-red-600 hover:text-red-700"
                                                  >
                                                      <Trash2 className="h-3 w-3" />
                                                  </Button>
                                              </div>
                                          </CardContent>
                                      </Card>
                                  ))
                                : null}
                        </div>
                    )}

                    {(!savedDesigns || savedDesigns.length === 0) &&
                        !loading && (
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
        } catch (error) {
            console.error("Error in renderSavedDesigns:", error);
            return (
                <div className="text-center py-8">
                    <p className="text-red-500">Error loading saved designs</p>
                    <p className="text-sm text-gray-500">
                        Check console for details
                    </p>
                </div>
            );
        }
    };
    const renderCart = () => {
        try {
            return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">
                                Shopping Cart
                            </h2>
                            <p className="text-gray-500">
                                Review items before checkout
                            </p>
                        </div>
                        {cartItems && cartItems.length > 0 && (
                            <Button>Proceed to Checkout</Button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems && cartItems.length > 0
                                ? cartItems.map((item) => (
                                      <Card key={item.id}>
                                          <CardContent className="p-6">
                                              <div className="flex items-center space-x-4">
                                                  {" "}
                                                  <img
                                                      src={
                                                          item.saved_design
                                                              ?.thumbnail ||
                                                          "/api/placeholder/80/80"
                                                      }
                                                      alt="Design thumbnail"
                                                      className="w-20 h-20 rounded object-cover"
                                                  />
                                                  <div className="flex-1">
                                                      {" "}
                                                      <h3 className="font-semibold">
                                                          {item.saved_design?.product_variation?.product?.name?.replace(
                                                              /_/g,
                                                              " "
                                                          ) ||
                                                              "Unknown Product"}
                                                      </h3>
                                                      <p className="text-sm text-gray-500">
                                                          {item.saved_design
                                                              ?.product_variation
                                                              ?.label ||
                                                              "No label"}
                                                      </p>
                                                      <p className="text-lg font-bold">
                                                          {formatPrice(
                                                              item.unit_price
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
                                                      </p>{" "}
                                                      <p className="font-bold text-lg">
                                                          {formatPrice(
                                                              item.total_price
                                                          )}
                                                      </p>
                                                  </div>
                                                  <Button
                                                      variant="outline"
                                                      size="sm"
                                                  >
                                                      <Trash2 className="h-4 w-4" />
                                                  </Button>
                                              </div>
                                          </CardContent>
                                      </Card>
                                  ))
                                : null}
                        </div>
                    )}

                    {cartItems && cartItems.length > 0 && (
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center text-xl font-bold">
                                    <span>Cart Total:</span>
                                    <span>
                                        {formatPrice(
                                            cartItems.reduce(
                                                (sum, item) =>
                                                    sum + item.total_price,
                                                0
                                            )
                                        )}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {(!cartItems || cartItems.length === 0) && !loading && (
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
        } catch (error) {
            console.error("Error in renderCart:", error);
            return (
                <div className="text-center py-8">
                    <p className="text-red-500">Error loading cart</p>
                    <p className="text-sm text-gray-500">
                        Check console for details
                    </p>
                </div>
            );
        }
    };
    const renderOrders = () => {
        try {
            return (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold">Order History</h2>
                        <p className="text-gray-500">
                            Track your previous orders
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            {orders && orders.length > 0
                                ? orders.map((order) => (
                                      <Card key={order.id}>
                                          <CardHeader>
                                              <div className="flex justify-between items-start">
                                                  <div>
                                                      <CardTitle>
                                                          Order #{order.id}
                                                      </CardTitle>
                                                      <CardDescription>
                                                          Placed on{" "}
                                                          {formatDate(
                                                              order.created_at
                                                          )}
                                                      </CardDescription>
                                                  </div>
                                                  <div className="text-right">
                                                      <p className="text-2xl font-bold">
                                                          {formatPrice(
                                                              order.total_amount
                                                          )}
                                                      </p>
                                                      <div className="flex space-x-2 mt-2">
                                                          <span
                                                              className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                                                  order.order_status
                                                              )}`}
                                                          >
                                                              {
                                                                  order.order_status
                                                              }
                                                          </span>
                                                          <span
                                                              className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                                                  order.payment_status
                                                              )}`}
                                                          >
                                                              {
                                                                  order.payment_status
                                                              }
                                                          </span>
                                                      </div>
                                                  </div>
                                              </div>
                                          </CardHeader>
                                          <CardContent>
                                              <div className="space-y-3">
                                                  {order.orderItems &&
                                                  order.orderItems.length >
                                                      0 ? (
                                                      order.orderItems.map(
                                                          (item) => (
                                                              <div
                                                                  key={item.id}
                                                                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                                                              >
                                                                  <img
                                                                      src={
                                                                          item.thumbnail ||
                                                                          "/api/placeholder/60/60"
                                                                      }
                                                                      alt="Product thumbnail"
                                                                      className="w-12 h-12 rounded object-cover"
                                                                  />
                                                                  <div className="flex-1">
                                                                      <h4 className="font-medium">
                                                                          {item.product_variation?.product?.name?.replace(
                                                                              /_/g,
                                                                              " "
                                                                          ) ||
                                                                              "Unknown Product"}
                                                                      </h4>
                                                                      <p className="text-sm text-gray-500">
                                                                          {item
                                                                              .product_variation
                                                                              ?.label ||
                                                                              "No label"}
                                                                      </p>
                                                                  </div>
                                                                  <div className="text-right">
                                                                      <p className="font-semibold">
                                                                          Qty:{" "}
                                                                          {
                                                                              item.quantity
                                                                          }
                                                                      </p>
                                                                      <p className="text-sm text-gray-500">
                                                                          {formatPrice(
                                                                              item.unit_price
                                                                          )}{" "}
                                                                          each
                                                                      </p>
                                                                  </div>
                                                                  <div className="text-right">
                                                                      <p className="font-bold">
                                                                          {formatPrice(
                                                                              item.total_price
                                                                          )}
                                                                      </p>
                                                                  </div>
                                                              </div>
                                                          )
                                                      )
                                                  ) : (
                                                      <p className="text-gray-500 text-center py-4">
                                                          No items in this order
                                                      </p>
                                                  )}
                                              </div>
                                              <div className="mt-4 flex justify-end space-x-2">
                                                  <Button
                                                      variant="outline"
                                                      size="sm"
                                                  >
                                                      <Eye className="mr-2 h-4 w-4" />
                                                      View Details
                                                  </Button>
                                                  <Button
                                                      variant="outline"
                                                      size="sm"
                                                  >
                                                      <Download className="mr-2 h-4 w-4" />
                                                      Download Invoice
                                                  </Button>
                                              </div>
                                          </CardContent>
                                      </Card>
                                  ))
                                : null}
                        </div>
                    )}

                    {(!orders || orders.length === 0) && !loading && (
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
        } catch (error) {
            console.error("Error in renderOrders:", error);
            return (
                <div className="text-center py-8">
                    <p className="text-red-500">Error loading orders</p>
                    <p className="text-sm text-gray-500">
                        Check console for details
                    </p>
                </div>
            );
        }
    };
    const renderAddresses = () => {
        try {
            return (
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

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2].map((i) => (
                                <Card key={i} className="p-6">
                                    <div className="animate-pulse space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : addresses && addresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {addresses.map((address) => (
                                <Card key={address.id} className="relative">
                                    {" "}
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    <span className="flex items-center">
                                                        <MapPin className="mr-2 h-4 w-4" />
                                                        {address.title}
                                                    </span>
                                                </CardTitle>
                                                {address.is_default && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mt-2">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {address.recipient_name}
                                            </p>
                                            <p className="text-gray-600">
                                                {address.address_line_1}
                                            </p>
                                            {address.address_line_2 && (
                                                <p className="text-gray-600">
                                                    {address.address_line_2}
                                                </p>
                                            )}
                                            <p className="text-gray-600">
                                                {address.city}, {address.state}{" "}
                                                {address.postal_code}
                                            </p>
                                            <p className="text-gray-600">
                                                {address.country}
                                            </p>
                                            <div className="flex items-center space-x-4 mt-3 pt-3 border-t">
                                                <p className="text-sm text-gray-500">
                                                    📞 {address.phone_number}
                                                </p>
                                                {address.alternate_phone && (
                                                    <p className="text-sm text-gray-500">
                                                        📱{" "}
                                                        {
                                                            address.alternate_phone
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
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
                    )}
                </div>
            );
        } catch (error) {
            console.error("Error in renderAddresses:", error);
            return (
                <div className="text-center py-8">
                    <p className="text-red-500">Error loading addresses</p>
                    <p className="text-sm text-gray-500">
                        Check console for details
                    </p>
                </div>
            );
        }
    };

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
        console.log("Rendering content for section:", activeSection);
        try {
            // Simple test to see if basic rendering works
            if (activeSection === "test") {
                return (
                    <div className="p-8 text-center">Test content works!</div>
                );
            }

            switch (activeSection) {
                case "overview":
                    console.log("Rendering overview...");
                    return renderOverview();
                case "saved-designs":
                    console.log("Rendering saved designs...");
                    return renderSavedDesigns();
                case "cart":
                    console.log("Rendering cart...");
                    return renderCart();
                case "orders":
                    console.log("Rendering orders...");
                    return renderOrders();
                case "addresses":
                    console.log("Rendering addresses...");
                    return renderAddresses();
                case "profile":
                    console.log("Rendering profile...");
                    return renderProfile();
                default:
                    console.log("Rendering default (overview)...");
                    return renderOverview();
            }
        } catch (error) {
            console.error("Error rendering content:", error);
            console.error("Error stack:", (error as Error)?.stack);
            return (
                <div className="text-center py-8">
                    <p className="text-red-500">
                        Error loading dashboard content
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Check console for details
                    </p>
                    <button
                        onClick={() => setActiveSection("test")}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Test Simple Render
                    </button>
                </div>
            );
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
