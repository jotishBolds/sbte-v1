// Footer.tsx
import React from "react";

import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import {
    ChevronRight,
    ArrowUp,
    Facebook,
    Twitter,
    Instagram,
} from "lucide-react";
import { Link } from "@inertiajs/react";

const Footer: React.FC = () => {
    return (
        <footer className="bg-white pt-12 pb-6 border-t border-gray-200">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Company Info Column */}
                    <div className="space-y-4">
                        <Link href="/">
                            <img
                                src="/assets/logo-white.jpg"
                                alt="Infocused Frames Logo"
                                className="h-14 w-auto"
                            />
                        </Link>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p>Address: 1234 Framing Street, Suite 567,</p>
                            <p>New York, NY</p>
                            <p>
                                Email:{" "}
                                <a
                                    href="mailto:info@infocusedframes.com"
                                    className="hover:underline"
                                >
                                    info@infocusedframes.com
                                </a>
                            </p>
                            <p>
                                Phone:{" "}
                                <a
                                    href="tel:2125551234"
                                    className="hover:underline"
                                >
                                    (212)555-1234
                                </a>
                            </p>
                        </div>
                        <Link
                            href="#"
                            className="flex items-center text-sm font-medium hover:underline"
                        >
                            Get direction{" "}
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>

                        {/* Social Media Icons */}
                        <div className="flex space-x-2 mt-4">
                            <a
                                href="https://facebook.com/infocusedframes"
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a
                                href="https://twitter.com/infocusedframes"
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a
                                href="https://instagram.com/infocusedframes"
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                                <Instagram className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Photo Frames Column */}
                    <div>
                        <h2 className="font-semibold text-lg mb-4">
                            Photo frames
                        </h2>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li>
                                <Link
                                    href="/photo-frames"
                                    className="hover:underline"
                                >
                                    Photo Frames
                                </Link>
                            </li>
                        </ul>

                        <h3 className="font-semibold text-lg mt-6 mb-4">
                            Fabric Frames
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li>
                                <Link
                                    href="/fabric-frames/classic"
                                    className="hover:underline"
                                >
                                    Classic Fabric Frame
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/fabric-frames/split"
                                    className="hover:underline"
                                >
                                    Split Fabric Frames
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/fabric-frames/wall-display"
                                    className="hover:underline"
                                >
                                    Wall Display
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Canvas Column */}
                    <div>
                        <h2 className="font-semibold text-lg mb-4">Canvas</h2>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li>
                                <Link
                                    href="/canvas/prints"
                                    className="hover:underline"
                                >
                                    Canvas Prints - Bestseller
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/canvas/wall-display"
                                    className="hover:underline"
                                >
                                    Canvas Wall Display
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/canvas/split-prints"
                                    className="hover:underline"
                                >
                                    Split Canvas Prints
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">
                            Sign Up for Email
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Sign up to get first dibs on new frame designs,
                            sales, exclusive content, events and more!
                        </p>
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                placeholder="Your email address"
                                className="text-sm rounded-md"
                            />
                            <Button
                                variant="default"
                                className="bg-black hover:bg-gray-800 text-white rounded-md flex items-center"
                            >
                                Subscribe{" "}
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse md:flex-row justify-between items-center pt-6 border-t border-gray-200">
                    {/* Copyright */}
                    <div className="text-sm text-gray-600 mt-4 md:mt-0">
                        © 2025 Infocused Frames. All Rights Reserved
                    </div>

                    {/* Payment Methods */}
                    <div className="flex items-center space-x-2">
                        <img
                            src="/assets/cards/visa.png"
                            alt="Visa"
                            className="h-8"
                        />
                        <img
                            src="/assets/cards/money.png"
                            alt="Mastercard"
                            className="h-10"
                        />
                        <img
                            src="/assets/cards/google-pay.png"
                            alt="gpay"
                            className="h-10"
                        />
                    </div>

                    {/* Scroll to top button */}
                    <button
                        className="fixed right-4 bottom-4 md:static p-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 md:ml-4"
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                    >
                        <ArrowUp className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
