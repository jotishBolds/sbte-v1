import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@inertiajs/react";

interface ProductItem {
    id: number;
    title: string;
    image: string;
    link: string;
    description?: string;
}

interface ProductCategory {
    id: string;
    name: string;
    products: ProductItem[];
}

const ProductShowcase: React.FC = () => {
    const [activeTab, setActiveTab] = useState("canvas-frame");

    const productCategories: ProductCategory[] = [
        {
            id: "canvas-frame",
            name: "Canvas Frame",
            products: [
                {
                    id: 1,
                    title: "CANVAS PRINTS",
                    image: "/assets/canvas/canva.png",
                    link: "/products/canvas-prints",
                    description:
                        "High-quality canvas prints for your home or office",
                },
                {
                    id: 2,
                    title: "CANVAS FRAMES LAYOUT",
                    image: "/assets/canvas/frame-layout.png",
                    link: "/products/canvas-frames-layout",
                    description:
                        "Multiple layout options for your canvas frames",
                },
                {
                    id: 3,
                    title: "SPLIT CANVAS PRINTS",
                    image: "/assets/canvas/split.png",
                    link: "/products/split-canvas-prints",
                    description:
                        "Beautiful split canvas prints for statement walls",
                },
            ],
        },
        {
            id: "fabric-frames",
            name: "Fabric Frames",
            products: [
                {
                    id: 4,
                    title: "FABRIC WALL ART",
                    image: "/assets/canvas/fabric.png",
                    link: "/products/fabric-wall-art",
                    description: "Elegant fabric wall art for modern homes",
                },
                {
                    id: 5,
                    title: "FABRIC FRAME LAYOUT",
                    image: "/assets/canvas/fabric-layout.png",
                    link: "/products/textile-frames",
                    description: "Premium textile frames with custom designs",
                },
                {
                    id: 6,
                    title: "SPLIT FABRIC COLLAGES",
                    image: "/assets/canvas/fabric-split.png",
                    link: "/products/fabric-collages",
                    description:
                        "Creative fabric collages for unique wall decor",
                },
            ],
        },
        {
            id: "photo-frames",
            name: "Photo Frames",
            products: [
                {
                    id: 7,
                    title: "PREMIUM PHOTO FRAMES",
                    image: "/assets/canvas/photo-frame.png",
                    link: "/products/premium-photo-frames",
                    description:
                        "Elegant photo frames for your precious memories",
                },
                {
                    id: 8,
                    title: "PHOTO WALL ART",
                    image: "/assets/canvas/photo-layout.png",
                    link: "/products/framed-prints",
                    description:
                        "Professionally framed prints for any occasion",
                },
                {
                    id: 9,
                    title: "SPLIT PHOTO FRAMES",
                    image: "/assets/canvas/photo-splits.png",
                    link: "/products/custom-photo-layouts",
                    description:
                        "Customizable photo layouts for creative displays",
                },
            ],
        },
        {
            id: "bestseller",
            name: "Bestseller",
            products: [
                {
                    id: 10,
                    title: "POPULAR CANVAS PRINTS",
                    image: "/assets/canvas/fabric-split.png",
                    link: "/products/popular-canvas-prints",
                    description: "Our most popular canvas print designs",
                },
                {
                    id: 11,
                    title: "BESTSELLING FRAMES",
                    image: "/assets/canvas/photo-splits.png",
                    link: "/products/bestselling-frames",
                    description:
                        "Top-selling frame designs that customers love",
                },
                {
                    id: 12,
                    title: "TRENDING COLLECTIONS",
                    image: "/assets/canvas/split.png",
                    link: "/products/trending-collections",
                    description: "Currently trending collections and designs",
                },
            ],
        },
    ];

    return (
        <div className="w-full bg-[#f9fef7] py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 text-[#333333]">
                    Our range of world class products
                </h2>

                {/* Full Width Custom Tabs */}
                <div className="w-full mb-10">
                    <div className="grid grid-cols-4 bg-[#b4f1a0] rounded-t-lg overflow-hidden">
                        {productCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveTab(category.id)}
                                className={cn(
                                    "py-4 px-2 text-center transition-all duration-300",
                                    "text-base sm:text-lg font-medium",
                                    activeTab === category.id
                                        ? "bg-[#68b64d] text-white"
                                        : "bg-[#e4ffdc] text-gray-700 hover:bg-[#bfffab]"
                                )}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="w-full">
                    {productCategories.map((category) => (
                        <div
                            key={category.id}
                            className={`${
                                activeTab === category.id ? "block" : "hidden"
                            }`}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {category.products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group relative overflow-hidden bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
                                    >
                                        <Link
                                            href={product.link}
                                            className="block"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={product.image}
                                                    alt={product.title}
                                                    className="w-full h-80 object-center"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 bg-[#67b653] py-4 px-6">
                                                    <h3 className="text-white text-2xl font-bold text-center">
                                                        {product.title}
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white opacity-0 group-hover:opacity-100 absolute inset-0 flex flex-col justify-center items-center transition-opacity duration-300">
                                                <div className="bg-[#5fba45] text-white px-6 py-3 rounded-full font-medium">
                                                    View Details
                                                </div>
                                                <p className="mt-4 text-center text-gray-700">
                                                    {product.description}
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductShowcase;
