"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Home,
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Clipboard,
  GraduationCap,
  Bell,
  Building,
  UserCheck,
  Book,
  Star,
  MessageSquare,
  Menu,
  X,
  GraduationCapIcon,
  Table2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type NavLinkType = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

export const Sidebar: React.FC = () => {
  const { data: session, status } = useSession();
  console.log(session);
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session || !session.user.role) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  const roleBasedLinks = (): NavLinkType[] => {
    switch (session.user.role) {
      case "EDUCATION_DEPARTMENT":
      case "SBTE_ADMIN":
        return [
          {
            href: "/colleges",
            icon: <Building size={18} />,
            label: "Colleges",
          },
          {
            href: "/departments",
            icon: <GraduationCapIcon size={18} />,
            label: "Departments",
          },

          { href: "/reports", icon: <FileText size={18} />, label: "Reports" },
          { href: "/users", icon: <Users size={18} />, label: "Users" },
        ];
      case "COLLEGE_SUPER_ADMIN":
        return [
          {
            href: "/csa-dashboard",
            icon: <Building size={18} />,
            label: "College Details",
          },
          {
            href: `/departments/${session.user.collegeId}`,
            icon: <BookOpen size={18} />,
            label: "Departments",
          },
          {
            href: "/create-user/users-list",
            icon: <Users size={18} />,
            label: "Users",
          },
          {
            href: "/alumni-list",
            icon: <BookOpen size={18} />,
            label: "Alumni",
          },
          {
            href: "/programs/create",
            icon: <Table2 size={18} />,
            label: "Programs",
          },
          // {
          //   href: "/finance",
          //   icon: <DollarSign size={18} />,
          //   label: "Finance",
          // },
        ];
      case "ADM":
        return [
          {
            href: "/create-user/users-list",
            icon: <Users size={18} />,
            label: "Manage Users",
          },
          { href: "/reports", icon: <FileText size={18} />, label: "Reports" },
        ];
      case "HOD":
        return [
          { href: "/teachers", icon: <Users size={18} />, label: "Teachers" },
          {
            href: "/students",
            icon: <GraduationCap size={18} />,
            label: "Students",
          },
          { href: "/subjects", icon: <Book size={18} />, label: "Subjects" },
          {
            href: "/department",
            icon: <BookOpen size={18} />,
            label: "Department",
          },
        ];
      case "TEACHER":
        return [
          { href: "/subjects", icon: <Book size={18} />, label: "Subjects" },
          {
            href: "/attendance",
            icon: <Calendar size={18} />,
            label: "Attendance",
          },
          { href: "/marks", icon: <Clipboard size={18} />, label: "Marks" },
        ];
      case "FINANCE_MANAGER":
        return [
          {
            href: "/fee",
            icon: <DollarSign size={18} />,
            label: "Fee Payments",
          },
          {
            href: "/financial-reports",
            icon: <FileText size={18} />,
            label: "Financial Reports",
          },
        ];
      case "STUDENT":
        return [
          {
            href: "/attendance",
            icon: <Calendar size={18} />,
            label: "Attendance",
          },
          { href: "/marks", icon: <Clipboard size={18} />, label: "Marks" },
          { href: "/fees", icon: <DollarSign size={18} />, label: "Fees" },
          {
            href: "/certificates",
            icon: <Star size={18} />,
            label: "Certificates",
          },
          {
            href: "/feedback",
            icon: <MessageSquare size={18} />,
            label: "Feedback",
          },
        ];
      case "ALUMNUS":
        return [
          {
            href: "/profile",
            icon: <UserCheck size={18} />,
            label: "Alumni Profile",
          },
          {
            href: "/events",
            icon: <Calendar size={18} />,
            label: "Alumni Events",
          },
        ];
      default:
        return [];
    }
  };

  const NavItem = ({ href, icon, label }: NavLinkType) => (
    <Link
      href={href}
      className={cn(
        "flex items-center py-2 px-4 text-sm font-medium rounded-md transition-colors",
        isActive(href)
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex flex-col">
          <p className="font-semibold text-lg">{session.user.username}</p>
          <Badge variant="default" className="mt-1 self-start">
            {session.user.role}
          </Badge>
        </div>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-2">
          <NavItem
            href="/dashboard"
            icon={<Home size={18} />}
            label="Dashboard"
          />
          {roleBasedLinks().map((link, index) => (
            <NavItem
              key={index}
              href={link.href}
              icon={link.icon}
              label={link.label}
            />
          ))}
        </div>
        <Separator className="my-4" />
        <div className="p-4 space-y-2">
          <NavItem
            href="/notifications"
            icon={<Bell size={18} />}
            label="Notifications"
          />
          <NavItem
            href="/support"
            icon={<HelpCircle size={18} />}
            label="Support"
          />
          <NavItem
            href="/settings"
            icon={<Settings size={18} />}
            label="Settings"
          />
        </div>
      </ScrollArea>
      <div className="p-4 border-t mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      ) : (
        <div
          className="hidden md:block w-[300px] lg:w-[400px] border-r fixed left-0 top-0 bottom-0 overflow-y-auto"
          style={{ top: "64px" }}
        >
          <SidebarContent />
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className={`fixed ${
          isMobile ? "bottom-4" : "top-4"
        } left-4 z-50 md:hidden`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>
    </>
  );
};
