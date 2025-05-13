import Footer from "@/Components/Infocused/Footer";
import { Header } from "@/Components/Infocused/Headers";
import { HeroCarousel } from "@/Components/Infocused/HeroCarousel";
import LatestProductsSection from "@/Components/Infocused/Latest";
import { Navbar } from "@/Components/Infocused/Navbar";
import ProductShowcase from "@/Components/Infocused/ProductShowcase";
import FabricFramePromoSection from "@/Components/Infocused/Promotion";
import InfocusLayout from "@/Components/Layouts/InfocusLayout";
import React from "react";

const App: React.FC = () => {
    const heroSlides: { id: number; type: "image" | "video"; src: string }[] = [
        {
            id: 1,
            type: "image",
            src: "/assets/herotwo.png",
        },
        {
            id: 2,
            type: "image",
            src: "/assets/heroone.png",
        },
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <InfocusLayout>
                <main className="flex-grow">
                    <HeroCarousel
                        slides={heroSlides}
                        title="Bringing Your Ideas to Print"
                        subtitle="Infocused Frames"
                        cta={{
                            text: "Discover Our Collection",
                            href: "/collections/frames",
                        }}
                    />
                    <ProductShowcase />
                    <LatestProductsSection />
                    <FabricFramePromoSection />
                </main>
            </InfocusLayout>
        </div>
    );
};

export default App;
