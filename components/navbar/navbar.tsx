"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const logOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const NavItems = () => (
    <>
      <Link
        href="/"
        className="text-sm font-medium text-gray-700 hover:text-primary transition-colors duration-200"
      >
        Home
      </Link>
      {session && (
        <Link
          href="/dashboard"
          className="text-sm font-medium text-gray-700 hover:text-primary transition-colors duration-200"
        >
          Dashboard
        </Link>
      )}
    </>
  );

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary">
              {session?.user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logOut}
          className="cursor-pointer flex items-center text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <img className="h-8 w-auto" src="/sbte-logo.png" alt="Logo" />
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <NavItems />
            {session ? (
              <UserDropdown />
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" className="shadow-sm">
                  Log in
                </Button>
              </Link>
            )}
          </div>
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-6">
                <nav className="flex flex-col space-y-6 mt-6">
                  <NavItems />
                  {session ? (
                    <>
                      <Link
                        href="/profile"
                        className="text-sm font-medium text-gray-700 hover:text-primary transition-colors duration-200 flex items-center"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile Dashboard
                      </Link>
                      <Button
                        onClick={logOut}
                        variant="outline"
                        className="justify-start text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <Link href="/login">
                      <Button variant="default" className="w-full shadow-sm">
                        Log in
                      </Button>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
