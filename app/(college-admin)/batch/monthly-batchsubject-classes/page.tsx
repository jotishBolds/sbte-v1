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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import SideBarLayout from "@/components/sidebar/layout";

// Types
type Month =
  | "JANUARY"
  | "FEBRUARY"
  | "MARCH"
  | "APRIL"
  | "MAY"
  | "JUNE"
  | "JULY"
  | "AUGUST"
  | "SEPTEMBER"
  | "OCTOBER"
  | "NOVEMBER"
  | "DECEMBER";

interface Batch {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface BatchSubject {
  id: string;
  subject: Subject;
  subjectId: string;
}

interface MonthlyBatchSubjectClass {
  id: string;
  batchSubjectId: string;
  month: Month;
  totalTheoryClasses?: number;
  totalPracticalClasses?: number;
  completedTheoryClasses?: number;
  completedPracticalClasses?: number;
}

interface FormData {
  month: Month;
  totalTheoryClasses?: number;
  totalPracticalClasses?: number;
  completedTheoryClasses?: number;
  completedPracticalClasses?: number;
}

const MonthlyBatchClassesDashboard = () => {
  // State management
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchSubjects, setBatchSubjects] = useState<BatchSubject[]>([]);
  const [monthlyClasses, setMonthlyClasses] = useState<
    MonthlyBatchSubjectClass[]
  >([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<MonthlyBatchSubjectClass | null>(null);
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    month: "JANUARY",
    totalTheoryClasses: 0,
    totalPracticalClasses: 0,
    completedTheoryClasses: 0,
    completedPracticalClasses: 0,
  });

  const months: Month[] = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];

  // Fetch batches on component mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/batch");
        const data = await response.json();
        setBatches(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load batches");
        toast({
          title: "Error",
          description: "Failed to load batches",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [toast]);

  // Fetch subjects when batch changes
  useEffect(() => {
    if (selectedBatch) {
      const fetchBatchSubjects = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/batch/${selectedBatch}/subject`);
          const data = await response.json();
          setBatchSubjects(data);
          setSelectedSubject("");
          setMonthlyClasses([]);
        } catch (err) {
          setError("Failed to load subjects");
          toast({
            title: "Error",
            description: "Failed to load subjects",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchBatchSubjects();
    }
  }, [selectedBatch, toast]);

  // Fetch monthly classes when subject changes
  useEffect(() => {
    if (selectedSubject) {
      const fetchMonthlyClasses = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `/api/monthlyBatchSubjectClasses?batchSubjectId=${selectedSubject}`
          );
          const data = await response.json();
          setMonthlyClasses(Array.isArray(data) ? data : []);
        } catch (err) {
          setError("Failed to load monthly classes");
          toast({
            title: "Error",
            description: "Failed to load monthly classes",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchMonthlyClasses();
    }
  }, [selectedSubject, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const submitData = {
      ...formData,
      batchSubjectId: selectedSubject,
    };

    try {
      const url = selectedRecord
        ? `/api/monthlyBatchSubjectClasses/${selectedRecord.id}`
        : "/api/monthlyBatchSubjectClasses";
      const method = selectedRecord ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      toast({
        title: "Success",
        description: selectedRecord
          ? "Monthly classes updated successfully"
          : "Monthly classes added successfully",
      });

      // Refresh data
      const updatedClasses = await fetch(
        `/api/monthlyBatchSubjectClasses?batchSubjectId=${selectedSubject}`
      );
      const updatedData = await updatedClasses.json();
      setMonthlyClasses(Array.isArray(updatedData) ? updatedData : []);
      setIsDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit monthly classes",
        variant: "destructive",
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/monthlyBatchSubjectClasses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete record");
      }

      toast({
        title: "Success",
        description: "Record deleted successfully",
      });

      const updatedClasses = await fetch(
        `/api/monthlyBatchSubjectClasses?batchSubjectId=${selectedSubject}`
      );
      const updatedData = await updatedClasses.json();
      setMonthlyClasses(Array.isArray(updatedData) ? updatedData : []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      month: "JANUARY",
      totalTheoryClasses: 0,
      totalPracticalClasses: 0,
      completedTheoryClasses: 0,
      completedPracticalClasses: 0,
    });
    setSelectedRecord(null);
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Batch Classes Management</CardTitle>
            <CardDescription>
              Manage theory and practical classes for each subject by month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selection Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-full sm:w-[200px]">
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
                <SelectTrigger className="w-full sm:w-[200px]">
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

            {/* Main Content */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading...
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
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
                  Please select a subject to manage monthly classes
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="flex justify-end">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Monthly Classes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>
                          {selectedRecord ? "Edit" : "Add"} Monthly Classes
                        </DialogTitle>
                        <DialogDescription>
                          Enter the class details for the month
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="month">Month</Label>
                          <Select
                            value={formData.month}
                            onValueChange={(value: Month) =>
                              setFormData({ ...formData, month: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map((month) => (
                                <SelectItem key={month} value={month}>
                                  {month}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="totalTheory">
                              Total Theory Classes
                            </Label>
                            <Input
                              id="totalTheory"
                              type="number"
                              min="0"
                              value={formData.totalTheoryClasses}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  totalTheoryClasses:
                                    parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="completedTheory">
                              Completed Theory Classes
                            </Label>
                            <Input
                              id="completedTheory"
                              type="number"
                              min="0"
                              value={formData.completedTheoryClasses}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  completedTheoryClasses:
                                    parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="totalPractical">
                              Total Practical Classes
                            </Label>
                            <Input
                              id="totalPractical"
                              type="number"
                              min="0"
                              value={formData.totalPracticalClasses}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  totalPracticalClasses:
                                    parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="completedPractical">
                              Completed Practical Classes
                            </Label>
                            <Input
                              id="completedPractical"
                              type="number"
                              min="0"
                              value={formData.completedPracticalClasses}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  completedPracticalClasses:
                                    parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>

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
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saving...
                              </>
                            ) : (
                              <>{selectedRecord ? "Update" : "Save"}</>
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Data Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Theory Classes</TableHead>
                      <TableHead>Practical Classes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyClasses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      monthlyClasses.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.month}</TableCell>
                          <TableCell>
                            {record.completedTheoryClasses}/
                            {record.totalTheoryClasses}
                          </TableCell>
                          <TableCell>
                            {record.completedPracticalClasses}/
                            {record.totalPracticalClasses}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setFormData({
                                    month: record.month,
                                    totalTheoryClasses:
                                      record.totalTheoryClasses || 0,
                                    totalPracticalClasses:
                                      record.totalPracticalClasses || 0,
                                    completedTheoryClasses:
                                      record.completedTheoryClasses || 0,
                                    completedPracticalClasses:
                                      record.completedPracticalClasses || 0,
                                  });
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog
                                open={deleteId === record.id}
                                onOpenChange={(open) =>
                                  !open && setDeleteId(null)
                                }
                              >
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteId(record.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete the monthly class
                                      record.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(record.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
};

export default MonthlyBatchClassesDashboard;
