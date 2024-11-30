"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { ExtendedNotification } from "@/types/types";
import SideBarLayout from "@/components/sidebar/layout";
import { cn } from "@/lib/utils";

export default function CollegeAdminNotifications() {
  const [notifications, setNotifications] = useState<ExtendedNotification[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(calculateItemsPerPage());

  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Dynamic items per page based on screen size
  function calculateItemsPerPage() {
    if (typeof window !== "undefined") {
      return window.innerWidth < 640 ? 5 : 10;
    }
    return 10;
  }

  // Responsive resize handler
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(calculateItemsPerPage());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notification", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(
        data.sort(
          (a: ExtendedNotification, b: ExtendedNotification) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setLoading(false);
    } catch (error) {
      toast({
        title: "Notification Retrieval Error",
        description: "Unable to load notifications. Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleDownload = async (id: string, title: string) => {
    try {
      const response = await fetch(`/api/notification/${id}`);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}-notification.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast({
        title: "Download Success",
        description: `Notification "${title}" downloaded successfully.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download notification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(
      (notification) =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (!dateFilter ||
          new Date(notification.createdAt).toLocaleDateString() ===
            dateFilter.toLocaleDateString())
    );
  }, [notifications, searchTerm, dateFilter]);

  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SideBarLayout>
      <Card className="w-full max-w-6xl mx-auto shadow-xl rounded-lg overflow-hidden mt-10">
        <CardHeader className="bg-muted/50 border-b">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <CardTitle className="text-2xl font-bold mb-2">
                  College Notifications
                </CardTitle>
                <CardDescription>
                  Manage and access important college communications
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-auto flex items-center",
                      dateFilter && "text-primary"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : "Filter by Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateFilter}
                    onSelect={(date) => {
                      setDateFilter(date);
                      setCurrentPage(1);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[50%] sm:w-[40%] pl-4">
                    Title
                  </TableHead>
                  <TableHead className="w-[30%] hidden sm:table-cell">
                    Created At
                  </TableHead>
                  <TableHead className="w-[20%] text-right pr-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedNotifications.map((notification) => (
                  <TableRow key={notification.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium pl-4 flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[200px] block">
                        {notification.title}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDownload(notification.id, notification.title)
                        }
                        aria-label="Download Notification"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {paginatedNotifications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No notifications found. Check back later.
            </div>
          )}
        </CardContent>
      </Card>
    </SideBarLayout>
  );
}
