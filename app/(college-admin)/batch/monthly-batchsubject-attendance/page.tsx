"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Calendar,
  BookOpen,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import SideBarLayout from "@/components/sidebar/layout";

interface Student {
  id: string;
  name: string;
}

interface StudentBatch {
  student: Student;
  batchStatus: "IN_PROGRESS" | "PROMOTED" | "RESIT";
}

interface Subject {
  id: string;
  name: string;
  code: string;
  alias?: string;
}

interface BatchSubject {
  id: string;
  batchId: string;
  subjectId: string;
  subject?: Subject; // Make subject optional
  classType?: string;
  creditScore?: number;
  batch: {
    id: string; // Added id to match the data structure
    name: string; // This matches your requirement
  };
}

interface MonthlyBatchSubjectClass {
  id: string;
  month: string;
  totalTheoryClasses: number | null;
  totalPracticalClasses: number | null;
  completedTheoryClasses: number | null;
  completedPracticalClasses: number | null;
  batchSubject?: BatchSubject; // Make batchSubject optional
}
interface MonthlyAttendance {
  id: string;
  monthlyBatchSubjectClassesId: string;
  studentId: string;
  student: Student;
  attendedTheoryClasses: number;
  attendedPracticalClasses: number;
}

export default function MonthlyAttendanceDashboard() {
  const [monthlyClasses, setMonthlyClasses] = useState<
    MonthlyBatchSubjectClass[]
  >([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<MonthlyAttendance[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<MonthlyAttendance | null>(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    studentId: "",
    attendedTheoryClasses: 0,
    attendedPracticalClasses: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  useEffect(() => {
    fetchMonthlyClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAttendance();
    }
  }, [selectedClass]);
  const handleApiError = (error: any) => {
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };
  const fetchMonthlyClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/monthlyBatchSubjectClasses");
      const data = await response.json();
      console.log("monthlyBatchSubjectClassessssss", data);
      if (!response.ok) {
        throw new Error(data.error || "Failed to load monthly classes");
      }

      setMonthlyClasses(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const attendanceResponse = await fetch(
        `/api/monthlyBatchSubjectClasses/${selectedClass}/monthlyBatchSubjectAttendance`
      );
      const attendanceData = await attendanceResponse.json();

      if (!attendanceResponse.ok) {
        throw new Error(
          attendanceData.error || "Failed to load attendance records"
        );
      }

      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);

      // Fetch students for the selected batch
      const selectedClassData = monthlyClasses.find(
        (c) => c.id === selectedClass
      );

      if (selectedClassData?.batchSubject?.batchId) {
        const studentsResponse = await fetch(
          `/api/batch/${selectedClassData.batchSubject.batchId}/students`
        );
        const studentsData = await studentsResponse.json();

        if (!studentsResponse.ok) {
          throw new Error(studentsData.error || "Failed to load students list");
        }

        const inProgressStudents = studentsData
          .filter(
            (studentBatch: StudentBatch) =>
              studentBatch.batchStatus === "IN_PROGRESS"
          )
          .map((studentBatch: StudentBatch) => ({
            id: studentBatch.student.id,
            name: studentBatch.student.name,
          }));

        setStudents(inProgressStudents);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const submitData = {
      ...formData,
      monthlyBatchSubjectClassesId: selectedClass,
    };

    try {
      const url = selectedRecord
        ? `/api/batchSubjectAttendance/monthlyBatchSubjectAttendance/${selectedRecord.id}`
        : `/api/monthlyBatchSubjectClasses/${selectedClass}/monthlyBatchSubjectAttendance`;
      const method = selectedRecord ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save attendance");
      }

      toast({
        title: "Success",
        description: selectedRecord
          ? "Attendance updated successfully"
          : "Attendance added successfully",
      });

      fetchAttendance();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/batchSubjectAttendance/monthlyBatchSubjectAttendance/${id}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete record");
      }

      toast({
        title: "Success",
        description: "Attendance record deleted successfully",
      });

      fetchAttendance();
      setDeleteId(null); // Reset deleteId after successful deletion
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };
  const getSelectedSubjectName = (classId: any) => {
    const selectedMonthlyClass = monthlyClasses.find((mc) => mc.id === classId);
    if (!selectedMonthlyClass) return "";
    const subjectName =
      selectedMonthlyClass.batchSubject?.subject?.name || "Unnamed Subject";
    const batchName =
      selectedMonthlyClass.batchSubject?.batch?.name || "Unnamed Batch";
    return `${subjectName} (${batchName})`;
  };
  const resetForm = () => {
    setFormData({
      studentId: "",
      attendedTheoryClasses: 0,
      attendedPracticalClasses: 0,
    });
    setSelectedRecord(null);
  };
  const filteredAttendance = attendance.filter((record) =>
    record.student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedAttendance = filteredAttendance.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Batch Subject Attendance</CardTitle>
            <CardDescription>
              Manage student attendance for monthly batch classes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full h-auto">
                  <SelectValue placeholder="Select Monthly Class">
                    {selectedClass && getSelectedSubjectName(selectedClass)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-full min-w-[300px]">
                  {monthlyClasses.map((monthlyClass) => {
                    const subjectName =
                      monthlyClass.batchSubject?.subject?.name ||
                      "Unnamed Subject";
                    const subjectCode =
                      monthlyClass.batchSubject?.subject?.code || "No Code";
                    const subjectAlias =
                      monthlyClass.batchSubject?.subject?.alias;

                    return (
                      <SelectItem
                        key={monthlyClass.id}
                        value={monthlyClass.id}
                        className="py-4 px-3 hover:bg-accent cursor-pointer"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="font-medium">
                            {subjectName} ({subjectCode}) -{" "}
                            {monthlyClass.batchSubject?.batch?.name ||
                              "Unnamed Batch"}
                            {subjectAlias && ` (${subjectAlias})`}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {monthlyClass.month}
                            </span>
                            <span className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              Theory: {monthlyClass.completedTheoryClasses ?? 0}
                              /{monthlyClass.totalTheoryClasses ?? 0}
                            </span>
                            <span className="flex items-center gap-2">
                              <FlaskConical className="h-4 w-4" />
                              Practical:{" "}
                              {monthlyClass.completedPracticalClasses ?? 0}/
                              {monthlyClass.totalPracticalClasses ?? 0}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading...
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : !selectedClass ? (
              <Alert>
                <AlertTitle>Select Class</AlertTitle>
                <AlertDescription>
                  Please select a monthly class to manage attendance
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
                  <div className="relative w-full sm:w-72">
                    <Input
                      type="text"
                      placeholder="Search by student name..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset to first page when searching
                      }}
                      className="pl-8"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Attendance
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {selectedRecord ? "Edit" : "Add"} Attendance
                        </DialogTitle>
                        <DialogDescription>
                          Enter student attendance details
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Student</Label>
                          <Select
                            value={formData.studentId}
                            onValueChange={(value) =>
                              setFormData({ ...formData, studentId: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Student" />
                            </SelectTrigger>
                            <SelectContent>
                              {students.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Attended Theory Classes</Label>
                            <Input
                              type="number"
                              min="0"
                              value={formData.attendedTheoryClasses}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  attendedTheoryClasses:
                                    parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Attended Practical Classes</Label>
                            <Input
                              type="number"
                              min="0"
                              value={formData.attendedPracticalClasses}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  attendedPracticalClasses:
                                    parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={loading}>
                            {loading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saving...
                              </>
                            ) : (
                              <>{selectedRecord ? "Update" : "Save"}</>
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Theory Classes</TableHead>
                      <TableHead>Practical Classes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center p-6">
                          {searchQuery
                            ? "No matching records found"
                            : "No attendance records found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedAttendance.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.student.name}</TableCell>
                          <TableCell>{record.attendedTheoryClasses}</TableCell>
                          <TableCell>
                            {record.attendedPracticalClasses}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setFormData({
                                    studentId: record.studentId,
                                    attendedTheoryClasses:
                                      record.attendedTheoryClasses,
                                    attendedPracticalClasses:
                                      record.attendedPracticalClasses,
                                  });
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog
                                open={deleteId === record.id}
                                onOpenChange={(open) =>
                                  !open && setDeleteId(null)
                                }
                              >
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteId(record.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete the attendance record.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(record.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Add this pagination component after the Table */}
                {filteredAttendance.length > 0 && (
                  <Pagination className="mt-4">
                    <PaginationContent className="flex flex-wrap items-center justify-center gap-1 md:gap-2">
                      <div className="flex items-center mr-2">
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={cn(
                              "cursor-pointer flex items-center w-full",
                              currentPage === 1 &&
                                "pointer-events-none opacity-50"
                            )}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline mr-2">
                              Previous
                            </span>
                          </PaginationLink>
                        </PaginationItem>
                      </div>

                      <div className="flex flex-wrap items-center gap-1">
                        {[...Array(totalPages)].map((_, index) => {
                          // Always show first two pages
                          if (index < 2) {
                            return (
                              <PaginationItem key={index + 1}>
                                <PaginationLink
                                  onClick={() => handlePageChange(index + 1)}
                                  isActive={currentPage === index + 1}
                                  className="cursor-pointer min-w-[32px] h-8 flex items-center justify-center"
                                >
                                  {index + 1}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          // Show ellipsis after first two pages
                          if (index === 2) {
                            return (
                              <PaginationItem key="ellipsis">
                                <span className="px-2">...</span>
                              </PaginationItem>
                            );
                          }
                          // Show last page
                          if (index === totalPages - 1) {
                            return (
                              <PaginationItem key={totalPages}>
                                <PaginationLink
                                  onClick={() => handlePageChange(totalPages)}
                                  isActive={currentPage === totalPages}
                                  className="cursor-pointer min-w-[32px] h-8 flex items-center justify-center"
                                >
                                  {totalPages}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <div className="flex items-center ml-2">
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={cn(
                              "cursor-pointer flex items-center w-full",
                              currentPage === totalPages &&
                                "pointer-events-none opacity-50"
                            )}
                          >
                            <span className="hidden sm:inline mr-1">Next</span>
                            <ChevronRight className="h-4 w-4" />
                          </PaginationLink>
                        </PaginationItem>
                      </div>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
}
