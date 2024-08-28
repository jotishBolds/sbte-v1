// app/colleges/[id]/departments/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import SideBarLayout from "@/components/sidebar/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw } from "lucide-react";

interface Department {
  id: string;
  name: string;
  isActive: boolean;
  headOfDepartment: {
    name: string;
  } | null;
}

const CollegeDepartmentsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collegeId = window.location.pathname.split("/")[2];
    fetchData(collegeId);
  }, []);

  const fetchData = async (collegeId: string) => {
    setLoading(true);
    try {
      await fetchDepartments(collegeId);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async (collegeId: string) => {
    const response = await fetch(`/api/colleges/${collegeId}/departments`);
    if (!response.ok) throw new Error("Failed to fetch departments");
    const data = await response.json();
    setDepartments(data);
  };

  const renderSkeleton = () => (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <Skeleton className="h-9 w-40 mb-4 sm:mb-0" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">
                <Skeleton className="h-5 w-20" />
              </TableHead>
              <TableHead className="w-[20%]">
                <Skeleton className="h-5 w-16" />
              </TableHead>
              <TableHead className="w-[40%]">
                <Skeleton className="h-5 w-32" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-5 w-36" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-28" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );

  if (status === "loading") {
    return <SideBarLayout>{renderSkeleton()}</SideBarLayout>;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <SideBarLayout>
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">Departments</h1>
          <Button
            onClick={() => fetchData(window.location.pathname.split("/")[2])}
            variant="outline"
            size="sm"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        {loading ? (
          renderSkeleton()
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead className="w-[20%]">Status</TableHead>
                  <TableHead className="w-[40%]">Head of Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">
                      {department.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          department.isActive ? "default" : "destructive"
                        }
                      >
                        {department.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {department.headOfDepartment?.name || "Not assigned"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </SideBarLayout>
  );
};

export default CollegeDepartmentsPage;
