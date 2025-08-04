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

interface ExamMark {
  examMarkId: string;
  subjectName: string;
  subjectCode: string;
  examType: string;
  totalMarks: number;
  passingMarks: number;
  achievedMarks: number;
  wasAbsent: boolean;
  debarred: boolean;
  malpractice: boolean;
}

export default function StudentBatchMarks() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [examMarks, setExamMarks] = useState<ExamMark[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch batches
  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/batch");
      if (!response.ok) throw new Error("Failed to fetch batches");
      const data = await response.json();
      setBatches(Array.isArray(data) ? data : []);
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
      setStudents(Array.isArray(data) ? data : []);
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

  // Fetch exam marks
  const fetchExamMarks = async () => {
    if (!selectedStudent || !selectedBatch) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/studentOperations/${selectedStudent}/batchMarks?batchId=${selectedBatch}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exam marks");
      }

      const data = await response.json();
      setExamMarks(data.examMarks);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch exam marks",
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

  // Fetch exam marks when student and batch are selected
  useEffect(() => {
    if (selectedStudent && selectedBatch) {
      fetchExamMarks();
    }
  }, [selectedStudent, selectedBatch]);

  return (
    <SideBarLayout>
      <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Student Batch Marks</CardTitle>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Passing Marks</TableHead>
                    <TableHead>Achieved Marks</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examMarks.map((mark) => (
                    <TableRow key={mark.examMarkId}>
                      <TableCell>
                        {mark.subjectName} ({mark.subjectCode})
                      </TableCell>
                      <TableCell>{mark.examType}</TableCell>
                      <TableCell>{mark.totalMarks}</TableCell>
                      <TableCell>{mark.passingMarks}</TableCell>
                      <TableCell>{mark.achievedMarks}</TableCell>
                      <TableCell>
                        {mark.wasAbsent
                          ? "Absent"
                          : mark.debarred
                          ? "Debarred"
                          : mark.malpractice
                          ? "Malpractice"
                          : mark.achievedMarks >= mark.passingMarks
                          ? "Pass"
                          : "Fail"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
}
