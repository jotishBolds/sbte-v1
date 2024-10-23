"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
  TableCellsMerge,
  TableCellsSplit,
  TableOfContents,
  TableOfContentsIcon,
  BookCheck,
  Search,
  ChevronDown,
  FileX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type NavLinkType = {
  href: string;
  icon: React.ReactNode;
  label: string;
  subItems?: NavLinkType[];
};

export const Sidebar: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Memoize role-based links to prevent unnecessary re-renders
  const roleBasedLinks = useMemo((): NavLinkType[] => {
    switch (session?.user.role) {
      case "EDUCATION_DEPARTMENT":
      case "SBTE_ADMIN":
        return [
          {
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
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
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
          {
            href: "/csa-dashboard",
            icon: <Building size={18} />,
            label: "College Details",
          },
          {
            href: `/departments/${session?.user.collegeId}`,
            icon: <BookOpen size={18} />,
            label: "Departments",
          },
          {
            href: "/create-user/users-list",
            icon: <Users size={18} />,
            label: "Users",
          },
          {
            href: "/student-subjects",
            icon: <BookCheck size={18} />,
            label: "Subjects",
          },
          {
            href: "/alumni-list",
            icon: <BookOpen size={18} />,
            label: "Alumni",
          },
          {
            href: "/semester",
            icon: <GraduationCap size={18} />,
            label: "Semester",
          },
          {
            href: "/programs",
            icon: <Table2 size={18} />,
            label: "Programs",
            subItems: [
              {
                href: "/programs/create",
                icon: <Table2 size={18} />,
                label: "Create Program",
              },
            ],
          },
          {
            href: "/academic-year",
            icon: <TableCellsMerge size={18} />,
            label: "Academic Year",
          },
          {
            href: "/admission-year",
            icon: <TableCellsSplit size={18} />,
            label: "Admission Year",
          },
          {
            href: "/batch",
            icon: <TableOfContentsIcon size={18} />,
            label: "Batches",
            subItems: [
              {
                href: "/batch",
                icon: <TableOfContents size={18} />,
                label: "Batches",
              },
              {
                href: "/batch-year",
                icon: <TableOfContents size={18} />,
                label: "Batch Year",
              },
            ],
          },
        ];
      case "ADM":
        return [
          {
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
          {
            href: "/create-user/users-list",
            icon: <Users size={18} />,
            label: "Manage Users",
          },
          { href: "/reports", icon: <FileText size={18} />, label: "Reports" },
        ];
      case "HOD":
        return [
          {
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
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
          {
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
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
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
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
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
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
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
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
  }, [session?.user?.role]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Ensure input refocus on re-render if needed
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchTerm]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session || !session.user.role) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  const filteredLinks = roleBasedLinks.filter(
    (link) =>
      link.href.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const NavItem = ({ href, icon, label, subItems }: NavLinkType) => {
    const hasSubItems = subItems && subItems.length > 0;
    const isExpanded = expandedItems.includes(href);

    const toggleExpand = () => {
      setExpandedItems((prev) =>
        isExpanded ? prev.filter((item) => item !== href) : [...prev, href]
      );
    };

    return (
      <>
        <div
          className={cn(
            "flex items-center py-2 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer",
            isActive(href)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={hasSubItems ? toggleExpand : () => router.push(href)}
        >
          {icon}
          <span className="ml-3 flex-grow">{label}</span>
          {hasSubItems && (
            <ChevronDown
              size={18}
              className={cn(
                "transition-transform",
                isExpanded && "transform rotate-180"
              )}
            />
          )}
        </div>
        {hasSubItems && isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {subItems.map((subItem, index) => (
              <NavItem key={index} {...subItem} />
            ))}
          </div>
        )}
      </>
    );
  };

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
      <div className="p-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10"
            ref={searchInputRef}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-2">
          {filteredLinks.map((link, index) => (
            <NavItem key={index} {...link} />
          ))}
        </div>
        {filteredLinks.length === 0 && (
          <div className="text-center p-4">
            <FileX className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No results found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              We couldn&quot;t find any menu items matching your search. Try
              adjusting your search terms.
            </p>
          </div>
        )}
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
