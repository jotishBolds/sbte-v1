"use client";
import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Building2, Users2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SideBarLayout from "@/components/sidebar/layout";
import { useRouter } from "next/navigation";

interface College {
  id: string;
  name: string;
  abbreviation?: string;
}

interface Department {
  id: string;
  name: string;
  isActive: boolean;
  headOfDepartment: string | null;
}

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

const DepartmentDashboard: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await fetch("/api/colleges");
      const result = await response.json();
      const collegesList = Array.isArray(result) ? result : result.data || [];
      setColleges(collegesList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching colleges:", error);
      setError("Failed to load colleges");
      setLoading(false);
    }
  };

  const fetchDepartments = async (collegeId: string) => {
    try {
      const response = await fetch(
        `/api/educationDepartment/department?collegeId=${collegeId}`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setDepartments(data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError("Failed to load departments");
    }
  };

  const handleCollegeChange = async (collegeId: string) => {
    setSelectedCollege(collegeId);
    setLoading(true);
    setError(null);
    try {
      await fetchDepartments(collegeId);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    const activeCount = departments.filter((dept) => dept.isActive).length;
    const inactiveCount = departments.length - activeCount;
    return [
      { name: "Active Departments", value: activeCount },
      { name: "Inactive Departments", value: inactiveCount },
    ];
  };

  if (loading && !selectedCollege) {
    return <div className="container mx-auto p-6">Loading colleges...</div>;
  }

  if (error && !selectedCollege) {
    return <div className="container mx-auto p-6 text-red-500">{error}</div>;
  }

  return (
    <SideBarLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="w-full max-w-md">
          <Select onValueChange={handleCollegeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a college" />
            </SelectTrigger>
            <SelectContent>
              {colleges.length > 0 ? (
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

        {loading && selectedCollege && <div>Loading department data...</div>}
        {error && selectedCollege && (
          <div className="text-red-500">{error}</div>
        )}

        {selectedCollege && departments && !loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatsCard
                title="Total Departments"
                value={departments.length}
                icon={<Building2 className="w-4 h-4" />}
              />
              <StatsCard
                title="Active Departments"
                value={departments.filter((dept) => dept.isActive).length}
                icon={<Users2 className="w-4 h-4" />}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Department Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareChartData()}>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Departments List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department Name</TableHead>
                        <TableHead>Head of Department</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.length > 0 ? (
                        departments.map((department) => (
                          <TableRow
                            key={department.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() =>
                              router.push(
                                `/college-stats/departments-stats/${department.id}`
                              )
                            }
                          >
                            <TableCell className="font-medium">
                              {department.name}
                            </TableCell>
                            <TableCell>
                              {department.headOfDepartment || "Not Assigned"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={
                                  department.isActive ? "default" : "secondary"
                                }
                              >
                                {department.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            No departments found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
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

export default DepartmentDashboard;
