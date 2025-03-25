"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  User,
  School,
  Mail,
  Phone,
  Calendar,
  MapPin,
  UserPlus,
  Search,
  HomeIcon,
  Flag,
  UserCircle,
  Users,
  GraduationCap,
  Building,
  AlignEndHorizontal,
  Building2,
  ChartBarStacked,
  Send,
  Pin,
} from "lucide-react";
import SideBarLayout from "@/components/sidebar/layout";
import { EditStudentModal } from "./edit-modal";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

// Types for our student data
interface Student {
  id: string;
  name: string;
  enrollmentNo?: string;
  email?: string;
  personalEmail?: string;
  phoneNo?: string;
  studentAvatar?: string;
  program: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  };
  batchYear?: {
    id: string;
    year: number;
  };
  academicYear?: {
    id: string;
    name: string;
  };
}
interface User {
  id: string;
  username: string;
  email: string;
}

interface Program {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}
interface BatchYear {
  id: string;
  year: number;
  status: boolean;
}

interface AcademicYear {
  id: string;
  name: string;
}

interface StudentDetails extends Student {
  id: string;
  userId: string;
  username?: string;
  email?: string;
  name: string;
  dob: string;
  enrollmentNo?: string;
  personalEmail?: string;
  phoneNo?: string;
  studentAvatar?: string;
  program: Program;
  department: Department;
  user?: User;

  // Academic Details
  batchYear: BatchYear;
  batchYearId: string;
  admissionYearId: string;
  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: boolean;
    collegeId: string;
  };
  academicYearId: string;
  termId: string;
  term: {
    id: string;
    name: string;
  };
  abcId?: string;
  lastCollegeAttended?: string;
  admissionDate: string;
  graduateDate?: string;
  admissionCategory?: string;

  // Personal Details
  gender: string;
  isLocalStudent: boolean;
  isDifferentlyAbled: boolean;
  motherName: string;
  fatherName: string;
  bloodGroup?: string;
  religion?: string;
  nationality?: string;
  caste?: string;
  resident?: string;

  // Guardian Details
  guardianName?: string;
  guardianGender?: string;
  guardianEmail?: string;
  guardianMobileNo?: string;
  guardianRelation?: string;

  // Address Details
  permanentAddress: string;
  permanentCountry: string;
  permanentState: string;
  permanentCity: string;
  permanentPincode: string;
}

const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();
  const { toast } = useToast();

  // Add new state for filters
  const [filters, setFilters] = useState({
    department: "",
    program: "",
    batchYear: "",
    academicYear: "",
    status: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [batchYears, setBatchYears] = useState<BatchYear[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  // Fetch students
  const fetchStudentsData = async () => {
    try {
      const response = await fetch("/api/student");
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const [deptRes, progRes, batchRes, academicRes] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/programs"),
        fetch("/api/batchYear"),
        fetch("/api/academicYear"),
      ]);

      const [deptData, progData, batchData, academicData] = await Promise.all([
        deptRes.json(),
        progRes.json(),
        batchRes.json(),
        academicRes.json(),
      ]);

      setDepartments(deptData);
      setPrograms(progData);
      setBatchYears(batchData);
      setAcademicYears(academicData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch filter options",
        variant: "destructive",
      });
    }
  };

  // Use the function in useEffect
  useEffect(() => {
    fetchStudentsData();
    fetchFilterOptions();
  }, []);

  // View student details
  const handleViewStudent = async (id: string) => {
    try {
      const response = await fetch(`/api/student/${id}`);
      if (!response.ok) throw new Error("Failed to fetch student details");
      const data = await response.json();
      setSelectedStudent(data.student);
      setIsViewModalOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch student details",
        variant: "destructive",
      });
    }
  };

  // Update filtered students logic
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (student.name?.toLowerCase() || "").includes(query) ||
      (student.enrollmentNo?.toLowerCase() || "").includes(query) ||
      (student.email?.toLowerCase() || "").includes(query) ||
      (student.phoneNo?.toLowerCase() || "").includes(query) ||
      (student.program?.name?.toLowerCase() || "").includes(query) ||
      (student.department?.name?.toLowerCase() || "").includes(query);

    const matchesFilters =
      (!filters.department || student.department?.id === filters.department) &&
      (!filters.program || student.program?.id === filters.program) &&
      (!filters.batchYear || student.batchYear?.id === filters.batchYear) &&
      (!filters.academicYear ||
        student.academicYear?.id === filters.academicYear);

    return matchesSearch && matchesFilters;
  });

  // Delete student
  const handleDeleteStudent = async (id: string) => {
    try {
      const response = await fetch(`/api/student/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete student");

      setStudents(students.filter((student) => student.id !== id));
      setIsDeleteModalOpen(false);
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const Pagination = () => {
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;

    // Calculate which page numbers to show
    const getPageNumbers = () => {
      const delta = 1; // Number of pages to show on each side of current page
      let pages = [];

      if (totalPages <= 3) {
        // If total pages is 3 or less, show all pages
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
        // Always include first page
        pages.push(1);

        if (currentPage > 2) {
          pages.push(-1); // Add dots
        }

        // Add current page and surrounding pages
        for (
          let i = Math.max(2, currentPage - delta);
          i <= Math.min(totalPages - 1, currentPage + delta);
          i++
        ) {
          pages.push(i);
        }

        if (currentPage < totalPages - 1) {
          pages.push(-1); // Add dots
        }

        // Always include last page
        if (totalPages > 1) {
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, filteredStudents.length)} of{" "}
          {filteredStudents.length} entries
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {getPageNumbers().map((pageNum, index) =>
            pageNum === -1 ? (
              <span key={`dots-${index}`} className="px-2 py-1">
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const InfoItem = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value?: string | null;
    icon?: React.ComponentType<any>;
  }) => {
    if (!value) return null;

    return (
      <div className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
        {Icon && <Icon className="h-4 w-4 text-gray-500 mt-0.5" />}
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-base">{value}</p>
        </div>
      </div>
    );
  };

  const Section = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: React.ComponentType<any>;
    children: React.ReactNode;
  }) => (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  const StudentDetailsView = ({ student }: { student: StudentDetails }) => {
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase();
    };

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString();
    };

    return (
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Header Section */}
          <Card className="w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <Avatar className="h-32 w-32 border-4 border-primary/10">
                  <AvatarImage
                    src={student.studentAvatar}
                    alt={student.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl bg-primary/5">
                    {getInitials(student.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left space-y-2 flex-1">
                  <h2 className="text-3xl font-bold tracking-tight">
                    {student.name}
                  </h2>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {student.enrollmentNo}
                    </Badge>
                    {student.user?.username && (
                      <Badge variant="outline" className="text-sm">
                        @{student.user.username}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Academic Information */}
            <Section title="Academic Information" icon={GraduationCap}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={Building}
                  label="Program"
                  value={student.program?.name}
                />
                <InfoItem
                  icon={Building}
                  label="Department"
                  value={student.department?.name}
                />
                <InfoItem
                  icon={Calendar}
                  label="Batch Year"
                  value={student.batchYear?.year.toString()}
                />
                <InfoItem
                  icon={Calendar}
                  label="Academic Year"
                  value={student.academicYear?.name}
                />
                <InfoItem
                  label="Term"
                  icon={AlignEndHorizontal}
                  value={student.term.name}
                />
                <InfoItem
                  label="ABC ID"
                  icon={AlignEndHorizontal}
                  value={student.abcId}
                />
                <InfoItem
                  icon={Calendar}
                  label="Admission Date"
                  value={formatDate(student.admissionDate)}
                />
                <InfoItem
                  icon={Calendar}
                  label="Graduate Date"
                  value={
                    student.graduateDate
                      ? formatDate(student.graduateDate)
                      : undefined
                  }
                />
                <InfoItem
                  label="Last College"
                  icon={Building2}
                  value={student.lastCollegeAttended}
                />
                <InfoItem
                  label="Admission Category"
                  icon={ChartBarStacked}
                  value={student.admissionCategory}
                />
              </div>
            </Section>

            {/* Family Information */}
            <Section title="Family Information" icon={Users}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem
                    icon={UserCircle}
                    label="Mother's Name"
                    value={student.motherName}
                  />
                  <InfoItem
                    icon={UserCircle}
                    label="Father's Name"
                    value={student.fatherName}
                  />
                </div>

                <Separator className="my-4" />

                <h4 className="font-medium text-lg mb-4">Guardian Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem
                    icon={UserCircle}
                    label="Guardian Name"
                    value={student.guardianName}
                  />
                  <InfoItem
                    label="Guardian Relation"
                    icon={UserCircle}
                    value={student.guardianRelation}
                  />
                  <InfoItem
                    icon={Send}
                    label="Guardian Email"
                    value={student.guardianEmail}
                  />
                  <InfoItem
                    label="Guardian Mobile"
                    icon={Phone}
                    value={student.guardianMobileNo}
                  />
                </div>
              </div>
            </Section>

            {/* Status Information */}
            <Section title="Status Information" icon={Flag}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  label="Local Student"
                  value={student.isLocalStudent ? "Yes" : "No"}
                />
                <InfoItem
                  label="Differently Abled"
                  value={student.isDifferentlyAbled ? "Yes" : "No"}
                />
              </div>
            </Section>

            {/* Address Information */}
            <Section title="Address Information" icon={HomeIcon}>
              <div className="space-y-4">
                <InfoItem
                  icon={MapPin}
                  label="Permanent Address"
                  value={student.permanentAddress}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem
                    icon={Building}
                    label="City"
                    value={student.permanentCity}
                  />
                  <InfoItem
                    icon={Building}
                    label="State"
                    value={student.permanentState}
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Country"
                    value={student.permanentCountry}
                  />
                  <InfoItem
                    label="Pincode"
                    icon={Pin}
                    value={student.permanentPincode}
                  />
                </div>
              </div>
            </Section>
          </div>
        </div>
      </ScrollArea>
    );
  };

  // Add Filter Panel Component
  const FilterPanel = ({
    filters,
    setFilters,
    departments,
    programs,
    batchYears,
    academicYears,
  }: {
    filters: {
      department: string;
      program: string;
      batchYear: string;
      academicYear: string;
      status: string;
    };
    setFilters: React.Dispatch<
      React.SetStateAction<{
        department: string;
        program: string;
        batchYear: string;
        academicYear: string;
        status: string;
      }>
    >;
    departments: Department[];
    programs: Program[];
    batchYears: BatchYear[];
    academicYears: AcademicYear[];
  }) => (
    <Card className="mb-6">
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="department" className="mb-2 block">
              Department
            </Label>
            <Select
              value={filters.department || "all"}
              onValueChange={(value: string) =>
                setFilters((prev) => ({
                  ...prev,
                  department: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger id="department" className="w-full">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="program" className="mb-2 block">
              Program
            </Label>
            <Select
              value={filters.program || "all"}
              onValueChange={(value: string) =>
                setFilters((prev) => ({
                  ...prev,
                  program: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger id="program" className="w-full">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((prog) => (
                  <SelectItem key={prog.id} value={prog.id}>
                    {prog.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="batchYear" className="mb-2 block">
              Batch Year
            </Label>
            <Select
              value={filters.batchYear || "all"}
              onValueChange={(value: string) =>
                setFilters((prev) => ({
                  ...prev,
                  batchYear: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger id="batchYear" className="w-full">
                <SelectValue placeholder="All Batch Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batch Years</SelectItem>
                {batchYears.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.year.toString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="academicYear" className="mb-2 block">
              Academic Year
            </Label>
            <Select
              value={filters.academicYear || "all"}
              onValueChange={(value: string) =>
                setFilters((prev) => ({
                  ...prev,
                  academicYear: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger id="academicYear" className="w-full">
                <SelectValue placeholder="All Academic Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Academic Years</SelectItem>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                department: "",
                program: "",
                batchYear: "",
                academicYear: "",
                status: "",
              }))
            }
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SideBarLayout>
      {selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={() => {
            fetchStudentsData();
          }}
        />
      )}
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Students</h1>
            <p className="text-gray-500">Manage and view student information</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              className="md:hidden w-full"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              {isFilterOpen ? "Hide Filters" : "Show Filters"}
            </Button>
            <Button
              onClick={() => router.push("/student-register")}
              className="w-full md:w-auto"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>

        <div className={`md:block ${isFilterOpen ? "block" : "hidden"}`}>
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            departments={departments}
            programs={programs}
            batchYears={batchYears}
            academicYears={academicYears}
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search students..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px] px-6">Student</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Program
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Department
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Contact
                  </TableHead>
                  <TableHead className="text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-gray-500">No students found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium pl-6">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={student.studentAvatar}
                              alt={student.name}
                            />
                            <AvatarFallback>
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-500">
                              {student.enrollmentNo}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.program.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.department.name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{student.email}</p>
                          <p className="text-gray-500">{student.phoneNo}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleViewStudent(student.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStudent(student as StudentDetails);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedStudent(student as StudentDetails);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <Pagination />
        </Card>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-6xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(80vh-100px)] pr-4">
              {selectedStudent && (
                <StudentDetailsView student={selectedStudent} />
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this student? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  selectedStudent && handleDeleteStudent(selectedStudent.id)
                }
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SideBarLayout>
  );
};

export default StudentList;
