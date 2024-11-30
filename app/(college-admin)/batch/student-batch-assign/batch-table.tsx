"use client";
import React, { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronDown,
  Phone,
  Mail,
  MoreVertical,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type BatchStatus = "PROMOTED" | "IN_PROGRESS" | "RESIT";

interface Student {
  id: string;
  name: string;
  enrollmentNo: string;
  personalEmail: string;
  phoneNo: string;
}

interface StudentBatchItem {
  student: Student;
  batchStatus: BatchStatus;
}

interface StudentBatchTableProps {
  students: StudentBatchItem[];
  batchId: string;
  onStatusUpdate: (studentIds: string[], status: BatchStatus) => Promise<void>;
  onDeleteStudent?: (studentId: string) => Promise<void>;
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 10;

const StudentBatchTable: React.FC<StudentBatchTableProps> = ({
  students,
  batchId,
  onStatusUpdate,
  onDeleteStudent,
  isLoading,
}) => {
  const { toast } = useToast();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<BatchStatus | "ALL">("ALL");
  const [isMobileView, setIsMobileView] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  const handleDeleteStudent = async (student: Student) => {
    if (!onDeleteStudent) return;

    try {
      await onDeleteStudent(student.id);
      toast({
        title: "Success",
        description: "Student removed from batch successfully",
      });
      setStudentToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to remove student",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageStudentIds = getCurrentPageStudents().map(
        (s) => s.student.id
      );
      setSelectedStudents((prev) => {
        const otherPageSelections = prev.filter(
          (id) => !currentPageStudentIds.includes(id)
        );
        return [...otherPageSelections, ...currentPageStudentIds];
      });
    } else {
      const currentPageStudentIds = getCurrentPageStudents().map(
        (s) => s.student.id
      );
      setSelectedStudents((prev) =>
        prev.filter((id) => !currentPageStudentIds.includes(id))
      );
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleBatchStatusUpdate = async (status: BatchStatus) => {
    if (selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one student",
        variant: "destructive",
      });
      return;
    }

    try {
      await onStatusUpdate(selectedStudents, status);
      setSelectedStudents([]);
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (
    status: BatchStatus
  ): "default" | "destructive" | "secondary" => {
    switch (status) {
      case "PROMOTED":
        return "default";
      case "IN_PROGRESS":
        return "default";
      case "RESIT":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || s.batchStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination functions
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  const getCurrentPageStudents = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const PaginationControls = () => (
    <div className="flex items-center justify-center space-x-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
        {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} of{" "}
        {filteredStudents.length} entries
      </div>
      <div className="flex items-center space-x-2 ">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const DesktopView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  getCurrentPageStudents().length > 0 &&
                  getCurrentPageStudents().every((item) =>
                    selectedStudents.includes(item.student.id)
                  )
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Enrollment</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getCurrentPageStudents().map((item) => (
            <TableRow key={item.student.id}>
              <TableCell>
                <Checkbox
                  checked={selectedStudents.includes(item.student.id)}
                  onCheckedChange={() => handleSelectStudent(item.student.id)}
                />
              </TableCell>
              <TableCell>{item.student.name}</TableCell>
              <TableCell>{item.student.enrollmentNo}</TableCell>
              <TableCell>{item.student.personalEmail}</TableCell>
              <TableCell>{item.student.phoneNo}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(item.batchStatus)}>
                  {item.batchStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setStudentToDelete(item.student)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove from Batch
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationControls />
    </div>
  );

  const MobileView = () => (
    <div className="space-y-4">
      {getCurrentPageStudents().map((item) => (
        <Card key={item.student.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedStudents.includes(item.student.id)}
                  onCheckedChange={() => handleSelectStudent(item.student.id)}
                />
                <div>
                  <h3 className="font-medium">{item.student.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.student.enrollmentNo}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(item.batchStatus)}>
                  {item.batchStatus}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setStudentToDelete(item.student)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove from Batch
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {item.student.personalEmail}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {item.student.phoneNo}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <PaginationControls />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value: BatchStatus | "ALL") =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PROMOTED">Promoted</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESIT">Resit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedStudents.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                Update Status <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleBatchStatusUpdate("PROMOTED")}
              >
                Promoted
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBatchStatusUpdate("IN_PROGRESS")}
              >
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBatchStatusUpdate("RESIT")}
              >
                Resit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isMobileView ? <MobileView /> : <DesktopView />}

      <AlertDialog
        open={!!studentToDelete}
        onOpenChange={() => setStudentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student from Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {studentToDelete?.name} from this
              batch? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                studentToDelete && handleDeleteStudent(studentToDelete)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentBatchTable;
