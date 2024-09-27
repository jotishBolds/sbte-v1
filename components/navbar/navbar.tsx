"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavLinkProps {
  href: string;
  label: string;
  mobile?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, mobile = false }) => (
  <Link href={href} passHref legacyBehavior>
    <motion.a
      className={`text-sm font-medium text-gray-700 hover:text-primary transition-colors duration-200 ${
        mobile ? "py-2" : ""
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.a>
  </Link>
);

interface NavItemsProps {
  mobile?: boolean;
}

const NavItems: React.FC<NavItemsProps> = ({ mobile = false }) => {
  const { data: session } = useSession();

  return (
    <>
      <NavLink href="/" label="Home" mobile={mobile} />
      {session && (
        <NavLink href="/dashboard" label="Dashboard" mobile={mobile} />
      )}
    </>
  );
};

const UserDropdown: React.FC = () => {
  const { data: session } = useSession();

  const logOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            className="relative h-8 px-2 py-1 rounded-full"
          >
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback className="bg-primary/10 text-primary">
                {session?.user?.email?.[0].toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">
              {session?.user?.username || "User"}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
          </Button>
        </motion.div>
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
};

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <motion.nav
      className="bg-white border-b border-gray-200 sticky top-0 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" passHref legacyBehavior>
              <motion.a
                className="flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img className="h-8 w-auto" src="/sbte-logo.png" alt="Logo" />
              </motion.a>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <NavItems />
            {session ? (
              <UserDropdown />
            ) : (
              <Link href="/login" passHref legacyBehavior>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="default" size="sm" className="shadow-sm">
                    Log in
                  </Button>
                </motion.a>
              </Link>
            )}
          </div>
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" size="icon" className="text-gray-700">
                    <Menu className="h-5 w-5" />
                  </Button>
                </motion.div>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-6">
                <nav className="flex flex-col space-y-6 mt-6">
                  <NavItems mobile />
                  {session ? (
                    <>
                      <NavLink
                        href="/profile"
                        label="Profile Dashboard"
                        mobile
                      />
                      <Button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        variant="outline"
                        className="justify-start text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <Link href="/login" passHref legacyBehavior>
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="default" className="w-full shadow-sm">
                          Log in
                        </Button>
                      </motion.a>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
