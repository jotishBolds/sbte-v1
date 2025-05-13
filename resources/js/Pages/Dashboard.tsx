import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    DollarSign,
    ShoppingCart,
    Users,
    Image,
    Clock,
    ArrowUpRight,
} from "lucide-react";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered";

interface Order {
    id: number;
    date: string;
    amount: number;
    status: OrderStatus;
    items: number;
}

interface TopProduct {
    id: number;
    name: string;
    sales: number;
}

export default function Dashboard() {
    // Sample data - in a real app, this would come from your API/backend
    const [recentOrders] = useState<Order[]>([
        {
            id: 1,
            date: "2025-03-30",
            amount: 129.99,
            status: "pending",
            items: 2,
        },
        {
            id: 2,
            date: "2025-03-29",
            amount: 89.5,
            status: "processing",
            items: 1,
        },
        {
            id: 3,
            date: "2025-03-29",
            amount: 234.0,
            status: "shipped",
            items: 3,
        },
        {
            id: 4,
            date: "2025-03-28",
            amount: 75.25,
            status: "delivered",
            items: 1,
        },
        {
            id: 5,
            date: "2025-03-28",
            amount: 159.99,
            status: "processing",
            items: 2,
        },
    ]);

    const [topProducts] = useState<TopProduct[]>([
        { id: 1, name: "Minimalist Black Frame (18×24)", sales: 42 },
        { id: 2, name: "Wooden Rustic Frame (12×16)", sales: 38 },
        { id: 3, name: "Gold Elegant Frame (24×36)", sales: 27 },
        { id: 4, name: "Modern White Frame (16×20)", sales: 23 },
    ]);

    const spendingData = [
        { name: "Jan", spending: 120 },
        { name: "Feb", spending: 190 },
        { name: "Mar", spending: 150 },
    ];

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "processing":
                return "bg-blue-100 text-blue-800";
            case "shipped":
                return "bg-purple-100 text-purple-800";
            case "delivered":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Your Infocused Frames
                    </h2>
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">Today:</span>{" "}
                        {new Date().toLocaleDateString()}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Stats Overview */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Total Spent
                                        </p>
                                        <p className="text-2xl font-bold">
                                            ₹4460.24
                                        </p>
                                        <p className="mt-1 text-xs text-green-600 flex items-center">
                                            <ArrowUpRight className="w-3 h-3 mr-1" />
                                            3 orders this month
                                        </p>
                                    </div>
                                    <div
                                        className="rounded-full p-3"
                                        style={{
                                            backgroundColor:
                                                "rgba(109, 182, 78, 0.1)",
                                        }}
                                    >
                                        <DollarSign
                                            className="h-6 w-6"
                                            style={{ color: "#6db64e" }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Your Orders
                                        </p>
                                        <p className="text-2xl font-bold">5</p>
                                        <p className="mt-1 text-xs text-green-600 flex items-center">
                                            <ArrowUpRight className="w-3 h-3 mr-1" />
                                            2 new this week
                                        </p>
                                    </div>
                                    <div
                                        className="rounded-full p-3"
                                        style={{
                                            backgroundColor:
                                                "rgba(109, 182, 78, 0.1)",
                                        }}
                                    >
                                        <ShoppingCart
                                            className="h-6 w-6"
                                            style={{ color: "#6db64e" }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Pending Orders
                                        </p>
                                        <p className="text-2xl font-bold">2</p>
                                        <p className="mt-1 text-xs text-orange-500 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            Awaiting processing
                                        </p>
                                    </div>
                                    <div
                                        className="rounded-full p-3"
                                        style={{
                                            backgroundColor:
                                                "rgba(109, 182, 78, 0.1)",
                                        }}
                                    >
                                        <Clock
                                            className="h-6 w-6"
                                            style={{ color: "#6db64e" }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Spending Chart */}
                        <Card className="col-span-1 md:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle
                                    className="text-lg font-bold"
                                    style={{ color: "#6db64e" }}
                                >
                                    Your Spending
                                </CardTitle>
                                <CardDescription>
                                    Overview of your spending this year
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart data={spendingData}>
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar
                                                dataKey="spending"
                                                fill="#6db64e"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Links */}
                        <Card className="col-span-1">
                            <CardHeader className="pb-2">
                                <CardTitle
                                    className="text-lg font-bold"
                                    style={{ color: "#6db64e" }}
                                >
                                    Quick Links
                                </CardTitle>
                                <CardDescription>
                                    Access your favorite features
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <button
                                        className="w-full px-4 py-2 text-sm font-medium text-white rounded-md"
                                        style={{ backgroundColor: "#6db64e" }}
                                    >
                                        Create New Order
                                    </button>
                                    <button
                                        className="w-full px-4 py-2 text-sm font-medium rounded-md border"
                                        style={{
                                            color: "#6db64e",
                                            borderColor: "#6db64e",
                                        }}
                                    >
                                        Browse Designs
                                    </button>
                                    <button
                                        className="w-full px-4 py-2 text-sm font-medium rounded-md border"
                                        style={{
                                            color: "#6db64e",
                                            borderColor: "#6db64e",
                                        }}
                                    >
                                        Track Orders
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Orders and Products */}
                    <div className="mt-6">
                        <Tabs defaultValue="orders" className="w-full">
                            <TabsList className="mb-4">
                                <TabsTrigger
                                    value="orders"
                                    className="px-4 py-2"
                                >
                                    Your Orders
                                </TabsTrigger>
                                <TabsTrigger
                                    value="products"
                                    className="px-4 py-2"
                                >
                                    Popular Products
                                </TabsTrigger>
                                <TabsTrigger
                                    value="design-templates"
                                    className="px-4 py-2"
                                >
                                    Design Templates
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="orders" className="space-y-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle
                                            className="text-lg font-bold"
                                            style={{ color: "#6db64e" }}
                                        >
                                            Recent Orders
                                        </CardTitle>
                                        <CardDescription>
                                            Your latest frame orders
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Order
                                                        </th>
                                                        <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Date
                                                        </th>
                                                        <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Amount
                                                        </th>
                                                        <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Status
                                                        </th>
                                                        <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Items
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentOrders.map(
                                                        (order) => (
                                                            <tr
                                                                key={order.id}
                                                                className="border-b hover:bg-gray-50"
                                                            >
                                                                <td className="py-3 px-2 text-sm">
                                                                    #{" "}
                                                                    {order.id
                                                                        .toString()
                                                                        .padStart(
                                                                            4,
                                                                            "0"
                                                                        )}
                                                                </td>
                                                                <td className="py-3 px-2 text-sm">
                                                                    {new Date(
                                                                        order.date
                                                                    ).toLocaleDateString()}
                                                                </td>
                                                                <td className="py-3 px-2 text-sm">
                                                                    $
                                                                    {order.amount.toFixed(
                                                                        2
                                                                    )}
                                                                </td>
                                                                <td className="py-3 px-2 text-sm">
                                                                    <span
                                                                        className={`rounded-full px-2 py-1 text-xs ${getStatusColor(
                                                                            order.status
                                                                        )}`}
                                                                    >
                                                                        {order.status
                                                                            .charAt(
                                                                                0
                                                                            )
                                                                            .toUpperCase() +
                                                                            order.status.slice(
                                                                                1
                                                                            )}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-2 text-sm text-center">
                                                                    {
                                                                        order.items
                                                                    }
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                className="px-4 py-2 text-sm font-medium text-white rounded-md"
                                                style={{
                                                    backgroundColor: "#6db64e",
                                                }}
                                            >
                                                View All Orders
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="products" className="space-y-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle
                                            className="text-lg font-bold"
                                            style={{ color: "#6db64e" }}
                                        >
                                            Popular Products
                                        </CardTitle>
                                        <CardDescription>
                                            Our best-selling frames
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Product
                                                        </th>
                                                        <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Sales
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {topProducts.map(
                                                        (product) => (
                                                            <tr
                                                                key={product.id}
                                                                className="border-b hover:bg-gray-50"
                                                            >
                                                                <td className="py-3 px-2 text-sm font-medium">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-2 text-sm">
                                                                    {
                                                                        product.sales
                                                                    }{" "}
                                                                    units sold
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                className="px-4 py-2 text-sm font-medium text-white rounded-md"
                                                style={{
                                                    backgroundColor: "#6db64e",
                                                }}
                                            >
                                                Shop Now
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent
                                value="design-templates"
                                className="space-y-4"
                            >
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle
                                            className="text-lg font-bold"
                                            style={{ color: "#6db64e" }}
                                        >
                                            Design Templates
                                        </CardTitle>
                                        <CardDescription>
                                            Popular frame and print templates
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="border rounded-md overflow-hidden">
                                                <div className="h-32 bg-gray-200 flex items-center justify-center">
                                                    <img
                                                        src="/api/placeholder/250/150"
                                                        alt="Template 1"
                                                        className="max-h-full object-cover"
                                                    />
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-medium">
                                                        Minimalist Portrait
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        Black frame, white mat
                                                    </p>
                                                    <div className="mt-2 flex justify-between items-center">
                                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            Popular Choice
                                                        </span>
                                                        <button
                                                            className="text-xs"
                                                            style={{
                                                                color: "#6db64e",
                                                            }}
                                                        >
                                                            Use Template
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border rounded-md overflow-hidden">
                                                <div className="h-32 bg-gray-200 flex items-center justify-center">
                                                    <img
                                                        src="/api/placeholder/250/150"
                                                        alt="Template 2"
                                                        className="max-h-full object-cover"
                                                    />
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-medium">
                                                        Gallery Collection
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        Multi-frame set (3pcs)
                                                    </p>
                                                    <div className="mt-2 flex justify-between items-center">
                                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            Trending
                                                        </span>
                                                        <button
                                                            className="text-xs"
                                                            style={{
                                                                color: "#6db64e",
                                                            }}
                                                        >
                                                            Use Template
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border rounded-md overflow-hidden">
                                                <div className="h-32 bg-gray-200 flex items-center justify-center">
                                                    <img
                                                        src="/api/placeholder/250/150"
                                                        alt="Template 3"
                                                        className="max-h-full object-cover"
                                                    />
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-medium">
                                                        Wooden Classic
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        Natural wood, no mat
                                                    </p>
                                                    <div className="mt-2 flex justify-between items-center">
                                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            Classic Style
                                                        </span>
                                                        <button
                                                            className="text-xs"
                                                            style={{
                                                                color: "#6db64e",
                                                            }}
                                                        >
                                                            Use Template
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                className="px-4 py-2 text-sm font-medium text-white rounded-md"
                                                style={{
                                                    backgroundColor: "#6db64e",
                                                }}
                                            >
                                                Create Custom Design
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
