"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
import {
  FiUsers,
  FiBook,
  FiBarChart2,
  FiDatabase,
  FiBell,
  FiSettings,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconType } from "react-icons";
import { useRouter } from "next/navigation";

const COLORS = [
  "#2A9D8F", // Teal green
  "#E76F51", // Persimmon
  "#264653", // Dark slate blue
  "#F4A261", // Sandy brown
  "#9B5DE5", // Medium purple
  "#00B4D8", // Bright sky blue
];

interface Statistics {
  [key: string]: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: IconType;
  color: string;
}

interface ChartDataItem {
  name: string;
  value: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
}) => (
  <Card className="hover:shadow-md transition-shadow duration-300">
    <CardContent className="flex items-center p-6">
      <div className={`mr-4 rounded-full p-3 bg-${color}-100`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      </div>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const { data: session } = useSession();
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  console.log(session);
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        if (session?.user.role == "TEACHER") {
          const response = await fetch(`/api/statistics/${session?.user.id}`);
          if (!response.ok) throw new Error("Failed to fetch statistics");
          const data = await response.json();
          setStatistics(data);
        } else {
          console.log("Entered here");
          const response = await fetch(`/api/statistics`);
          if (!response.ok) throw new Error("Failed to fetch statistics");
          const data = await response.json();
          setStatistics(data);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const renderCharts = () => {
    if (!statistics) return null;

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
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700">
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
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#6B7280" }} />
                    <Bar dataKey="value" fill="#4338ca" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700">
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#6B7280" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">
                Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <Tooltip
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
  };

  const renderTeacherDashboard = () => {
    if (!statistics || (session?.user as any)?.role !== "TEACHER") return null;

    return (
      <>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
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
              <CardTitle>Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {statistics.subjects.map((subject: any) => (
                  <li
                    key={subject.id}
                    className="flex justify-between items-center"
                  >
                    <span>
                      {subject.name} ({subject.code})
                    </span>
                    <Badge>{subject.semester}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-8 w-[200px] mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-[100px]" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className="h-[400px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">
          Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <Input className="max-w-sm" placeholder="Search..." />
          <Button variant="ghost" size="icon">
            <FiBell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <FiSettings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Card className="mb-8 hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={session?.user?.image || ""}
                  alt="User avatar"
                />
                <AvatarFallback className="text-lg bg-indigo-100 text-indigo-600">
                  {session?.user?.email?.[0].toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-medium text-gray-800">
                  {session?.user?.name || session?.user?.email || "User"}
                </p>
                <Badge variant="secondary" className="mt-1">
                  {(session?.user as any)?.role || "Unknown role"}
                </Badge>
              </div>
            </div>
            <Button onClick={() => router.push("/profile")}>
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {statistics && (session?.user as any)?.role !== "TEACHER" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
