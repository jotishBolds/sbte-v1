"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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
import { ModeToggle } from "../theme-toggle";
import LogoText from "./logo";

// Navigation Data Structure
const navigationItems = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    items: [
      { label: "About SBTE", href: "/about-us" },
      { label: "Organization Chart", href: "/organization-chart" },
      { label: "Who is Who", href: "/who-is-who" },
    ],
  },
  {
    label: "Affiliated College",
    href: "/affiliated-collages",
  },
  {
    label: "Notification",
    items: [
      { label: "Circular and Notification", href: "/notification-circulation" },
    ],
  },
  {
    label: "Convocation",
    href: "/convocations",
  },
  {
    label: "Gallery",
    href: "/gallery",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

const NavLink: React.FC<{ item: any; mobile?: boolean }> = ({
  item,
  mobile = false,
}) => {
  if (item.items) {
    return mobile ? (
      <DropdownMenu>
        <DropdownMenuTrigger className="text-sm font-medium w-full text-left">
          {" "}
          {/* Added w-full and text-left */}
          {item.label}
          <ChevronDown className="ml-1 h-4 w-4 inline float-right" />{" "}
          {/* Added float-right */}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[200px]">
          {" "}
          {/* Added min-width */}
          {item.items.map((subItem: any) => (
            <DropdownMenuItem key={subItem.href} asChild>
              <Link href={subItem.href} className="w-full">
                {subItem.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            className="inline-flex items-center text-sm font-medium transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.label}
            <ChevronDown className="ml-1 h-4 w-4" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" alignOffset={-4}>
          {item.items.map((subItem: any) => (
            <DropdownMenuItem key={subItem.href} asChild>
              <Link href={subItem.href} className="w-full">
                {subItem.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link href={item.href} passHref legacyBehavior>
      <motion.a
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          "dark:text-gray-300 dark:hover:text-primary",
          mobile && "py-2 w-full text-left" // Added w-full and text-left
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {item.label}
      </motion.a>
    </Link>
  );
};

const NavItems: React.FC<{ mobile?: boolean }> = ({ mobile = false }) => {
  const { data: session } = useSession();

  return (
    <div
      className={cn(
        "flex gap-6",
        mobile ? "flex-col w-full items-start" : "flex-row items-center" // Added w-full and items-start
      )}
    >
      {navigationItems.map((item) => (
        <NavLink key={item.label} item={item} mobile={mobile} />
      ))}
      {session && (
        <NavLink
          item={{ label: "Dashboard", href: "/dashboard" }}
          mobile={mobile}
        />
      )}
    </div>
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
              <AvatarFallback className="bg-primary/10">
                {session?.user?.email?.[0]?.toUpperCase() ||
                  session?.user?.username?.[0]?.toUpperCase() ||
                  "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {session?.user?.username || session?.user?.email || "Guest"}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logOut}
          className="cursor-pointer text-destructive focus:text-destructive"
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
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container flex h-16 items-center">
        <div className="flex items-center">
          <Link href="/" passHref legacyBehavior>
            <motion.a
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogoText />
            </motion.a>
          </Link>
        </div>

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <nav className="flex items-center space-x-6 px-6">
            <NavItems />
          </nav>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            {session ? (
              <UserDropdown />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/register-alumni" passHref legacyBehavior>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" className="shadow-sm">
                      Alumni Register
                    </Button>
                  </motion.a>
                </Link>
                <Link href="/login" passHref legacyBehavior>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="default" className="shadow-sm">
                      Log in
                    </Button>
                  </motion.a>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end md:hidden">
          <ModeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-2"
              >
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </motion.div>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-6 mt-6">
                <NavItems mobile />
                {session ? (
                  <>
                    <NavLink
                      item={{ label: "Profile Dashboard", href: "/profile" }}
                      mobile
                    />
                    <Button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      variant="outline"
                      className="justify-start text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/register-alumni" passHref legacyBehavior>
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" className="w-full shadow-sm">
                          Alumni Register
                        </Button>
                      </motion.a>
                    </Link>
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
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
