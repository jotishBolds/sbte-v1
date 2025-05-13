import { PropsWithChildren, ReactNode, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/Components/ui/navigation-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/Components/ui/sheet";
import { Button } from "@/Components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Menu, X, User, LogOut } from "lucide-react";

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user as any; // Type assertion to handle missing properties
    const [open, setOpen] = useState(false);

    const NavItems = () => (
        <>
            <NavigationMenuItem>
                <Link href={route("dashboard")}>
                    <NavigationMenuLink
                        className={
                            navigationMenuTriggerStyle() +
                            ` ${
                                route().current("dashboard")
                                    ? "bg-green-50 text-green-700"
                                    : "text-gray-700"
                            }`
                        }
                    >
                        Dashboard
                    </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>
            {/* Add more navigation items here as needed */}
        </>
    );

    const UserMenu = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 hover:bg-green-50"
                >
                    <Avatar className="h-8 w-8 border-2 border-green-100">
                        {user.profile_photo_url && (
                            <AvatarImage
                                src={user.profile_photo_url}
                                alt={user.name}
                            />
                        )}
                        <AvatarFallback className="bg-green-100 text-green-800">
                            {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-700">
                        {user.name}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                    <Link
                        href={route("profile.edit")}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-2 cursor-pointer text-red-600"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="min-h-screen bg-[#fbfffa]">
            <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <ApplicationLogo className="h-10 w-auto fill-current text-[#6db64e]" />
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:items-center md:space-x-4">
                            <NavigationMenu>
                                <NavigationMenuList>
                                    <NavItems />
                                </NavigationMenuList>
                            </NavigationMenu>

                            <div className="ml-4">
                                <UserMenu />
                            </div>
                        </div>

                        {/* Mobile Navigation */}
                        <div className="flex md:hidden">
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-gray-700"
                                    >
                                        <Menu className="h-6 w-6" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-72">
                                    <div className="flex flex-col h-full">
                                        <div className="flex items-center justify-between border-b pb-4">
                                            <div className="flex items-center space-x-2">
                                                <Avatar className="h-9 w-9 border-2 border-green-100">
                                                    {user.profile_photo_url && (
                                                        <AvatarImage
                                                            src={
                                                                user.profile_photo_url
                                                            }
                                                            alt={user.name}
                                                        />
                                                    )}
                                                    <AvatarFallback className="bg-green-100 text-green-800">
                                                        {user.name
                                                            .substring(0, 2)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800">
                                                        {user.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <nav className="mt-6 flex flex-col space-y-3">
                                            <Link
                                                href={route("dashboard")}
                                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                                    route().current("dashboard")
                                                        ? "bg-green-50 text-green-700"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                }`}
                                                onClick={() => setOpen(false)}
                                            >
                                                Dashboard
                                            </Link>
                                            <Link
                                                href={route("profile.edit")}
                                                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                onClick={() => setOpen(false)}
                                            >
                                                <User className="h-4 w-4" />
                                                Profile
                                            </Link>
                                        </nav>

                                        <div className="mt-auto border-t pt-4">
                                            <Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                                className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                                                onClick={() => setOpen(false)}
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Log Out
                                            </Link>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>

            {header && (
                <div className="bg-white shadow-sm border-b">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </div>
            )}

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
