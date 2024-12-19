import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Skeleton for Stat Cards
export const StatCardSkeleton: React.FC = () => (
  <Card className="w-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-6 w-3/4" />
    </CardContent>
  </Card>
);

// Skeleton for Form Fields
export const FormFieldSkeleton: React.FC = () => (
  <div className="grid gap-2">
    <Skeleton className="h-4 w-1/3 mb-2" />
    <Skeleton className="h-10 w-full" />
  </div>
);

// Skeleton for Departments Table
export const DepartmentTableSkeleton: React.FC = () => (
  <Card className="w-full overflow-x-auto">
    <CardHeader>
      <Skeleton className="h-6 w-1/4" />
    </CardHeader>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3].map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-4 w-3/4" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-1/2" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

// Main Loading Skeleton for College Dashboard
export const CollegeDashboardSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">
    {/* Header Skeleton */}
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-10 w-1/6" />
    </div>

    {/* Stat Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {[1, 2, 3, 4].map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>

    {/* Tabs Skeleton */}
    <div className="flex gap-2 md:space-x-4">
      <Skeleton className="h-10 w-1/4" />
      <Skeleton className="h-10 w-1/4" />
    </div>

    {/* Details Card Skeleton */}
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <FormFieldSkeleton key={index} />
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Departments Table Skeleton */}
    <DepartmentTableSkeleton />
  </div>
);

export default CollegeDashboardSkeleton;
