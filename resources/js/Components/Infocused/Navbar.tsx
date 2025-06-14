// components/Navbar.tsx
import React, { useState } from "react";
import {
    Menu,
    Search,
    User,
    Heart,
    ShoppingCart,
    ChevronDown,
    X,
    LogOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/Components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Link, usePage } from "@inertiajs/react";
import { NavItem } from "@/types/types";

import { useCart } from "@/context/CartContext";
import { CartSheet } from "../CartSheet";

export const Navbar: React.FC = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { cartCount } = useCart();
    const [cartOpen, setCartOpen] = useState(false);
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const navItems: NavItem[] = [
        { label: "Home", href: "/" },
        {
            label: "Canvas",
            href: "/canva-details",
            children: [
                {
                    label: "Canvas Prints",
                    href: "/canva-print",
                    tag: "bestseller",
                },
                {
                    label: "Canvas Frames Layout",
                    href: "/canva-print-layout(dontshow)",
                },
                {
                    label: "Split Canvas Prints",
                    href: "/canva-print-split-layout",
                },
            ],
        },
        {
            label: "Fabric Frame",
            href: "/fabric-details",
            children: [
                { label: "Fabric Frame", href: "/fabric-frame/standard" },
                { label: "Fabric Frames Layout", href: "/fabric-frame/layout" },
                { label: "Split Fabric Frames", href: "/fabric-frame/split" },
            ],
        },
        {
            label: "Photo Frames",
            href: "/photo-details",
            children: [
                {
                    label: "Photo Tiles",
                    href: "/photo-frames/tiles",
                    tag: "bestseller",
                },
                { label: "Photo Frames", href: "/photo-frames/standard" },
                {
                    label: "Photo Wall Display",
                    href: "/photo-frames/wall-display",
                },
                { label: "Split Photo Frames", href: "/photo-frames/split" },
            ],
        },
        {
            label: "Blogs",
            href: "/recent-blogs",
            // children: [
            //     { label: "Design Tips", href: "/blogs/design-tips" },
            //     { label: "Perfect Layout", href: "/blogs/layout" },
            // ],
        },
    ];

    return (
        <nav className="bg-white py-3 px-4 shadow-sm sticky top-0 z-50">
            <div className="container mx-auto max-w-7xl">
                <div className="flex items-center justify-between">
                    {/* Left side - Mobile menu */}
                    <div className="flex items-center">
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="md:hidden text-gray-700">
                                    <Menu size={24} />
                                </button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="w-[300px] sm:w-[350px]"
                            >
                                <div className="py-4">
                                    <div className="font-bold text-xl mb-6">
                                        Menu
                                    </div>
                                    <ul className="space-y-4">
                                        {navItems.map((item) => (
                                            <li
                                                key={item.label}
                                                className="py-2"
                                            >
                                                <Link
                                                    href={item.href}
                                                    className="text-gray-800 hover:text-black transition-colors"
                                                >
                                                    {item.label}
                                                </Link>
                                                {item.children && (
                                                    <ul className="pl-4 mt-2 space-y-2">
                                                        {item.children.map(
                                                            (child) => (
                                                                <li
                                                                    key={
                                                                        child.label
                                                                    }
                                                                    className="flex items-center"
                                                                >
                                                                    <Link
                                                                        href={
                                                                            child.href
                                                                        }
                                                                        className="text-gray-600 hover:text-black transition-colors"
                                                                    >
                                                                        {
                                                                            child.label
                                                                        }
                                                                    </Link>
                                                                    {child.tag ===
                                                                        "bestseller" && (
                                                                        <span className="ml-2 text-xs bg-black text-white px-1.5 py-0.5 rounded">
                                                                            Bestseller
                                                                        </span>
                                                                    )}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                        {user ? (
                                            <>
                                                <li className="py-2 border-t pt-4 mt-4">
                                                    <div className="text-gray-800 font-medium mb-2">
                                                        Logged in as:{" "}
                                                        {user.name}
                                                    </div>
                                                    <Link
                                                        href="/dashboard"
                                                        className="text-gray-800 font-medium hover:text-black transition-colors block mb-2"
                                                    >
                                                        Dashboard
                                                    </Link>
                                                    <Link
                                                        href="/logout"
                                                        method="post"
                                                        as="button"
                                                        className="text-red-600 font-medium hover:text-red-800 transition-colors flex items-center gap-2"
                                                    >
                                                        <LogOut size={16} />
                                                        Logout
                                                    </Link>
                                                </li>
                                            </>
                                        ) : (
                                            <li className="py-2 border-t pt-4 mt-4">
                                                <Link
                                                    href="/login"
                                                    className="text-gray-800 font-medium hover:text-black transition-colors"
                                                >
                                                    Login / Register
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Center Logo */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none">
                        <Link href="/" className="flex-shrink-0">
                            <img
                                src="/assets/logo-white.jpg"
                                alt="EnfocusedFrames"
                                className="h-10 md:h-12 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-center flex-1 space-x-6">
                        {navItems.map((item) => (
                            <div key={item.label} className="relative group">
                                {item.children ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center text-gray-800 hover:text-black transition-colors text-sm font-medium">
                                                {item.label}{" "}
                                                <ChevronDown
                                                    size={16}
                                                    className="ml-1"
                                                />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="center"
                                            className="w-48 bg-white shadow-lg rounded-md p-2"
                                        >
                                            {item.children.map((child) => (
                                                <DropdownMenuItem
                                                    key={child.label}
                                                    asChild
                                                >
                                                    <div className="w-full">
                                                        <Link
                                                            href={child.href}
                                                            className="block px-4 py-2 text-gray-700 hover:bg-[#c7e7bd] rounded-md transition-colors w-full"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span>
                                                                    {
                                                                        child.label
                                                                    }
                                                                </span>
                                                                {child.tag ===
                                                                    "bestseller" && (
                                                                    <span className="ml-2 text-xs bg-black text-white px-1.5 py-0.5 rounded">
                                                                        Bestseller
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className="text-gray-800 hover:text-black transition-colors text-sm font-medium"
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </div>
                        ))}
                        {!user && (
                            <Link
                                href="/login"
                                className="text-gray-800 font-medium hover:text-black transition-colors text-sm"
                            >
                                Login / Register
                            </Link>
                        )}
                    </div>

                    {/* Right side - Icons */}
                    <div className="flex items-center space-x-3 md:space-x-4">
                        {isSearchOpen ? (
                            <div className="fixed md:absolute inset-x-0 top-0 bg-white p-4 flex items-center z-50 md:w-64 md:right-0 md:left-auto">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="flex-1 border-b-2 border-gray-300 focus:border-black outline-none py-2 px-4 text-sm"
                                    autoFocus
                                />
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="ml-2 text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="text-gray-700 hover:text-black transition-colors"
                                    aria-label="Search"
                                >
                                    <Search size={20} />
                                </button>
                                {user ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center text-gray-700 hover:text-black transition-colors">
                                                <User size={20} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-48 bg-white shadow-lg rounded-md p-2"
                                        >
                                            <div className="px-4 py-2 border-b border-gray-200 mb-2">
                                                <p className="text-sm font-medium text-gray-900">
                                                    Logged in as:
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {user.name}
                                                </p>
                                            </div>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href="/dashboard"
                                                    className="block px-4 py-2 text-gray-700 hover:bg-[#c7e7bd] rounded-md transition-colors w-full"
                                                >
                                                    Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href="/logout"
                                                    method="post"
                                                    as="button"
                                                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors w-full"
                                                >
                                                    <LogOut size={16} />
                                                    Logout
                                                </Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="text-gray-700 hover:text-black transition-colors"
                                        aria-label="Login"
                                    >
                                        <User size={20} />
                                    </Link>
                                )}
                                <Link
                                    href="/wishlist"
                                    className="text-gray-700 hover:text-black transition-colors relative"
                                    aria-label="Wishlist"
                                >
                                    <Heart size={20} />
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        0
                                    </span>
                                </Link>
                                <button
                                    onClick={() => setCartOpen(true)}
                                    className="text-gray-700 hover:text-black transition-colors relative"
                                    aria-label="Cart"
                                >
                                    <ShoppingCart size={20} />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
        </nav>
    );
};
