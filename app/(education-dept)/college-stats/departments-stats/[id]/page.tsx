"use client";
import React from "react";
import * as Sentry from "@sentry/nextjs";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users2,
  GraduationCap,
  BookOpen,
  UserCheck,
  Percent,
  AlertCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import SideBarLayout from "@/components/sidebar/layout";

interface DepartmentStats {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalAlumni: number;
  passPercentage: number;
  unassignedSubjectsCount: number;
}

interface Program {
  id: string;
  name: string;
  code: string;
}

interface HeadOfDepartment {
  id: string;
  name: string;
  user: {
    email: string;
  };
}

interface College {
  id: string;
  name: string;
}

interface DepartmentData {
  id: string;
  name: string;
  isActive: boolean;
  college: College;
  headOfDepartment: HeadOfDepartment | null;
  programs: Program[];
  statistics: DepartmentStats;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

interface ChartDataItem {
  name: string;
  value: number;
}

interface BarChartDataItem {
  name: string;
  Students: number;
  Teachers: number;
  Subjects: number;
  Alumni: number;
}

class DepartmentStatsError extends Error {
  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = "DepartmentStatsError";

    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
        scope.setLevel("error");
        Sentry.captureException(this);
      });
    }
  }
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const DepartmentStatsPage: React.FC = () => {
  const params = useParams();
  const [departmentData, setDepartmentData] =
    React.useState<DepartmentData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchDepartmentStats = async () => {
      try {
        await Sentry.startSpan(
          {
            name: "Fetch Department Stats",
            op: "http",
          },
          async () => {
            const response = await fetch(
              `/api/educationDepartment/department/${params.id}`
            );

            if (!response.ok) {
              throw new DepartmentStatsError(
                `Failed to fetch department statistics: ${response.status} ${response.statusText}`,
                {
                  departmentId: params.id,
                  status: response.status,
                  statusText: response.statusText,
                }
              );
            }

            const data: DepartmentData = await response.json();
            setDepartmentData(data);
          }
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);

        Sentry.withScope((scope) => {
          scope.setTag("component", "DepartmentStatsPage");
          scope.setTag("action", "fetchDepartmentStats");
          scope.setExtra("departmentId", params.id);
          scope.setLevel("error");
          Sentry.captureException(err);
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchDepartmentStats();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !departmentData) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error || "Department not found"}
      </div>
    );
  }

  const distributionData: ChartDataItem[] = [
    { name: "Students", value: departmentData.statistics.totalStudents },
    { name: "Teachers", value: departmentData.statistics.totalTeachers },
    { name: "Alumni", value: departmentData.statistics.totalAlumni },
  ];

  const subjectData: ChartDataItem[] = [
    {
      name: "Assigned",
      value:
        departmentData.statistics.totalSubjects -
        departmentData.statistics.unassignedSubjectsCount,
    },
    {
      name: "Unassigned",
      value: departmentData.statistics.unassignedSubjectsCount,
    },
  ];

  const barData: BarChartDataItem[] = [
    {
      name: "Department Statistics",
      Students: departmentData.statistics.totalStudents,
      Teachers: departmentData.statistics.totalTeachers,
      Subjects: departmentData.statistics.totalSubjects,
      Alumni: departmentData.statistics.totalAlumni,
    },
  ];

  interface CustomLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
    name: string;
  }

  const renderCustomLabel = ({ name, percent }: Partial<CustomLabelProps>) => {
    return `${name} ${((percent || 0) * 100).toFixed(0)}%`;
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto p-4 lg:p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {departmentData.name}
          </h1>
          <p className="text-muted-foreground">
            {departmentData.college.name} -{" "}
            <span
              className={`${
                departmentData.isActive ? "text-green-500" : "text-red-500"
              }`}
            >
              {departmentData.isActive ? "Active" : "Inactive"}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total Students"
            value={departmentData.statistics.totalStudents}
            icon={<Users2 className="w-4 h-4 text-primary" />}
          />
          <StatsCard
            title="Total Teachers"
            value={departmentData.statistics.totalTeachers}
            icon={<GraduationCap className="w-4 h-4 text-primary" />}
          />
          <StatsCard
            title="Total Subjects"
            value={departmentData.statistics.totalSubjects}
            icon={<BookOpen className="w-4 h-4 text-primary" />}
          />
          <StatsCard
            title="Total Alumni"
            value={departmentData.statistics.totalAlumni}
            icon={<UserCheck className="w-4 h-4 text-primary" />}
          />
          <StatsCard
            title="Pass Percentage"
            value={`${departmentData.statistics.passPercentage}%`}
            icon={<Percent className="w-4 h-4 text-primary" />}
            description="Based on promoted students"
          />
          <StatsCard
            title="Unassigned Subjects"
            value={departmentData.statistics.unassignedSubjectsCount}
            icon={<AlertCircle className="w-4 h-4 text-primary" />}
            description="Subjects without teachers"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((_, index) => (
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Students" fill={COLORS[0]} />
                  <Bar dataKey="Teachers" fill={COLORS[1]} />
                  <Bar dataKey="Subjects" fill={COLORS[2]} />
                  <Bar dataKey="Alumni" fill={COLORS[3]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Programs Offered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program Name</TableHead>
                      <TableHead>Program Code</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentData.programs.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell className="font-medium">
                          {program.name}
                        </TableCell>
                        <TableCell>{program.code}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subject Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subjectData.map((_, index) => (
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
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Department Head Information</CardTitle>
          </CardHeader>
          <CardContent>
            {departmentData.headOfDepartment ? (
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {departmentData.headOfDepartment.name}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {departmentData.headOfDepartment.user.email}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No head of department assigned
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  description,
}) => (
  <Card className="hover:shadow-lg transition-shadow duration-200">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

export default DepartmentStatsPage;
