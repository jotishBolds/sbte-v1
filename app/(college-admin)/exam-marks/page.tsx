"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import SideBarLayout from "@/components/sidebar/layout";

interface Batch {
  id: string;
  name: string;
}

interface BatchSubject {
  id: string;
  subjectId: string;
  subject: {
    name: string;
  };
}

interface ExamType {
  id: string;
  examName: string;
  totalMarks: number;
  passingMarks?: number;
  // Add other fields as needed
}

interface Student {
  id: string;
  name: string;
  enrollmentNo: string;
}

interface ExamMark {
  id?: string;
  examTypeId: string;
  studentId: string;
  batchSubjectId: string;
  achievedMarks: number;
  wasAbsent: boolean;
  debarred: boolean;
  malpractice: boolean;
  student?: Student;
  examType?: ExamType;
}

export default function ExamMarksDashboard() {
  // State management
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchSubjects, setBatchSubjects] = useState<BatchSubject[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [examMarks, setExamMarks] = useState<ExamMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExamMark, setSelectedExamMark] = useState<ExamMark | null>(
    null
  );
  const { toast } = useToast();
  const [formData, setFormData] = useState<ExamMark>({
    examTypeId: "",
    studentId: "",
    batchSubjectId: "",
    achievedMarks: 0,
    wasAbsent: false,
    debarred: false,
    malpractice: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Fetch function
  const fetchData = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch: ${error}`);
    }
  };

  // Initial batches fetch
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const batchesData = await fetchData("/api/batch");
        setBatches(Array.isArray(batchesData) ? batchesData : []);
      } catch (err) {
        setError("Failed to load batches");
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  // Fetch subjects when batch changes
  useEffect(() => {
    if (selectedBatch) {
      const fetchBatchSubjects = async () => {
        try {
          setLoading(true);
          const subjectsData = await fetchData(
            `/api/batch/${selectedBatch}/subject`
          );
          setBatchSubjects(subjectsData);
          setSelectedSubject(""); // Reset subject selection
          setExamMarks([]); // Clear existing marks
        } catch (err) {
          setError("Failed to load subjects");
        } finally {
          setLoading(false);
        }
      };

      fetchBatchSubjects();
    }
  }, [selectedBatch]);

  // Fetch exam marks and other data when subject is selected
  useEffect(() => {
    if (selectedBatch && selectedSubject) {
      const fetchSubjectData = async () => {
        try {
          setLoading(true);
          const [studentsData, examTypesData, marksData] = await Promise.all([
            fetchData(`/api/student`),
            fetchData("/api/examType"),
            fetchData(`/api/examMarks?batchSubjectId=${selectedSubject}`),
          ]);
          setStudents(studentsData);
          setExamTypes(examTypesData);
          // Ensure marksData is treated as an array
          setExamMarks(Array.isArray(marksData) ? marksData : []);
        } catch (err) {
          setError("Failed to load subject data");
          setExamMarks([]); // Reset to empty array on error
        } finally {
          setLoading(false);
        }
      };

      fetchSubjectData();
    }
  }, [selectedBatch, selectedSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const submitData = {
      ...formData,
      batchSubjectId: selectedSubject,
      achievedMarks: Number(formData.achievedMarks),
    };

    try {
      const url = selectedExamMark
        ? `/api/examMarks/${selectedExamMark.id}`
        : "/api/examMarks";
      const method = selectedExamMark ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      // Success notification
      toast({
        title: "Success",
        description: selectedExamMark
          ? "Exam mark updated successfully"
          : "Exam mark added successfully",
        variant: "default",
      });

      // Refresh exam marks
      const updatedMarks = await fetchData(
        `/api/examMarks?batchSubjectId=${selectedSubject}`
      );
      setExamMarks(Array.isArray(updatedMarks) ? updatedMarks : []);
      setIsDialogOpen(false);
      resetForm();
    } catch (err: any) {
      const errorMessage = err.message;

      // Show error toast based on error type
      if (errorMessage.includes("already exists")) {
        toast({
          title: "Error",
          description:
            "An exam mark already exists for this student and exam type",
          variant: "destructive",
        });
      } else if (errorMessage.includes("exceed")) {
        toast({
          title: "Error",
          description: "Achieved marks cannot exceed total marks for this exam",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage || "Failed to submit exam mark",
          variant: "destructive",
        });
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Modified delete handler with toast notifications
  const handleDelete = async (markId: string) => {
    if (!confirm("Are you sure you want to delete this exam mark?")) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/examMarks/${markId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete exam mark");
      }

      toast({
        title: "Success",
        description: "Exam mark deleted successfully",
        variant: "default",
      });

      const updatedMarks = await fetchData(
        `/api/examMarks?batchSubjectId=${selectedSubject}`
      );
      setExamMarks(Array.isArray(updatedMarks) ? updatedMarks : []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete exam mark",
        variant: "destructive",
      });
      setError("Failed to delete exam mark");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      examTypeId: "",
      studentId: "",
      batchSubjectId: selectedSubject,
      achievedMarks: 0,
      wasAbsent: false,
      debarred: false,
      malpractice: false,
    });
    setSelectedExamMark(null);
  };
  const examMarksArray = Array.isArray(examMarks) ? examMarks : [];
  const totalPages = Math.ceil(examMarksArray.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExamMarks = examMarksArray.slice(startIndex, endIndex);

  // Pagination controls
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBatch, selectedSubject]);
  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Exam Marks Management</CardTitle>
            <CardDescription>
              Select batch and subject to manage exam marks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selection Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-full sm:w-[200px] ">
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
                value={selectedSubject}
                onValueChange={setSelectedSubject}
                disabled={!selectedBatch}
              >
                <SelectTrigger className="w-full sm:w-[200px] ">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {batchSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Main Content Area */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading...
              </div>
            ) : !selectedBatch ? (
              <Alert>
                <AlertTitle>Getting Started</AlertTitle>
                <AlertDescription>
                  Please select a batch to view available subjects
                </AlertDescription>
              </Alert>
            ) : !selectedSubject ? (
              <Alert>
                <AlertTitle>Select Subject</AlertTitle>
                <AlertDescription>
                  Please select a subject to view or manage exam marks
                </AlertDescription>
              </Alert>
            ) : students.length === 0 ? (
              <Alert>
                <AlertTitle>No Students Found</AlertTitle>
                <AlertDescription>
                  No students are assigned to this batch.
                  <Button
                    className="ml-4"
                    onClick={() => {
                      /* Handle student creation */
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Students
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="flex justify-end">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Exam Mark
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>
                          {selectedExamMark ? "Edit" : "Add"} Exam Mark
                        </DialogTitle>
                        <DialogDescription>
                          Enter the exam mark details below
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="student">Student</Label>
                          <Select
                            value={formData.studentId}
                            onValueChange={(value) =>
                              setFormData({ ...formData, studentId: value })
                            }
                          >
                            <SelectTrigger id="student" className="">
                              <SelectValue placeholder="Select Student" />
                            </SelectTrigger>
                            <SelectContent>
                              {students.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.name} ({student.enrollmentNo})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="examType">Exam Type</Label>
                          <Select
                            value={formData.examTypeId}
                            onValueChange={(value) =>
                              setFormData({ ...formData, examTypeId: value })
                            }
                          >
                            <SelectTrigger id="examType" className="">
                              <SelectValue placeholder="Select Exam Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {examTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.examName} {/* Changed from type.name */}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="marks">Achieved Marks</Label>
                          <Input
                            id="marks"
                            type="number"
                            min="0"
                            value={formData.achievedMarks}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                achievedMarks: Number(e.target.value) || 0,
                              })
                            }
                            className=""
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="absent"
                              checked={formData.wasAbsent}
                              onCheckedChange={(checked) =>
                                setFormData({
                                  ...formData,
                                  wasAbsent: checked as boolean,
                                  achievedMarks: checked
                                    ? 0
                                    : formData.achievedMarks,
                                })
                              }
                            />
                            <Label htmlFor="absent">Absent</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="debarred"
                              checked={formData.debarred}
                              onCheckedChange={(checked) =>
                                setFormData({
                                  ...formData,
                                  debarred: checked as boolean,
                                })
                              }
                            />
                            <Label htmlFor="debarred">Debarred</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="malpractice"
                              checked={formData.malpractice}
                              onCheckedChange={(checked) =>
                                setFormData({
                                  ...formData,
                                  malpractice: checked as boolean,
                                })
                              }
                            />
                            <Label htmlFor="malpractice">Malpractice</Label>
                          </div>
                        </div>

                        {error && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="flex justify-end gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={loading}>
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save"
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Exam Type</TableHead>
                      <TableHead className="text-right">Marks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(currentExamMarks) &&
                    currentExamMarks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No exam marks found for this subject. Click &quot;Add
                          Exam Mark&quot; to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      Array.isArray(currentExamMarks) &&
                      currentExamMarks.map((mark) => (
                        <TableRow key={mark.id}>
                          <TableCell className="font-medium">
                            {mark.student?.name}
                            <div className="text-sm text-muted-foreground">
                              Enrolment No: {mark.student?.enrollmentNo}
                            </div>
                          </TableCell>
                          <TableCell>{mark.examType?.examName}</TableCell>
                          <TableCell className="text-right">
                            {mark.wasAbsent ? (
                              <span className="text-destructive">Absent</span>
                            ) : (
                              mark.achievedMarks
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {mark.debarred && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                                  Debarred
                                </span>
                              )}
                              {mark.malpractice && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Malpractice
                                </span>
                              )}
                              {!mark.debarred &&
                                !mark.malpractice &&
                                !mark.wasAbsent && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Regular
                                  </span>
                                )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedExamMark(mark);
                                  setFormData({
                                    ...mark,
                                    batchSubjectId: selectedSubject,
                                  });
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={async () => {
                                  if (
                                    !confirm(
                                      "Are you sure you want to delete this exam mark?"
                                    )
                                  )
                                    return;
                                  try {
                                    setLoading(true);
                                    await fetch(`/api/examMarks/${mark.id}`, {
                                      method: "DELETE",
                                    });
                                    const updatedMarks = await fetchData(
                                      `/api/examMarks?batchSubjectId=${selectedSubject}`
                                    );
                                    setExamMarks(updatedMarks);
                                  } catch (err) {
                                    setError("Failed to delete exam mark");
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {examMarksArray.length > 0 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, examMarksArray.length)} of{" "}
                      {examMarksArray.length} entries
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="text-sm">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </SideBarLayout>
  );
}
