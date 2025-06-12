"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import * as Sentry from "@sentry/nextjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FiUsers,
  FiBook,
  FiBarChart2,
  FiDatabase,
  FiBell,
  FiAlertCircle,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconType } from "react-icons";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const COLORS = [
  "#2A9D8F",
  "#E76F51",
  "#264653",
  "#F4A261",
  "#9B5DE5",
  "#00B4D8",
];

interface StatCardProps {
  title: string;
  value: number;
  icon: IconType;
  color: string;
}

class DashboardError extends Error {
  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = "DashboardError";

    // Add context to Sentry scope
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

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
}) => {
  try {
    return (
      <Card className="hover:shadow-md transition-shadow duration-300 w-full">
        <CardContent className="flex items-center p-4 sm:p-6">
          <div
            className={`mr-3 sm:mr-4 rounded-full p-2 sm:p-3 bg-${color}-100 flex-shrink-0`}
          >
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${color}-600`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
              {title}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p
                    className={`text-lg sm:text-2xl font-bold text-${color}-600 truncate`}
                  >
                    {title.includes("Payment") ? `₹${value}` : value}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{title.includes("Payment") ? `₹${value}` : value}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    // Log error to console for debugging
    console.error("StatCard error:", error);

    // Return error fallback UI
    return (
      <Card className="hover:shadow-md transition-shadow duration-300 w-full border-red-200">
        <CardContent className="flex items-center p-4 sm:p-6">
          <div className="mr-3 sm:mr-4 rounded-full p-2 sm:p-3 bg-red-100 flex-shrink-0">
            <FiAlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-red-500 truncate">
              Error loading data
            </p>
            <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">
              --
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
};

const Dashboard: React.FC = () => {
  const { data: session } = useSession();
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Add user context to Sentry
        Sentry.setUser({
          id: session?.user?.id,
          email: session?.user?.email,
          role: session?.user?.role,
        });

        // Start a transaction for performance monitoring
        const transaction = Sentry.startSpan(
          {
            name: "fetchStatistics",
            op: "navigation",
          },
          async () => {
            let response;
            if (session?.user.role === "TEACHER") {
              response = await fetch(`/api/statistics/${session?.user.id}`);
            } else {
              response = await fetch(`/api/statistics`);
            }

            if (!response.ok) {
              const errorMessage = `Failed to fetch statistics: ${response.status} ${response.statusText}`;
              throw new DashboardError(errorMessage, {
                status: response.status,
                statusText: response.statusText,
                userId: session?.user?.id,
                userRole: session?.user?.role,
              });
            }

            const data = await response.json();
            setStatistics(data);

            // Add breadcrumb for successful fetch
            Sentry.addBreadcrumb({
              message: "Statistics fetched successfully",
              level: "info",
              data: {
                statisticsKeys: Object.keys(data),
                userRole: session?.user?.role,
              },
            });

            return data;
          }
        );
      } catch (error) {
        console.error("Error fetching statistics:", error);

        // Set user-friendly error message
        setError(
          error instanceof DashboardError
            ? error.message
            : "An unexpected error occurred while loading your dashboard. Please try again."
        );

        // Capture error with additional context
        Sentry.withScope((scope) => {
          scope.setTag("component", "Dashboard");
          scope.setTag("action", "fetchStatistics");
          scope.setContext("user", {
            id: session?.user?.id,
            role: session?.user?.role,
            email: session?.user?.email,
          });
          scope.setLevel("error");
          Sentry.captureException(error);
        });
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchStatistics();
    }
  }, [session]);

  const renderCharts = () => {
    if (!statistics) return null;

    try {
      const chartData =
        (session?.user as any)?.role === "TEACHER"
          ? [
              { name: "Total Subjects", value: statistics.totalSubjects },
              { name: "Total Students", value: statistics.totalStudents },
              { name: "Total Feedbacks", value: statistics.totalFeedbacks },
            ]
          : Object.entries(statistics).map(([name, value]) => ({
              name: name.replace(/([A-Z])/g, " $1").trim(),
              value,
            }));

      return (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4 flex flex-wrap justify-start gap-2">
            <TabsTrigger value="overview" className="flex-1 min-w-[120px]">
              Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="flex-1 min-w-[120px]">
              Detailed Analysis
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-semibold truncate">
                    Statistics Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                        interval="preserveStartEnd"
                        tickFormatter={(value) =>
                          value.slice(0, 15) + (value.length > 15 ? "..." : "")
                        }
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 12, color: "#6B7280" }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#4338ca"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-semibold truncate">
                    Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#4338ca"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 12, color: "#6B7280" }}
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold truncate">
                  Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      interval="preserveStartEnd"
                      tickFormatter={(value) =>
                        value.slice(0, 15) + (value.length > 15 ? "..." : "")
                      }
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#6B7280" }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#4338ca"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      );
    } catch (error) {
      console.error("Error rendering charts:", error);

      Sentry.withScope((scope) => {
        scope.setTag("component", "Dashboard");
        scope.setTag("action", "renderCharts");
        scope.setContext("chartData", statistics);
        Sentry.captureException(error);
      });

      return (
        <Alert className="border-red-200 bg-red-50">
          <FiAlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Unable to load charts. Please refresh the page or try again later.
          </AlertDescription>
        </Alert>
      );
    }
  };

  const renderTeacherDashboard = () => {
    if (!statistics || (session?.user as any)?.role !== "TEACHER") return null;

    try {
      return (
        <>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <StatCard
              title="Total Subjects"
              value={statistics.totalSubjects || 0}
              icon={FiBook}
              color="indigo"
            />
            <StatCard
              title="Total Students"
              value={statistics.totalStudents || 0}
              icon={FiUsers}
              color="cyan"
            />
            <StatCard
              title="Total Feedbacks"
              value={statistics.totalFeedbacks || 0}
              icon={FiBarChart2}
              color="green"
            />
          </div>
          {statistics.subjects && statistics.subjects.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {statistics.subjects.map((subject: any) => (
                    <li
                      key={subject.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                    >
                      <span className="text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                        {subject.name} ({subject.code})
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className="w-fit truncate max-w-[100px] sm:max-w-none">
                              {subject.semester}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{subject.semester}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      );
    } catch (error) {
      console.error("Error rendering teacher dashboard:", error);

      Sentry.withScope((scope) => {
        scope.setTag("component", "Dashboard");
        scope.setTag("action", "renderTeacherDashboard");
        scope.setContext("teacherStats", statistics);
        Sentry.captureException(error);
      });

      return (
        <Alert className="border-red-200 bg-red-50 mb-8">
          <FiAlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Unable to load teacher dashboard data. Please refresh the page.
          </AlertDescription>
        </Alert>
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <Skeleton className="h-6 sm:h-8 w-[150px] sm:w-[200px] mb-6" />
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-[80px] sm:h-[100px]" />
          ))}
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className="h-[300px] sm:h-[400px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <FiAlertCircle className="h-16 w-16 text-red-500" />
          <Alert className="max-w-md border-red-200 bg-red-50">
            <FiAlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <FiBell className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>

      <Card className="mb-8 hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                <AvatarImage
                  src={session?.user?.image || ""}
                  alt="User avatar"
                />
                <AvatarFallback className="text-base sm:text-lg bg-indigo-100 text-indigo-600">
                  {session?.user?.email?.[0].toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left min-w-0">
                <p className="text-lg sm:text-xl font-medium truncate max-w-[200px] sm:max-w-none">
                  {session?.user?.username || session?.user?.email || "User"}
                </p>
                <Badge
                  variant="secondary"
                  className="mt-1 truncate max-w-[200px] sm:max-w-none"
                >
                  {session?.user.role === "COLLEGE_SUPER_ADMIN"
                    ? "COLLEGE ADMIN"
                    : session?.user.role === "FINANCE_MANAGER"
                    ? "FINANCE MANAGER"
                    : session?.user.role === "SBTE_ADMIN"
                    ? "SBTE Administrator"
                    : session?.user.role === "EDUCATION_DEPARTMENT"
                    ? "EDUCATION DEPARTMENT"
                    : session?.user.role || "SBTE"}
                </Badge>
              </div>
            </div>
            <Button
              className="w-full sm:w-auto"
              onClick={() => router.push("/profile")}
            >
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {statistics && (session?.user as any)?.role !== "TEACHER" && (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {Object.entries(statistics).map(([key, value], index) => (
            <StatCard
              key={key}
              title={key
                .replace(/([A-Z])/g, " $1")
                .trim()
                .replace(/^\w/, (c) => c.toUpperCase())}
              value={value as number}
              icon={[FiUsers, FiBook, FiBarChart2, FiDatabase][index % 4]}
              color={["indigo", "cyan", "green", "red"][index % 4]}
            />
          ))}
        </div>
      )}

      {renderTeacherDashboard()}
      {renderCharts()}
    </div>
  );
};

export default Dashboard;
