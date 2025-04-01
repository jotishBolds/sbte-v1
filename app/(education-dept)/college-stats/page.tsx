"use client";
import React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Users,
  Building2,
  BookOpen,
  GraduationCap,
  Calculator,
  UserCog,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import SideBarLayout from "@/components/sidebar/layout";
import { Button } from "@/components/ui/button";

interface College {
  id: string;
  name: string;
  address: string;
  abbreviation: string;
  establishedOn: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  logo: string;
}

interface CollegeListItem {
  id: string;
  name: string;
  abbreviation: string;
}

interface CollegeStatistics {
  totalStaff: number;
  totalDepartments: number;
  totalStudents: number;
  totalTeachers: number;
  totalFinanceManager: number;
  totalSubjects: number;
}

interface CollegeResponse {
  college: College;
  statistics: CollegeStatistics;
}

interface Student {
  id: string;
  name: string;
  studentAvatar: string | null;
  email: string;
  collegeName: string;
  departmentName: string;
  programName: string;
  semesterName: string;
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

interface ChartDataItem {
  name: string;
  value: number;
}
const ITEMS_PER_PAGE = 10;
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const EducationDashboard: React.FC = () => {
  const [colleges, setColleges] = useState<CollegeListItem[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [collegeStats, setCollegeStats] = useState<CollegeResponse | null>(
    null
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchName, setSearchName] = useState<string>("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterProgram, setFilterProgram] = useState<string>("all");
  const [filterSemester, setFilterSemester] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const router = useRouter();

  useEffect(() => {
    fetchColleges();
  }, []);

  // Filter effect
  useEffect(() => {
    let result = [...students];

    // Filter logic remains the same
    if (searchName) {
      result = result.filter((student) =>
        student.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (filterDepartment !== "all") {
      result = result.filter(
        (student) => student.departmentName === filterDepartment
      );
    }

    if (filterProgram !== "all") {
      result = result.filter(
        (student) => student.programName === filterProgram
      );
    }

    if (filterSemester !== "all") {
      result = result.filter(
        (student) => student.semesterName === filterSemester
      );
    }

    // Update total pages based on filtered results
    setTotalPages(Math.ceil(result.length / ITEMS_PER_PAGE));

    // Paginate the results
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedResult = result.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

    setFilteredStudents(paginatedResult);
  }, [
    students,
    searchName,
    filterDepartment,
    filterProgram,
    filterSemester,
    currentPage,
  ]);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, filterDepartment, filterProgram, filterSemester]);

  const fetchColleges = async () => {
    try {
      const response = await fetch("/api/colleges");
      const result = await response.json();

      // Handle different possible response structures
      let collegesList: CollegeListItem[] = [];

      if (Array.isArray(result)) {
        collegesList = result;
      } else if (result.data && Array.isArray(result.data)) {
        collegesList = result.data;
      } else if (typeof result === "object" && result !== null) {
        // If the response is an object with college data
        collegesList = Object.values(result).filter(
          (item) =>
            item && typeof item === "object" && "id" in item && "name" in item
        ) as CollegeListItem[];
      }

      setColleges(collegesList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching colleges:", error);
      setError("Failed to load colleges");
      setLoading(false);
    }
  };

  const fetchCollegeStats = async (collegeId: string) => {
    try {
      const response = await fetch(
        `/api/educationDepartment/college/${collegeId}`
      );
      const data: CollegeResponse = await response.json();
      setCollegeStats(data);
    } catch (error) {
      console.error("Error fetching college stats:", error);
      setError("Failed to load college statistics");
    }
  };

  const fetchStudents = async (collegeId: string) => {
    try {
      const response = await fetch(
        `/api/educationDepartment/student?collegeId=${collegeId}`
      );
      const data: Student[] = await response.json();
      setStudents(data);
      setFilteredStudents(data); // Initialize filtered students
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load students");
    }
  };

  const handleCollegeChange = async (collegeId: string) => {
    setSelectedCollege(collegeId);
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchCollegeStats(collegeId),
        fetchStudents(collegeId),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (statistics: CollegeStatistics): ChartDataItem[] => {
    return [
      { name: "Students", value: statistics.totalStudents },
      { name: "Teachers", value: statistics.totalTeachers },
      { name: "Staff", value: statistics.totalStaff },
      { name: "Departments", value: statistics.totalDepartments },
      { name: "Subjects", value: statistics.totalSubjects },
    ];
  };

  // Get unique values for filters
  const departments = Array.from(
    new Set(students.map((s) => s.departmentName))
  );
  const programs = Array.from(new Set(students.map((s) => s.programName)));
  const semesters = Array.from(new Set(students.map((s) => s.semesterName)));

  if (loading && !selectedCollege) {
    return <div className="container mx-auto p-6">Loading colleges...</div>;
  }

  if (error && !selectedCollege) {
    return <div className="container mx-auto p-6 text-red-500">{error}</div>;
  }
  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      prevPage < totalPages ? prevPage + 1 : prevPage
    );
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : prevPage));
  };
  return (
    <SideBarLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="w-full max-w-md">
          <Select onValueChange={handleCollegeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a college" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(colleges) && colleges.length > 0 ? (
                colleges.map((college) => (
                  <SelectItem key={college.id} value={college.id}>
                    {college.name}{" "}
                    {college.abbreviation ? `(${college.abbreviation})` : ""}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-colleges" disabled>
                  No colleges available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {loading && selectedCollege && <div>Loading college data...</div>}
        {error && selectedCollege && (
          <div className="text-red-500">{error}</div>
        )}

        {collegeStats && !loading && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  {collegeStats.college.name}
                </CardTitle>
                <p className="text-sm ">{collegeStats.college.address}</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareChartData(collegeStats.statistics)}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#4f46e5"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareChartData(collegeStats.statistics)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareChartData(collegeStats.statistics).map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatsCard
                title="Total Students"
                value={collegeStats.statistics.totalStudents}
                icon={<Users className="w-4 h-4 " />}
              />
              <StatsCard
                title="Total Teachers"
                value={collegeStats.statistics.totalTeachers}
                icon={<GraduationCap className="w-4 h-4 " />}
              />
              <StatsCard
                title="Total Departments"
                value={collegeStats.statistics.totalDepartments}
                icon={<BookOpen className="w-4 h-4 " />}
              />
              <StatsCard
                title="Total Subjects"
                value={collegeStats.statistics.totalSubjects}
                icon={<Calculator className="w-4 h-4 " />}
              />
              <StatsCard
                title="Total Staff"
                value={collegeStats.statistics.totalStaff}
                icon={<UserCog className="w-4 h-4 " />}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Students List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4"></div>
                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <Input
                    placeholder="Search by name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full"
                  />
                  <Select
                    value={filterDepartment}
                    onValueChange={setFilterDepartment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterProgram}
                    onValueChange={setFilterProgram}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      {programs.map((prog) => (
                        <SelectItem key={prog} value={prog}>
                          {prog}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterSemester}
                    onValueChange={setFilterSemester}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {semesters.map((sem) => (
                        <SelectItem key={sem} value={sem}>
                          {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Profile</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Email
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Department
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Program
                        </TableHead>
                        <TableHead>Semester</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(filteredStudents) &&
                      filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <TableRow
                            key={student.id}
                            className="cursor-pointer"
                            onClick={() =>
                              router.push(`/college-stats/${student.id}`)
                            }
                          >
                            <TableCell>
                              <Avatar>
                                <AvatarImage
                                  src={student.studentAvatar || undefined}
                                />
                                <AvatarFallback>
                                  {student.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {student.email}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {student.departmentName}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {student.programName}
                            </TableCell>
                            <TableCell>{student.semesterName}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No students found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center"
                    >
                      Next <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </SideBarLayout>
  );
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default EducationDashboard;
