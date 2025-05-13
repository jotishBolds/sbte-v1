import React from "react";
import { Navbar } from "../Infocused/Navbar";
import Footer from "../Infocused/Footer";
import { Header } from "../Infocused/Headers";
import { CartProvider } from "@/context/CartContext";

interface InfocusLayoutProps {
    children: React.ReactNode;
}

const InfocusLayout: React.FC<InfocusLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen">
            <CartProvider>
                <Header />
                <Navbar />
                {children}
                <Footer />
            </CartProvider>
        </div>
    );
};

export default InfocusLayout;
