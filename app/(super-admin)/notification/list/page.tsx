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
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { ExtendedNotification } from "@/types/types";

export default function SBTEAdminNotifications() {
  const [notifications, setNotifications] = useState<ExtendedNotification[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notification");
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      console.log("Fetched notifications:", data);

      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.error("Received data is not an array", data);
        setNotifications([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleDownload = async (id: string, title: string) => {
    try {
      const response = await fetch(`/api/notification/${id}`);
      if (!response.ok) {
        throw new Error("Failed to download notification");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download notification",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notification/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      // Remove the deleted notification from the list
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  // Filtered and Paginated Notifications
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
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="container mx-auto px-4 py-8 max-w-[70rem]">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage and download SBTE notifications
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "PPP") : "Filter by Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Title</TableHead>
                <TableHead className="w-[30%]">Created At</TableHead>
                <TableHead className="w-[30%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNotifications.length > 0 ? (
                paginatedNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium truncate">
                      {notification.title}
                    </TableCell>
                    <TableCell>
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleDownload(notification.id, notification.title)
                        }
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Notification</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this notification?
                              This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end space-x-2">
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(notification.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-8"
                  >
                    No notifications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
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
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
