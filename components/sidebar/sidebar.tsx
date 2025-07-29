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
  BookA,
  Layout,
  LayoutGrid,
  UserRoundPlus,
  UserPlus,
  UserPlus2,
  User2,
  UserRoundPlusIcon,
  Table,
  SignalIcon,
  LogIn,
  PencilIcon,
  BookType,
  PlusSquare,
  CalendarCheck,
  CalendarClock,
  Award,
  BookAIcon,
  Option,
  StarIcon,
  ChartBar,
  IndianRupee,
  IndianRupeeIcon,
  BadgeIndianRupee,
  Pen,
  BookCopy,
  BookDashed,
  PenLine,
  PenSquare,
  Check,
  User2Icon,
  ChartArea,
  Building2,
  Timer,
  CheckCheck,
  TimerIcon,
  CalendarCheck2,
  TicketCheckIcon,
  PlusIcon,
  PlusSquareIcon,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNotificationManager } from "./notification-hook/hook";
import { CardStackIcon } from "@radix-ui/react-icons";

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
  const [collegeLogo, setCollegeLogo] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch college logo if available

  // Fetch all colleges and find the matching college logo
  useEffect(() => {
    if (session?.user?.collegeId) {
      fetch("/api/colleges")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch colleges");
          }
          return response.json();
        })
        .then((data) => {
          const college = data.find(
            (college: any) => college.id === session.user.collegeId
          );
          if (college?.logo) {
            setCollegeLogo(college.logo);
          }
        })
        .catch((error) => {
          console.error("Error fetching college logo:", error);
          setCollegeLogo(null);
        });
    }
  }, [session?.user?.collegeId]);

  // Memoize role-based links to prevent unnecessary re-renders
  const roleBasedLinks = useMemo((): NavLinkType[] => {
    switch (session?.user?.role) {
      case "EDUCATION_DEPARTMENT":
        return [
          {
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
          {
            href: "/college-stats",
            icon: <ChartArea size={18} />,
            label: "College/Student Stats",
          },
          {
            href: "/college-stats/departments-stats",
            icon: <TimerIcon size={18} />,
            label: "Department Stats",
          },
        ];
      case "SBTE_ADMIN":
        return [
          {
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
          {
            href: "/college-stats",
            icon: <ChartArea size={18} />,
            label: "College/Student Stats",
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
          {
            href: "/view-infrastructure",
            icon: <Building2 size={18} />,
            label: "Infrastructures",
          },
          {
            href: "/view-eligibility",
            icon: <CheckCheck size={18} />,
            label: "Eligibility",
          },
          {
            href: "/view-schedules",
            icon: <Timer size={18} />,
            label: "Schedules",
          },
          {
            href: "/user-creation",
            icon: <User2Icon size={18} />,
            label: "SBTE Users",
          },

          {
            href: "/notification/load-balance",
            icon: <FileText size={18} />,
            label: "Reports",
          },
          // { href: "/users", icon: <Users size={18} />, label: "Users" },
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
            href: "/batch",
            icon: <TableOfContentsIcon size={18} />,
            label: "Batches",
            subItems: [
              {
                href: "/batch",
                icon: <Layout size={18} />,
                label: "Batches",
              },
              {
                href: "/batch-year",
                icon: <LayoutGrid size={18} />,
                label: "Batch Year",
              },
              {
                href: "/batch/monthly-batchsubject-classes",
                icon: <CalendarCheck size={18} />,
                label: "Monthly Batch Classes",
              },
              {
                href: "/batch/monthly-batchsubject-attendance",
                icon: <CalendarClock size={18} />,
                label: "Monthly Batch Attendance",
              },
              {
                href: "/batch/monthly-batchsubject-attendance/import",
                icon: <Check size={18} />,
                label: "Import Monthly Batch Attendance",
              },
              {
                href: "/batch/subjects",
                icon: <BookA size={18} />,
                label: "Batch Subject",
              },
              {
                href: "/batch/teacher-assign",
                icon: <UserRoundPlus size={18} />,
                label: "Teacher Assign",
              },
              {
                href: "/batch/student-batch-assign",
                icon: <PlusSquare size={18} />,
                label: "Student Batch Assign",
              },
              {
                href: "/import-students",
                icon: <UserRoundPlusIcon size={18} />,
                label: "Import Students",
              },
              {
                href: "/batchwise-marks-list",
                icon: <PenLine size={18} />,
                label: "Batchwise Exam Marks",
              },
              {
                href: "/batchwise-attendance",
                icon: <PenSquare size={18} />,
                label: "Batchwise Attendance",
              },
            ],
          },
          {
            href: "/create-user/users-list",
            icon: <Users size={18} />,
            label: "Users",
          },

          {
            href: "/certificate",
            icon: <Award size={18} />,
            label: "Certificates",
            subItems: [
              {
                href: "/certificate",
                icon: <BookAIcon size={18} />,
                label: "Certificate",
              },
              {
                href: "/certificate-types",
                icon: <Option size={18} />,
                label: "Certificate Types",
              },
            ],
          },
          {
            href: "/gradecard",
            icon: <CardStackIcon />,
            label: "Student Grades",
            subItems: [
              {
                href: "/gradecard-view",
                icon: <TicketCheckIcon size={18} />,
                label: "View Student Grades",
              },
              {
                href: "/import-internal",
                icon: <PlusIcon size={18} />,
                label: "Import Internal Marks",
              },
              {
                href: "/post-external-marks",
                icon: <PlusSquareIcon size={18} />,
                label: "Calculate External Marks",
              },
              {
                href: "/post-grade-details",
                icon: <PlusCircle size={18} />,
                label: "Calculate Grade Details",
              },
            ],
          },
          {
            href: "/teacher",
            icon: <Table2 size={18} />,
            label: "Teacher",
            subItems: [
              {
                href: "/teacher-designation",
                icon: <UserPlus size={18} />,
                label: "Teacher Designation",
              },
            ],
          },
          {
            href: "/student",
            icon: <User2 size={18} />,
            label: "Student",
            subItems: [
              {
                href: "/student-register",
                icon: <LogIn size={18} />,
                label: "Student Registration",
              },
              {
                href: "/student-list",
                icon: <Table size={18} />,
                label: "Student List",
              },
              {
                href: "/import-students",
                icon: <UserRoundPlusIcon size={18} />,
                label: "Import Students",
              },
            ],
          },
          {
            href: "/student-subjects",
            icon: <BookCheck size={18} />,
            label: "Subjects",
          },

          {
            href: "/exams",
            icon: <PencilIcon size={18} />,
            label: "Exams",
            subItems: [
              {
                href: "/exam-type",
                icon: <BookType size={18} />,
                label: "Exam Type",
              },
              {
                href: "/exam-marks",
                icon: <BookType size={18} />,
                label: "Exam Marks ",
              },

              {
                href: "/exam-marks/import",
                icon: <BookDashed size={18} />,
                label: "Import Exam Marks ",
              },
            ],
          },
          {
            href: "/alumni-list",
            icon: <BookOpen size={18} />,
            label: "Alumni",
          },
          {
            href: "/feedbacks-list",
            icon: <StarIcon size={18} />,
            label: "Feedbacks",
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
            href: "/infrastructures",
            icon: <Building2 size={18} />,
            label: "Infrastructure",
          },
          {
            href: "/schedules-upload",
            icon: <Timer size={18} />,
            label: "Upload Schedules",
          },
          {
            href: "/eligibility-upload",
            icon: <CheckCheck size={18} />,
            label: "Upload Eligibility",
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
          {
            href: "/infrastructures",
            icon: <Building2 size={18} />,
            label: "Infrastructure",
          },
        ];
      case "HOD":
        return [
          {
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
          {
            href: "/batchwisesubmarks",
            icon: <UserRoundPlus size={18} />,
            label: "Batchwise Subject Marks",
          },
          {
            href: "/batchwisesubattendance",
            icon: <CalendarCheck size={18} />,
            label: "Batchwise Subject Attendance",
          },
          {
            href: "/batch/teacher-assign",
            icon: <CalendarCheck2 size={18} />,
            label: "Teacher Assign",
          },
          {
            href: "/load-balance",
            icon: <ChartBar size={18} />,
            label: "Upload Load Balance",
          },
        ];
      case "TEACHER":
        return [
          {
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
          {
            href: "/batch/monthly-batchsubject-classes",
            icon: <CalendarCheck size={18} />,
            label: "Monthly Batch Classes",
          },
          {
            href: "/batch/monthly-batchsubject-attendance",
            icon: <CalendarClock size={18} />,
            label: "Monthly Batch Attendance",
          },
          {
            href: "/batch/monthly-batchsubject-attendance/import",
            icon: <Check size={18} />,
            label: "Import Monthly Batch Attendance",
          },
          {
            href: "/exam-marks",
            icon: <BookType size={18} />,
            label: "Exam Marks ",
          },

          {
            href: "/exam-marks/import",
            icon: <BookDashed size={18} />,
            label: "Import Exam Marks ",
          },
          {
            href: "/batch/subjects",
            icon: <BookA size={18} />,
            label: "Assigned Subject",
          },
          {
            href: "/schedules-upload",
            icon: <Timer size={18} />,
            label: "Upload Schedules",
          },
          {
            href: "/eligibility-upload",
            icon: <CheckCheck size={18} />,
            label: "Upload Eligibility",
          },
        ];
      case "FINANCE_MANAGER":
        return [
          {
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
          {
            href: "/batch-base-exam-fees",
            icon: <IndianRupeeIcon size={18} />,
            label: "Fee Payments",
            subItems: [
              {
                href: "/batch-base-exam-fees",
                icon: <BadgeIndianRupee size={18} />,
                label: "Base Fee",
              },
              {
                href: "/student-batch-exam-fee",
                icon: <Table2 size={18} />,
                label: "Student-Wise Fees",
              },
            ],
          },
          // {
          //   href: "/financial-reports",
          //   icon: <FileText size={18} />,
          //   label: "Financial Reports",
          // },
        ];
      case "STUDENT":
        return [
          {
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
          // {
          //   href: "/attendance",
          //   icon: <Calendar size={18} />,
          //   label: "Attendance",
          // },
          // { href: "/marks", icon: <Clipboard size={18} />, label: "Marks" },
          // { href: "/fees", icon: <DollarSign size={18} />, label: "Fees" },
          {
            href: "/my-certificates",
            icon: <Star size={18} />,
            label: "Certificates",
          },
          {
            href: "/my-feedback",
            icon: <MessageSquare size={18} />,
            label: "Feedback",
          },
          {
            href: "/exam-fee",
            icon: <IndianRupee size={18} />,
            label: "Exam Fees",
          },
          {
            href: "/student-attendance",
            icon: <Pen size={18} />,
            label: "Attendance",
          },
          {
            href: "/student-batch-marks",
            icon: <BookCopy size={18} />,
            label: "Exam Marks",
          },
        ];
      case "ALUMNUS":
        return [
          {
            href: "/dashboard",
            icon: <Home size={18} />,
            label: "Dashboard",
          },
          // {
          //   href: "/profile",
          //   icon: <UserCheck size={18} />,
          //   label: "Alumni Profile",
          // },
          // {
          //   href: "/events",
          //   icon: <Calendar size={18} />,
          //   label: "Alumni Events",
          // },
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

  if (!session || !session?.user?.role) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  const filteredLinks = roleBasedLinks.filter(
    (link) =>
      link.href.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const NavItem = ({ href, icon, label, subItems }: NavLinkType) => {
    const { notifications, notificationCount, loading, downloadNotification } =
      useNotificationManager();
    const hasSubItems = subItems && subItems.length > 0;
    const isExpanded = expandedItems.includes(href);

    const toggleExpand = () => {
      setExpandedItems((prev) =>
        isExpanded ? prev.filter((item) => item !== href) : [...prev, href]
      );
    };
    if (label === "Notifications") {
      return (
        <div
          className={cn(
            "flex items-center py-2 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer",
            isActive(href)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={hasSubItems ? toggleExpand : () => router.push(href)}
        >
          <div className="flex items-center w-full">
            {icon}
            <span className="ml-3 flex-grow">{label}</span>
            {notificationCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notificationCount}
              </Badge>
            )}
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
        </div>
      );
    }
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

  const handleSignOut = () => {
    // Get the current session's user ID and clean up before signing out
    fetch("/api/auth/session-cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session.user.id }),
    })
      .then(() => {
        signOut({ callbackUrl: "/" });
      })
      .catch((error) => {
        console.error("Error during sign out:", error);
        // Still sign out even if cleanup fails
        signOut({ callbackUrl: "/" });
      });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex flex-col">
          {session?.user?.role === "COLLEGE_SUPER_ADMIN" && collegeLogo ? (
            <img
              src={collegeLogo}
              alt="College Logo"
              className="h-24 w-24 object-contain rounded-full mb-2"
            />
          ) : (
            <p className="font-semibold text-lg">{session.user.username}</p>
          )}
          <Badge variant="default" className="mt-1 self-start">
            {session?.user?.role === "COLLEGE_SUPER_ADMIN"
              ? "COLLEGE ADMIN"
              : session?.user?.role === "FINANCE_MANAGER"
              ? "FINANCE MANAGER"
              : session?.user?.role === "SBTE_ADMIN"
              ? "SBTE Administrator"
              : session?.user?.role === "EDUCATION_DEPARTMENT"
              ? "EDUCATION DEPARTMENT"
              : session?.user?.role}
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
          {(session?.user?.role === "COLLEGE_SUPER_ADMIN" ||
            session?.user?.role === "SBTE_ADMIN") && (
            <NavItem
              href={
                session?.user?.role === "COLLEGE_SUPER_ADMIN"
                  ? "/message"
                  : "/notification"
              }
              icon={<Bell size={18} />}
              label="Notifications"
            />
          )}
          <NavItem
            href="/support"
            icon={<HelpCircle size={18} />}
            label="Support"
          />
          <NavItem
            href="/profile"
            icon={<Settings size={18} />}
            label="Settings"
          />
        </div>
      </ScrollArea>
      <div className="p-4 border-t mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleSignOut}
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
