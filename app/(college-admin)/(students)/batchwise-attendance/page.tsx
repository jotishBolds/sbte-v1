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
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import SideBarLayout from "@/components/sidebar/layout";

interface Batch {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
}

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
}

interface AggregatedAttendance {
  subjectName: string;
  subjectCode: string;
  batchName: string;
  totalTheoryClasses: number;
  totalPracticalClasses: number;
  completedTheoryClasses: number;
  completedPracticalClasses: number;
  attendedTheoryClasses: number;
  attendedPracticalClasses: number;
}

export default function StudentBatchAttendance() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [monthlyAttendance, setMonthlyAttendance] = useState<
    MonthlyAttendance[]
  >([]);
  const [aggregatedAttendance, setAggregatedAttendance] = useState<
    AggregatedAttendance[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch batches
  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/batch");
      if (!response.ok) throw new Error("Failed to fetch batches");
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch batches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/student");
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch attendance
  const fetchAttendance = async () => {
    if (!selectedStudent || !selectedBatch) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/studentOperations/${selectedStudent}/batchAttendance?batchId=${selectedBatch}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance");
      }

      const data = await response.json();
      setMonthlyAttendance(data.monthlyAttendance);
      setAggregatedAttendance(data.aggregatedAttendance);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetching
  useEffect(() => {
    fetchBatches();
    fetchStudents();
  }, []);

  // Fetch attendance when student and batch are selected
  useEffect(() => {
    if (selectedStudent && selectedBatch) {
      fetchAttendance();
    }
  }, [selectedStudent, selectedBatch]);

  return (
    <SideBarLayout>
      <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Student Batch Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Select
                onValueChange={(value) => setSelectedBatch(value)}
                value={selectedBatch || ""}
              >
                <SelectTrigger>
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
                onValueChange={(value) => setSelectedStudent(value)}
                value={selectedStudent || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <>
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Monthly Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                        {monthlyAttendance.map((attendance, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {attendance.subjectName} ({attendance.subjectCode}
                              )
                            </TableCell>
                            <TableCell>{attendance.month}</TableCell>
                            <TableCell>
                              {attendance.monthlyAttendedTheoryClasses} /{" "}
                              {attendance.monthlyTotalTheoryClasses}
                            </TableCell>
                            <TableCell>
                              {attendance.monthlyAttendedPracticalClasses} /{" "}
                              {attendance.monthlyTotalPracticalClasses}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Aggregated Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Theory Attendance</TableHead>
                          <TableHead>Practical Attendance</TableHead>
                          <TableHead>Total Attendance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aggregatedAttendance.map((attendance, index) => {
                          const theoryAttendancePercentage =
                            attendance.completedTheoryClasses > 0
                              ? (
                                  (attendance.attendedTheoryClasses /
                                    attendance.completedTheoryClasses) *
                                  100
                                ).toFixed(2)
                              : 0;
                          const practicalAttendancePercentage =
                            attendance.completedPracticalClasses > 0
                              ? (
                                  (attendance.attendedPracticalClasses /
                                    attendance.completedPracticalClasses) *
                                  100
                                ).toFixed(2)
                              : 0;
                          const totalAttendancePercentage =
                            attendance.completedTheoryClasses +
                              attendance.completedPracticalClasses >
                            0
                              ? (
                                  ((attendance.attendedTheoryClasses +
                                    attendance.attendedPracticalClasses) /
                                    (attendance.completedTheoryClasses +
                                      attendance.completedPracticalClasses)) *
                                  100
                                ).toFixed(2)
                              : 0;

                          return (
                            <TableRow key={index}>
                              <TableCell>
                                {attendance.subjectName} (
                                {attendance.subjectCode})
                              </TableCell>
                              <TableCell>
                                {attendance.attendedTheoryClasses} /{" "}
                                {attendance.completedTheoryClasses}(
                                {theoryAttendancePercentage}%)
                              </TableCell>
                              <TableCell>
                                {attendance.attendedPracticalClasses} /{" "}
                                {attendance.completedPracticalClasses}(
                                {practicalAttendancePercentage}%)
                              </TableCell>
                              <TableCell>
                                {attendance.attendedTheoryClasses +
                                  attendance.attendedPracticalClasses}{" "}
                                /
                                {attendance.completedTheoryClasses +
                                  attendance.completedPracticalClasses}
                                ({totalAttendancePercentage}%)
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
}
