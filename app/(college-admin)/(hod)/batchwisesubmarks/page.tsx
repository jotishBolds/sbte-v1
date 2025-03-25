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
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FolderX,
} from "lucide-react";
import SideBarLayout from "@/components/sidebar/layout";

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

interface ExamMarkEntry {
  examMarkId: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  totalMarks: string;
  passingMarks: string;
  achievedMarks: string;
  wasAbsent: boolean;
  debarred: boolean;
  malpractice: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExamMarks {
  [examType: string]: ExamMarkEntry[];
}

export default function HODBatchSubjectMarks() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchSubjects, setBatchSubjects] = useState<BatchSubject[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedBatchSubject, setSelectedBatchSubject] = useState<
    string | null
  >(null);
  const [examMarks, setExamMarks] = useState<ExamMarks>({});
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
      console.log("sub ", data);
      if (data.length === 0) {
        setError(
          "No subjects found for this batch. Please contact administrator."
        );
      }
      setBatchSubjects(data);
      console.log("data", data);
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

  // Fetch exam marks for selected batch subject
  const fetchBatchSubjectMarks = async () => {
    if (!selectedBatchSubject) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `/api/batchSubjectWiseMarks?batchSubjectId=${selectedBatchSubject}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exam marks. Please try again.");
      }

      const data = await response.json();

      // Handle case when no marks are added
      if (Object.keys(data.examMarks).length === 0) {
        setError("No marks have been added for this subject yet.");
        setExamMarks({});
        return;
      }

      setExamMarks(data.examMarks);
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
    // Reset batch subject and exam marks
    setSelectedBatchSubject(null);
    setExamMarks({});
    setError(null);
  };

  // Handle batch subject selection
  const handleBatchSubjectChange = (value: string) => {
    setSelectedBatchSubject(value);
    fetchBatchSubjectMarks();
    setError(null);
  };

  // Initial data fetching
  useEffect(() => {
    fetchBatches();
  }, []);

  // Determine status badge
  const getStatusBadge = (mark: ExamMarkEntry) => {
    if (mark.wasAbsent) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          <AlertTriangle className="mr-1 h-4 w-4" /> Absent
        </Badge>
      );
    }
    if (mark.debarred) {
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-4 w-4" /> Debarred
        </Badge>
      );
    }
    if (mark.malpractice) {
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-4 w-4" /> Malpractice
        </Badge>
      );
    }

    const isPassing =
      parseInt(mark.achievedMarks) >= parseInt(mark.passingMarks);
    return isPassing ? (
      <Badge variant="outline" className="bg-green-100 text-green-800">
        <CheckCircle2 className="mr-1 h-4 w-4" /> Pass
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="mr-1 h-4 w-4" /> Fail
      </Badge>
    );
  };

  // Render exam marks table
  const renderExamMarksTable = (examType: string, marks: ExamMarkEntry[]) => {
    return (
      <div key={examType} className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{examType} Marks</h3>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] md:w-auto">
                  Enrollment No
                </TableHead>
                <TableHead className="w-[150px] md:w-auto">
                  Student Name
                </TableHead>
                <TableHead className="text-center">Total Marks</TableHead>
                <TableHead className="text-center">Passing Marks</TableHead>
                <TableHead className="text-center">Achieved Marks</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marks.map((mark) => (
                <TableRow key={mark.examMarkId}>
                  <TableCell className="font-medium">
                    {mark.enrollmentNo}
                  </TableCell>
                  <TableCell>{mark.studentName}</TableCell>
                  <TableCell className="text-center">
                    {mark.totalMarks}
                  </TableCell>
                  <TableCell className="text-center">
                    {mark.passingMarks}
                  </TableCell>
                  <TableCell className="text-center">
                    {mark.achievedMarks}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(mark)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <SideBarLayout>
      <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span>Batch Subject Marks</span>
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
                {Object.entries(examMarks).length > 0 ? (
                  Object.entries(examMarks).map(([examType, marks]) =>
                    renderExamMarksTable(examType, marks)
                  )
                ) : selectedBatchSubject ? (
                  <div className="flex justify-center items-center h-40 text-gray-500">
                    <FolderX className="mr-2 h-8 w-8" />
                    <p>No marks have been added for this subject yet.</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Select a batch and subject to view marks
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
