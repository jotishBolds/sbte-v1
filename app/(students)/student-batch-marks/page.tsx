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
import SideBarLayout from "@/components/sidebar/layout";

// Types for Batch Marks
interface BatchMark {
  examMarkId: string;
  subjectName: string;
  subjectCode: string;
  examType: string;
  totalMarks: number;
  passingMarks: number;
  batchId: string;
  batchName: string;
  achievedMarks: number;
  wasAbsent: boolean;
  debarred: boolean;
  malpractice: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Types for Batch and API Response
interface Batch {
  id: string;
  name: string;
}

const BatchMarks: React.FC = () => {
  const { data: session } = useSession();
  const [studentId, setStudentId] = React.useState<string | null>(null);
  const [batches, setBatches] = React.useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = React.useState<string | null>(null);
  const [batchMarks, setBatchMarks] = React.useState<BatchMark[]>([]);
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

  // Fetch batch marks
  const fetchBatchMarks = async () => {
    if (!studentId || !selectedBatch) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/studentOperations/${studentId}/batchMarks?batchId=${selectedBatch}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch batch marks");
      }

      const data = await response.json();
      setBatchMarks(data.examMarks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
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
          You don&apos;t have permission to view batch marks. Please contact
          your administrator if you believe this is an error.
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
          <CardTitle className="text-2xl font-bold">Batch Marks</CardTitle>
          <div className="flex items-center space-x-2 w-full md:w-auto">
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
            <Button onClick={fetchBatchMarks} disabled={!selectedBatch}>
              View Marks
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
          ) : batchMarks.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg text-gray-500">
                {selectedBatch
                  ? "No marks found for this batch"
                  : "Select a batch to view marks"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Subject</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Achieved Marks</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchMarks.map((mark) => (
                    <TableRow
                      key={mark.examMarkId}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        {mark.subjectName} ({mark.subjectCode})
                      </TableCell>
                      <TableCell>{mark.examType}</TableCell>
                      <TableCell>{mark.totalMarks}</TableCell>
                      <TableCell>
                        {mark.wasAbsent ? "Absent" : mark.achievedMarks}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            mark.wasAbsent || mark.debarred || mark.malpractice
                              ? "destructive"
                              : mark.achievedMarks >= mark.passingMarks
                              ? "outline"
                              : "default"
                          }
                        >
                          {mark.wasAbsent
                            ? "Absent"
                            : mark.debarred
                            ? "Debarred"
                            : mark.malpractice
                            ? "Malpractice"
                            : mark.achievedMarks >= mark.passingMarks
                            ? "Pass"
                            : "Fail"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </SideBarLayout>
  );
};

export default BatchMarks;
