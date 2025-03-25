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
import { toast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle, FolderX } from "lucide-react";
import SideBarLayout from "@/components/sidebar/layout";

// Interfaces for type safety
interface Batch {
  id: string;
  name: string;
}

interface BatchSubject {
  id: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  subjectType: {
    id: string;
    name: string;
  };
}

interface MonthlyAttendance {
  month: string;
  monthlyTotalTheoryClasses: number;
  monthlyTotalPracticalClasses: number;
  monthlyCompletedTheoryClasses: number;
  monthlyCompletedPracticalClasses: number;
  monthlyAttendedTheoryClasses: number;
  monthlyAttendedPracticalClasses: number;
}

interface AggregatedAttendance {
  totalTheoryClasses: number;
  totalPracticalClasses: number;
  completedTheoryClasses: number;
  completedPracticalClasses: number;
  attendedTheoryClasses: number;
  attendedPracticalClasses: number;
  theoryAttendancePercentage: string;
  practicalAttendancePercentage: string;
}

interface StudentAttendance {
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  batchName: string;
  batchId: string;
  subjectName: string;
  subjectCode: string;
  monthlyAttendance: MonthlyAttendance[];
  aggregatedAttendance: AggregatedAttendance;
}

export default function HODBatchSubjectAttendance() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchSubjects, setBatchSubjects] = useState<BatchSubject[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedBatchSubject, setSelectedBatchSubject] = useState<
    string | null
  >(null);
  const [studentAttendance, setStudentAttendance] = useState<
    StudentAttendance[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch batches
  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/batch");
      if (!response.ok) {
        throw new Error("Failed to fetch batches. Please try again.");
      }
      const data = await response.json();
      if (data.length === 0) {
        setError("No batches found. Please contact administrator.");
      }
      setBatches(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch batch subjects based on selected batch
  const fetchBatchSubjects = async (batchId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/batch/${batchId}/subject`);
      if (!response.ok) {
        throw new Error("Failed to fetch batch subjects. Please try again.");
      }
      const data = await response.json();
      if (data.length === 0) {
        setError(
          "No subjects found for this batch. Please contact administrator."
        );
      }
      setBatchSubjects(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch attendance for selected batch subject
  const fetchBatchSubjectAttendance = async () => {
    if (!selectedBatchSubject) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `/api/batchSubjectWiseAttendance?batchSubjectId=${selectedBatchSubject}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch attendance records. Please try again."
        );
      }

      const data = await response.json();

      // Handle case when no attendance records are found
      if (data.length === 0) {
        setError("No attendance records found for this subject.");
        setStudentAttendance([]);
        return;
      }

      setStudentAttendance(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle batch selection
  const handleBatchChange = (value: string) => {
    setSelectedBatch(value);
    fetchBatchSubjects(value);
    // Reset batch subject and attendance
    setSelectedBatchSubject(null);
    setStudentAttendance([]);
    setError(null);
  };

  // Handle batch subject selection
  const handleBatchSubjectChange = (value: string) => {
    setSelectedBatchSubject(value);
    fetchBatchSubjectAttendance();
    setError(null);
  };

  // Initial data fetching
  useEffect(() => {
    fetchBatches();
  }, []);

  // Render monthly attendance details
  const renderMonthlyAttendance = (monthlyAttendance: MonthlyAttendance[]) => {
    return (
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Month</TableHead>
            <TableHead className="text-center">Total Theory</TableHead>
            <TableHead className="text-center">Attended Theory</TableHead>
            <TableHead className="text-center">Total Practical</TableHead>
            <TableHead className="text-center">Attended Practical</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monthlyAttendance.map((monthly, index) => (
            <TableRow key={index}>
              <TableCell>{monthly.month}</TableCell>
              <TableCell className="text-center">
                {monthly.monthlyTotalTheoryClasses}
              </TableCell>
              <TableCell className="text-center">
                {monthly.monthlyAttendedTheoryClasses}
              </TableCell>
              <TableCell className="text-center">
                {monthly.monthlyTotalPracticalClasses}
              </TableCell>
              <TableCell className="text-center">
                {monthly.monthlyAttendedPracticalClasses}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // Render student attendance table
  const renderStudentAttendanceTable = () => {
    return (
      <div className="space-y-6">
        {studentAttendance.map((student) => (
          <Card key={student.studentId} className="w-full">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                {student.studentName} ({student.enrollmentNo})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-sm sm:text-base">
                    Batch: {student.batchName}
                  </p>
                  <p className="text-sm sm:text-base">
                    Subject: {student.subjectName} ({student.subjectCode})
                  </p>
                </div>

                <div className=" p-3 sm:p-4 rounded-lg border flex-1">
                  <h4 className="text-base sm:text-lg font-semibold mb-3">
                    Aggregated Attendance
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                    {/* Theory Classes Section */}
                    <div className="col-span-2 grid grid-cols-2 gap-2 border-b pb-2">
                      <div className="flex flex-col">
                        <p className=" ">Total Theory</p>
                        <p className="font-medium">
                          {student.aggregatedAttendance.totalTheoryClasses}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className=" ">Attended Theory</p>
                        <p className="font-medium">
                          {student.aggregatedAttendance.attendedTheoryClasses}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className=" ">Theory Attendance</p>
                        <Badge
                          className="w-fit"
                          variant={
                            student.aggregatedAttendance
                              .theoryAttendancePercentage !== "N/A" &&
                            parseFloat(
                              student.aggregatedAttendance
                                .theoryAttendancePercentage
                            ) >= 75
                              ? "default"
                              : "destructive"
                          }
                        >
                          {
                            student.aggregatedAttendance
                              .theoryAttendancePercentage
                          }
                          %
                        </Badge>
                      </div>
                      <div className="flex flex-col">
                        <p className=" ">Completed Theory</p>
                        <p className="font-medium">
                          {student.aggregatedAttendance.completedTheoryClasses}
                        </p>
                      </div>
                    </div>

                    {/* Practical Classes Section */}
                    <div className="col-span-2 grid grid-cols-2 gap-2 pt-2">
                      <div className="flex flex-col">
                        <p className=" ">Total Practical</p>
                        <p className="font-medium">
                          {student.aggregatedAttendance.totalPracticalClasses ||
                            "N/A"}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className=" ">Attended Practical</p>
                        <p className="font-medium">
                          {student.aggregatedAttendance
                            .attendedPracticalClasses || "N/A"}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className=" ">Practical Attendance</p>
                        <Badge variant="outline" className="w-fit">
                          {
                            student.aggregatedAttendance
                              .practicalAttendancePercentage
                          }
                        </Badge>
                      </div>
                      <div className="flex flex-col">
                        <p className=" ">Completed Practical</p>
                        <p className="font-medium">
                          {student.aggregatedAttendance
                            .completedPracticalClasses || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-semibold mb-2">
                  Monthly Attendance Details
                </h4>
                <div className="overflow-x-auto">
                  {renderMonthlyAttendance(student.monthlyAttendance)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <SideBarLayout>
      <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span>Batch Subject Attendance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Select
                onValueChange={handleBatchChange}
                value={selectedBatch || ""}
              >
                <SelectTrigger className="w-full">
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

              <Select
                onValueChange={handleBatchSubjectChange}
                value={selectedBatchSubject || ""}
                disabled={!selectedBatch}
              >
                <SelectTrigger className="w-full" disabled={!selectedBatch}>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {batchSubjects.map((subs) => (
                    <SelectItem key={subs.id} value={subs.id}>
                      {subs.subject.name} ({subs.subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-40 text-red-500">
                <AlertTriangle className="mr-2 h-6 w-6" />
                <p>{error}</p>
              </div>
            ) : (
              <div>
                {studentAttendance.length > 0 ? (
                  renderStudentAttendanceTable()
                ) : (
                  <div className="flex justify-center items-center h-40 text-gray-500">
                    <FolderX className="mr-2 h-8 w-8" />
                    <p>Select a batch and subject to view attendance</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
}
