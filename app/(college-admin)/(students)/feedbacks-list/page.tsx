"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Filter,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SideBarLayout from "@/components/sidebar/layout";

interface Feedback {
  id: string;
  content?: string;
  stars: number;
  createdAt: string;
  student?: {
    id: string;
    name: string;
    enrollmentNo: string;
  } | null;
  batchSubject?: {
    id: string;
    subject?: {
      id: string;
      name: string;
    } | null;
    teachers: {
      id: string;
      name: string;
    }[];
  } | null;
}

export default function AdminFeedbackList() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtering states
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Details Dialog
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const resetFilters = () => {
    setSelectedSubject("all");
    setStarFilter(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Fetch Feedbacks
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/feedback");
      if (!response.ok) throw new Error("Failed to fetch feedbacks");
      const data = await response.json();
      setFeedbacks(Array.isArray(data) ? data : []);
      setFilteredFeedbacks(Array.isArray(data) ? data : []);
      // Reset filters after successful fetch
      resetFilters();
    } catch (err: any) {
      setError(err.message);
      setFeedbacks([]);
      setFilteredFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete Feedback
  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete feedback");

      setFeedbacks(feedbacks.filter((f) => f.id !== feedbackId));
      setFilteredFeedbacks(
        filteredFeedbacks.filter((f) => f.id !== feedbackId)
      );
      // Reset filters after successful deletion
      resetFilters();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filtering Logic
  useEffect(() => {
    let result = [...feedbacks];

    if (selectedSubject && selectedSubject !== "all") {
      result = result.filter(
        (f) => f.batchSubject?.subject?.name === selectedSubject
      );
    }

    if (starFilter !== null) {
      // Changed condition to check for null
      result = result.filter((f) => f.stars === starFilter);
    }

    if (searchTerm) {
      result = result.filter(
        (f) =>
          f.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || // Added optional chaining
          f.batchSubject?.subject?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) // Added optional chaining
      );
    }

    setFilteredFeedbacks(result);
    setCurrentPage(1);
  }, [selectedSubject, starFilter, searchTerm, feedbacks]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(filteredFeedbacks)
    ? filteredFeedbacks.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Get Unique Subjects
  const uniqueSubjects = Array.from(
    new Set(
      Array.isArray(feedbacks) // Add defensive check
        ? (feedbacks
            .map((f) => f.batchSubject?.subject?.name)
            .filter(Boolean) as string[])
        : []
    )
  );

  // Error handling for loading state
  if (loading) {
    return (
      <SideBarLayout>
        <div className="container mx-auto px-4 py-6">
          <p>Loading feedbacks...</p>
        </div>
      </SideBarLayout>
    );
  }

  // Error handling for fetch error
  if (error) {
    return (
      <SideBarLayout>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-red-500">
              Error: {error}
              <Button onClick={fetchFeedbacks} className="ml-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </SideBarLayout>
    );
  }

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">
                Feedback Management
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={fetchFeedbacks}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh Feedback List</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <Select
                onValueChange={(value) => setSelectedSubject(value)}
                value={selectedSubject}
              >
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map((subject, index) => (
                    <SelectItem key={index} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) => setStarFilter(Number(value))}
                value={starFilter?.toString() || ""}
              >
                <SelectTrigger>
                  <Star className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by Rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <SelectItem key={stars} value={stars.toString()}>
                      {stars} Star{stars !== 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Search feedbacks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>

            {/* Feedback Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  {/* <TableHead>Student</TableHead> */}
                  <TableHead>Rating</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>
                      {feedback.batchSubject?.subject?.name || "N/A"}
                    </TableCell>
                    {/* <TableCell>
                      {feedback.student?.name || "Anonymous"}
                    </TableCell> */}
                    <TableCell>
                      <Badge variant="secondary">
                        {feedback.stars}{" "}
                        <Star className="ml-1 h-3 w-3 text-yellow-500" />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFeedback(feedback)}
                        >
                          View
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Feedback
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this feedback?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteFeedback(feedback.id)
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredFeedbacks.length)}
                of {filteredFeedbacks.length} entries
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      prev < Math.ceil(filteredFeedbacks.length / itemsPerPage)
                        ? prev + 1
                        : prev
                    )
                  }
                  disabled={
                    currentPage >=
                    Math.ceil(filteredFeedbacks.length / itemsPerPage)
                  }
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Details Dialog */}
        {selectedFeedback && (
          <Dialog
            open={!!selectedFeedback}
            onOpenChange={() => setSelectedFeedback(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Feedback Details</DialogTitle>
                <DialogDescription>
                  Detailed view of feedback for{" "}
                  {selectedFeedback.batchSubject?.subject?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* <div>
                  <strong>Student:</strong>
                  {` ${selectedFeedback.student?.name || "Anonymous"} 
                   (${selectedFeedback.student?.enrollmentNo || "N/A"})`}
                </div> */}
                <div>
                  <strong>Subject:</strong>
                  {` ${selectedFeedback.batchSubject?.subject?.name || "N/A"}`}
                </div>
                <div>
                  <strong>Rating:</strong>
                  <Badge variant="secondary" className="ml-2">
                    {selectedFeedback.stars}{" "}
                    <Star className="ml-1 h-3 w-3 text-yellow-500" />
                  </Badge>
                </div>
                <div>
                  <strong>Date:</strong>
                  {` ${new Date(selectedFeedback.createdAt).toLocaleString()}`}
                </div>
                <div>
                  <strong>Feedback:</strong>
                  <p className="mt-2 p-3  rounded">
                    {selectedFeedback.content || "No additional comments"}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </SideBarLayout>
  );
}
