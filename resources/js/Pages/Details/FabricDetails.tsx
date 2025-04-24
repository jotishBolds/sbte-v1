import React from "react";
import { Link } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import InfocusLayout from "@/Components/Layouts/InfocusLayout";

interface FabricProduct {
    id: number;
    title: string;
    image: string;
    description: string;
    link: string;
    isBestseller?: boolean;
}

const FabricFrames: React.FC = () => {
    const fabricProducts: FabricProduct[] = [
        {
            id: 1,
            title: "Premium Fabric Frames",
            image: "/assets/fabric/fabric-frame.png",
            description:
                "Transform your space with our durable Fabric Frames that combine vivid color reproduction with modern, lightweight design",
            link: "/products/fabric-frames",
            isBestseller: true,
        },
        {
            id: 2,
            title: "Interchangeable Fabric Displays",
            image: "/assets/fabric/interchangeable.png",
            description:
                "Update your decor seasonally with our innovative system allowing you to swap fabrics while keeping the same premium frame",
            link: "/products/interchangeable-fabric",
        },
        {
            id: 3,
            title: "Backlit Fabric Showcases",
            image: "/assets/fabric/backlit.png",
            description:
                "Create stunning visual impact with our LED-illuminated fabric displays that bring your images to life with gentle radiance",
            link: "/products/backlit-fabric-frames",
        },
    ];

    const features = [
        "Premium aluminum frames with sleek, contemporary profile designs",
        "Advanced dye-sublimation printing for vibrant, fade-resistant images",
        "Tensioned fabric technology for perfectly smooth, wrinkle-free displays",
        "Lightweight construction with integrated wall-mounting hardware",
        "Washable, anti-static fabric that repels dust for minimal maintenance",
    ];

    return (
        <InfocusLayout>
            <div className="w-full bg-gradient-to-b from-[#f9fef7] to-[#f0f9ed] py-6 md:py-12">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#4a9936] to-[#5fba45] text-white p-4 md:p-6 mb-6 rounded-lg shadow-md">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                            Fabric Frame Collection
                        </h1>
                    </div>

                    {/* Breadcrumb */}
                    <div className="flex items-center mb-6 md:mb-8 text-sm">
                        <Link
                            href="/"
                            className="text-gray-600 hover:text-[#4a9936] transition-colors"
                        >
                            Home
                        </Link>
                        <span className="mx-2 text-gray-400">/</span>
                        <span className="text-[#4a9936] font-medium">
                            Fabric Frames
                        </span>
                    </div>

                    {/* Intro */}
                    <div className="mb-10">
                        <p className="text-gray-700 mb-6 text-base md:text-lg leading-relaxed">
                            Our innovative Fabric Frame Collection combines
                            contemporary design with state-of-the-art printing
                            technology. Using premium aluminum frames and
                            advanced dye-sublimation techniques, we create
                            lightweight yet durable displays that showcase your
                            images with exceptional clarity and color fidelity.
                            Perfect for modern interiors, professional
                            environments, or anywhere you want to make a
                            sophisticated visual statement.
                        </p>

                        <div className="mt-8">
                            <h2 className="text-xl md:text-2xl font-semibold mb-6 text-[#333333] border-l-4 border-[#4a9936] pl-4">
                                The Fabric Frame Advantage
                            </h2>
                            <ul className="space-y-3 md:space-y-4">
                                {features.map((feature, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start"
                                    >
                                        <div className="h-6 w-6 flex items-center justify-center rounded-full bg-[#4a9936] text-white mr-3 flex-shrink-0 shadow-sm">
                                            <Check className="h-4 w-4" />
                                        </div>
                                        <span className="text-gray-700">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
                        {fabricProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="group overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 rounded-xl flex flex-col h-full"
                            >
                                <div className="relative overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-64 md:h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {product.isBestseller && (
                                        <Badge className="absolute top-4 left-4 bg-[#4a9936] text-white px-3 py-1 font-medium text-xs rounded-full shadow-md">
                                            Most Popular
                                        </Badge>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#4a9936] to-[#5fba45] py-3 px-4">
                                        <h3 className="text-white text-lg md:text-xl font-bold text-center">
                                            {product.title}
                                        </h3>
                                    </div>
                                </div>

                                <CardContent className="p-5 bg-white flex-grow">
                                    <p className="text-gray-700 text-center">
                                        {product.description}
                                    </p>
                                </CardContent>

                                <CardFooter className="bg-white p-5 flex justify-center border-t border-gray-50">
                                    <Button
                                        asChild
                                        className="bg-[#4a9936] hover:bg-[#3d7f2d] text-white rounded-full font-medium transition-colors shadow-sm"
                                    >
                                        <Link
                                            href={product.link}
                                            className="flex items-center gap-2"
                                        >
                                            Explore Collection
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </InfocusLayout>
    );
};

export default FabricFrames;
