"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BookOpen,
  GraduationCap,
  Users,
  Percent,
  ActivitySquare,
  Wallet,
  Calendar,
  School,
  Mail,
  Hash,
  Building2,
} from "lucide-react";
import SideBarLayout from "@/components/sidebar/layout";

interface ExamType {
  id: string;
  examName: string;
  totalMarks: number;
  passingMarks: number;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface BatchSubject {
  id: string;
  subject: Subject;
  subjectType: {
    id: string;
    name: string;
  };
}

interface ExamMark {
  id: string;
  achievedMarks: number;
  wasAbsent: boolean;
  debarred: boolean;
  malpractice: boolean;
  batchSubject: BatchSubject;
  examType: ExamType;
}

interface Student {
  id: string;
  name: string;
  studentAvatar: string | null;
  enrollmentNo: string;
  dob: string;
  gender: string;
  user: {
    username: string;
    email: string;
  };
  college: {
    id: string;
    name: string;
    abbreviation: string;
  };
  department: {
    id: string;
    name: string;
  };
  program: {
    id: string;
    name: string;
    code: string;
  };
  term: {
    id: string;
    name: string;
    alias: string;
  };
  examMarks: ExamMark[];
}

interface Statistics {
  totalSubjects: number;
  averageAttendance: number;
  averageScore: number;
  totalPendingAmount: number;
  totalCompletedAmount: number;
  pendingFeesCount: number;
  latestBatchAverageAttendance: number;
  latestBatchAverageScore: number;
}

interface APIResponse {
  student: Student;
  statistics: Statistics;
}

interface ChartDataPoint {
  name: string;
  value: number;
}

interface ExamPerformanceDataPoint {
  subject: string;
  achieved: number;
  total: number;
  passing: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const LoadingSkeleton = () => (
  <div className="container mx-auto p-6 space-y-6">
    <Card className="w-full">
      <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-4 flex-1">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-32" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const EmptyState = () => (
  <Card className="w-full">
    <CardContent className="flex flex-col items-center justify-center p-6 min-h-[400px] text-center">
      <School className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Student Data Available</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        The student record you're looking for doesn't exist or hasn't been
        loaded properly. Please check the student ID and try again.
      </p>
    </CardContent>
  </Card>
);

const StudentDashboard: React.FC = () => {
  const params = useParams();
  const [data, setData] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentStats = async () => {
      try {
        const response = await fetch(
          `/api/educationDepartment/student/stats/${params.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch student data");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchStudentStats();
  }, [params.id]);

  if (loading) return <LoadingSkeleton />;
  if (error)
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  if (!data || !data.student) return <EmptyState />;

  const { student, statistics } = data;

  // Prepare data for charts
  const attendanceData: ChartDataPoint[] = [
    { name: "Overall", value: statistics.averageAttendance },
    { name: "Latest Batch", value: statistics.latestBatchAverageAttendance },
  ];

  const scoreData: ChartDataPoint[] = [
    { name: "Overall", value: statistics.averageScore },
    { name: "Latest Batch", value: statistics.latestBatchAverageScore },
  ];

  const feesData: ChartDataPoint[] = [
    { name: "Completed", value: statistics.totalCompletedAmount },
    { name: "Pending", value: statistics.totalPendingAmount },
  ];

  const examPerformanceData: ExamPerformanceDataPoint[] = student.examMarks.map(
    (mark) => ({
      subject: mark.batchSubject.subject.code,
      achieved:
        mark.wasAbsent || mark.debarred || mark.malpractice
          ? 0
          : mark.achievedMarks,
      total: mark.examType.totalMarks,
      passing: mark.examType.passingMarks,
    })
  );

  return (
    <SideBarLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card className="w-full">
          <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={student.studentAvatar || undefined}
                alt={student.name}
              />
              <AvatarFallback className="text-xl">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h2 className="text-3xl font-bold">{student.name}</h2>
                <Badge variant="secondary">{student.term.name}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span>{student.enrollmentNo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="break-all">{student.user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="break-words">{student.college.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-muted-foreground" />
                  <span>{student.program.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(student.dob).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.totalSubjects}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Fees
              </CardTitle>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{statistics.totalPendingAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.pendingFeesCount} pending payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Score
              </CardTitle>
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.averageScore.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="attendance" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <div className="overflow-x-auto flex w-full no-scrollbar">
                  <div className="flex-none p-2">
                    <TabsTrigger
                      value="attendance"
                      className="data-[state=active]:bg-background"
                    >
                      Attendance Analysis
                    </TabsTrigger>
                  </div>
                  <div className="flex-none p-2">
                    <TabsTrigger
                      value="performance"
                      className="data-[state=active]:bg-background"
                    >
                      Academic Performance
                    </TabsTrigger>
                  </div>
                  <div className="flex-none p-2">
                    <TabsTrigger
                      value="fees"
                      className="data-[state=active]:bg-background"
                    >
                      Fees Overview
                    </TabsTrigger>
                  </div>
                </div>
              </TabsList>

              <div className="p-4">
                <TabsContent value="attendance" className="m-0">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Attendance Overview
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Comparison of overall and latest batch attendance
                    </p>
                    <div className="h-[300px] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={attendanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="value"
                            fill="#0088FE"
                            name="Attendance %"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="m-0">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Subject-wise Performance
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Exam scores across different subjects
                    </p>
                    <div className="h-[300px] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={examPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="achieved"
                            stroke="#0088FE"
                            name="Achieved Marks"
                          />
                          <Line
                            type="monotone"
                            dataKey="passing"
                            stroke="#FF8042"
                            name="Passing Marks"
                            strokeDasharray="5 5"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fees" className="m-0">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Fees Distribution</h3>
                    <p className="text-sm text-muted-foreground">
                      Overview of completed and pending fees
                    </p>
                    <div className="h-[300px] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={feesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ percent }) =>
                              `${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {feesData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam Records</CardTitle>
            <CardDescription>
              Detailed view of all examination results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.examMarks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <GraduationCap className="w-8 h-8 mb-2" />
                          <p>No exam records available</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    student.examMarks.map((mark) => (
                      <TableRow key={mark.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="whitespace-nowrap">
                              {mark.batchSubject.subject.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({mark.batchSubject.subject.code})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{mark.examType.examName}</TableCell>
                        <TableCell>
                          {mark.wasAbsent ? (
                            <Badge variant="secondary">Absent</Badge>
                          ) : mark.debarred ? (
                            <Badge variant="destructive">Debarred</Badge>
                          ) : mark.malpractice ? (
                            <Badge variant="destructive">Malpractice</Badge>
                          ) : mark.achievedMarks >=
                            mark.examType.passingMarks ? (
                            <Badge variant="default">Pass</Badge>
                          ) : (
                            <Badge variant="destructive">Fail</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {mark.wasAbsent || mark.debarred || mark.malpractice
                            ? "N/A"
                            : `${mark.achievedMarks}/${mark.examType.totalMarks}`}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
};

export default StudentDashboard;
