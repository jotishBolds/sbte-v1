import React, { useState } from "react";
import { Link } from "@inertiajs/react";

interface LatestProduct {
    id: number;
    title: string;
    image: string;
    price: number;
    discountPrice?: number;
    category: string;
    link: string;
}

const LatestProductsSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("all");

    const latestProducts: LatestProduct[] = [
        {
            id: 1,
            title: "Premium Canvas Print - Landscape",
            image: "/assets/canvas/split.png",
            price: 1859.99,
            discountPrice: 1149.99,
            category: "canvas",
            link: "/products/premium-canvas-landscape",
        },
        {
            id: 2,
            title: "Fabric Frame - Family Portrait",
            image: "/assets/canvas/fabric-split.png",
            price: 1179.99,
            category: "fabric",
            link: "/products/fabric-family-portrait",
        },
        {
            id: 3,
            title: "Split Photo Frame Collection",
            image: "/assets/canvas/photo-splits.png",
            price: 1599.99,
            discountPrice: 1189.99,
            category: "photo",
            link: "/products/split-photo-collection",
        },
    ];

    const categories = [
        { id: "all", name: "All Products" },
        { id: "canvas", name: "Canvas Prints" },
        { id: "fabric", name: "Fabric Frames" },
        { id: "photo", name: "Photo Frames" },
    ];

    const filteredProducts =
        activeTab === "all"
            ? latestProducts
            : latestProducts.filter(
                  (product) => product.category === activeTab
              );

    return (
        <div className="w-full bg-[#f9fef7] py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#333333]">
                    Our Latest Products
                </h2>
                <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
                    Discover our newest additions to create stunning wall
                    displays for your home or office. Quality craftsmanship
                    meets elegant design.
                </p>

                {/* Category Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveTab(category.id)}
                            className={`px-4 py-2 rounded-full transition-all duration-300 ${
                                activeTab === category.id
                                    ? "bg-[#68b64d] text-white"
                                    : "bg-[#e4ffdc] text-gray-700 hover:bg-[#bfffab]"
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl"
                        >
                            <Link
                                href={product.link}
                                className="block relative"
                            >
                                {/* Product Image */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2 text-gray-800 group-hover:text-[#67b653] transition-colors duration-300">
                                        {product.title}
                                    </h3>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-baseline">
                                            {product.discountPrice ? (
                                                <>
                                                    <span className="text-[#67b653] font-bold text-xl mr-2">
                                                        ₹{product.discountPrice}
                                                    </span>
                                                    <span className="text-gray-400 line-through text-sm">
                                                        ₹{product.price}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-[#67b653] font-bold text-xl">
                                                    ₹{product.price}
                                                </span>
                                            )}
                                        </div>

                                        <div className="bg-[#5fba45] text-white px-3 py-1 rounded-full text-sm font-medium group-hover:bg-[#4a9836] transition-colors duration-300">
                                            View Details
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                <div className="mt-12 text-center">
                    <Link
                        href="/products"
                        className="bg-[#67b653] hover:bg-[#549443] text-white px-8 py-3 rounded-full font-medium transition-all duration-300 inline-flex items-center"
                    >
                        <span>View All Products</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 ml-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LatestProductsSection;
