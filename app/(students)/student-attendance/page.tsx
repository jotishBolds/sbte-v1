"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import SideBarLayout from "@/components/sidebar/layout";

// Types for Attendance
interface MonthlyAttendance {
  subjectName: string;
  subjectCode: string;
  month: string;
  monthlyTotalTheoryClasses: number;
  monthlyTotalPracticalClasses: number;
  monthlyCompletedTheoryClasses: number;
  monthlyCompletedPracticalClasses: number;
  monthlyAttendedTheoryClasses: number;
  monthlyAttendedPracticalClasses: number;
  batchName: string;
  batchId: string;
}

interface AggregatedAttendance {
  subjectName: string;
  subjectCode: string;
  batchName: string;
  batchId: string;
  totalTheoryClasses: number;
  totalPracticalClasses: number;
  completedTheoryClasses: number;
  completedPracticalClasses: number;
  attendedTheoryClasses: number;
  attendedPracticalClasses: number;
}

// Types for Batch and API Response
interface Batch {
  id: string;
  name: string;
}

interface AttendanceResponse {
  monthlyAttendance: MonthlyAttendance[];
  aggregatedAttendance: AggregatedAttendance[];
}

const BatchAttendance: React.FC = () => {
  const { data: session } = useSession();
  const [studentId, setStudentId] = React.useState<string | null>(null);
  const [batches, setBatches] = React.useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = React.useState<string | null>(null);
  const [monthlyAttendance, setMonthlyAttendance] = React.useState<
    MonthlyAttendance[]
  >([]);
  const [aggregatedAttendance, setAggregatedAttendance] = React.useState<
    AggregatedAttendance[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch student ID
  React.useEffect(() => {
    const fetchStudentId = async () => {
      try {
        const response = await fetch("/api/studentOperations/student");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch student information"
          );
        }
        const data = await response.json();
        setStudentId(data.id);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch student information"
        );
      }
    };

    if (session) {
      fetchStudentId();
    }
  }, [session]);

  // Fetch batches
  React.useEffect(() => {
    const fetchBatches = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/batch");
        if (!response.ok) throw new Error("Failed to fetch batches");
        const data = await response.json();
        setBatches(data);
      } catch (error) {
        setError("Failed to fetch batches");
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      fetchBatches();
    }
  }, [studentId]);

  // Fetch batch attendance
  const fetchBatchAttendance = async () => {
    if (!studentId || !selectedBatch) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/studentOperations/${studentId}/batchAttendance?batchId=${selectedBatch}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch batch attendance");
      }

      const data: AttendanceResponse = await response.json();
      setMonthlyAttendance(data.monthlyAttendance);
      setAggregatedAttendance(data.aggregatedAttendance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate attendance percentage
  const calculateAttendancePercentage = (
    attendedClasses: number,
    totalClasses: number
  ): number => {
    return totalClasses > 0
      ? Math.round((attendedClasses / totalClasses) * 100)
      : 0;
  };

  // Handle batch selection
  const handleBatchSelect = (batchId: string) => {
    setSelectedBatch(batchId);
  };

  // Render errors
  if (error === "Unauthorized" || error === "Forbidden") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don&apos;t have permission to view batch attendance. Please
          contact your administrator if you believe this is an error.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <SideBarLayout>
      <Card className="w-full">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
          <CardTitle className="text-2xl font-bold">Batch Attendance</CardTitle>
          <div className="flex items-center space-x-2 w-auto md:w-auto">
            <Select
              onValueChange={handleBatchSelect}
              value={selectedBatch || ""}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchBatchAttendance} disabled={!selectedBatch}>
              View Attendance
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : aggregatedAttendance.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg text-gray-500">
                {selectedBatch
                  ? "No attendance records found for this batch"
                  : "Select a batch to view attendance"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                Aggregated Attendance
              </h3>
              {aggregatedAttendance.map((attendance) => (
                <Card key={attendance.subjectCode} className="w-full">
                  <CardContent className="pt-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                      <div>
                        <h4 className="font-medium">
                          {attendance.subjectName} ({attendance.subjectCode})
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {attendance.batchName}
                        </p>
                      </div>
                      <Badge
                        variant={
                          calculateAttendancePercentage(
                            attendance.attendedTheoryClasses +
                              attendance.attendedPracticalClasses,
                            attendance.totalTheoryClasses +
                              attendance.totalPracticalClasses
                          ) >= 75
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {calculateAttendancePercentage(
                          attendance.attendedTheoryClasses +
                            attendance.attendedPracticalClasses,
                          attendance.totalTheoryClasses +
                            attendance.totalPracticalClasses
                        )}
                        %
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">
                          Theory Classes
                        </h5>
                        <Progress
                          value={calculateAttendancePercentage(
                            attendance.attendedTheoryClasses,
                            attendance.totalTheoryClasses
                          )}
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>
                            Attended: {attendance.attendedTheoryClasses}
                          </span>
                          <span>Total: {attendance.totalTheoryClasses}</span>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2">
                          Practical Classes
                        </h5>
                        <Progress
                          value={calculateAttendancePercentage(
                            attendance.attendedPracticalClasses,
                            attendance.totalPracticalClasses
                          )}
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>
                            Attended: {attendance.attendedPracticalClasses}
                          </span>
                          <span>Total: {attendance.totalPracticalClasses}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <h3 className="text-lg font-semibold mt-6 mb-4">
                Monthly Attendance Details
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Theory Classes</TableHead>
                      <TableHead>Practical Classes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyAttendance.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {record.subjectName} ({record.subjectCode})
                        </TableCell>
                        <TableCell>{record.month}</TableCell>
                        <TableCell>
                          {record.monthlyAttendedTheoryClasses} /{" "}
                          {record.monthlyTotalTheoryClasses}
                        </TableCell>
                        <TableCell>
                          {record.monthlyAttendedPracticalClasses} /{" "}
                          {record.monthlyTotalPracticalClasses}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </SideBarLayout>
  );
};

export default BatchAttendance;
