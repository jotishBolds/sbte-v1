import React from "react";
import { Navbar } from "../Infocused/Navbar";
import Footer from "../Infocused/Footer";
import { Header } from "../Infocused/Headers";

interface InfocusLayoutProps {
    children: React.ReactNode;
}

const InfocusLayout: React.FC<InfocusLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen">
            <Header />
            <Navbar />
            {children}
            <Footer />
        </div>
    );
};

export default InfocusLayout;
