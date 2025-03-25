"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Edit, Plus } from "lucide-react";
import { AutoBaseExamFeeInsertion } from "@/components/automated-examfee-insertion/examfee-insertion";
import { Badge } from "@/components/ui/badge";
import SideBarLayout from "@/components/sidebar/layout";

// Comprehensive Type Definitions for Strong Typing
interface Batch {
  id: string;
  name: string;
  program: {
    name: string;
  };
  academicYear: {
    year: string;
  };
}

interface StudentBatch {
  id: string;
  student: {
    id: string;
    name: string;

    enrollmentNo: string;
  };
  batchStatus: string;
}

interface StudentBatchExamFee {
  id: string;
  studentBatchId: string;
  reason: string;
  examFee: number;
  dueDate?: string;
  paymentStatus?: "PENDING" | "COMPLETED" | "FAILED";
  student: {
    id: string;
    name: string;
    enrollmentNo: string;
  };
  batch: {
    id: string;
    name: string;
  };
}

export default function StudentBatchExamFeeManagement() {
  // Advanced State Management for Complex Workflows
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [studentBatches, setStudentBatches] = useState<StudentBatch[]>([]);
  const [examFees, setExamFees] = useState<StudentBatchExamFee[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  // Granular Loading States for Enhanced User Experience
  const [loading, setLoading] = useState({
    batches: false,
    students: false,
    examFees: false,
    submission: false,
  });

  // Sophisticated Form State Management
  const [selectedStudentBatch, setSelectedStudentBatch] =
    useState<StudentBatch | null>(null);
  const [formData, setFormData] = useState({
    reason: "",
    examFee: "",
    studentBatchId: "",
    dueDate: "",
    paymentStatus: "PENDING",
  });
  const [editingFee, setEditingFee] = useState<StudentBatchExamFee | null>(
    null
  );
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    feeId: string | null;
  }>({ isOpen: false, feeId: null });

  // Comprehensive Data Fetching Methods
  const fetchBatches = async () => {
    setLoading((prev) => ({ ...prev, batches: true }));
    try {
      const response = await fetch("/api/batch");
      if (!response.ok) throw new Error("Failed to fetch batches");
      const data = await response.json();
      setBatches(data);
    } catch (error: any) {
      toast({
        title: "Batch Retrieval Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, batches: false }));
    }
  };

  const fetchStudentBatches = async (batchId: string) => {
    setLoading((prev) => ({ ...prev, students: true }));
    try {
      const response = await fetch(`/api/batch/${batchId}/students`);
      if (!response.ok) throw new Error("Failed to fetch student batches");
      const data = await response.json();
      setStudentBatches(data);
      console.log(data);
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading((prev) => ({ ...prev, students: false }));
    }
  };

  const fetchExamFees = async (batchId: string) => {
    setLoading((prev) => ({ ...prev, examFees: true }));
    try {
      const response = await fetch(
        `/api/studentBatchExamFee?batchId=${batchId}`
      );
      if (!response.ok) throw new Error("Failed to fetch exam fees");
      const data = await response.json();
      setExamFees(data);
    } catch (error: any) {
      console.log(error);
    } finally {
      setLoading((prev) => ({ ...prev, examFees: false }));
    }
  };

  // Lifecycle Management with UseEffect Hooks
  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchStudentBatches(selectedBatch);
      fetchExamFees(selectedBatch);
    }
  }, [selectedBatch]);

  // Enhanced Submission Handlers
  const handleCreateFee = async (payload: any) => {
    try {
      const response = await fetch("/api/studentBatchExamFee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Exam fee creation failed");
      }

      toast({
        title: "Success",
        description: "Exam fee created successfully",
      });

      resetForm();
      if (selectedBatch) fetchExamFees(selectedBatch);
    } catch (error: any) {
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditFee = async (payload: any) => {
    if (!editingFee) return;

    try {
      const response = await fetch(
        `/api/studentBatchExamFee/${editingFee.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Exam fee update failed");
      }

      toast({
        title: "Success",
        description: "Exam fee updated successfully",
      });

      resetForm();
      if (selectedBatch) fetchExamFees(selectedBatch);
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteFee = async () => {
    if (!deleteConfirmDialog.feeId) return;

    try {
      const response = await fetch(
        `/api/studentBatchExamFee/${deleteConfirmDialog.feeId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Exam fee deletion failed");
      }

      toast({
        title: "Success",
        description: "Exam fee deleted successfully",
      });

      setDeleteConfirmDialog({ isOpen: false, feeId: null });
      if (selectedBatch) fetchExamFees(selectedBatch);
    } catch (error: any) {
      toast({
        title: "Deletion Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Form Submission Master Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, submission: true }));

    try {
      // Comprehensive Validation
      if (!selectedStudentBatch || !formData.reason || !formData.examFee) {
        toast({
          title: "Validation Error",
          description: "Please complete all required fields",
          variant: "destructive",
        });
        return;
      }

      const payload = {
        studentBatchId: selectedStudentBatch.id,
        reason: formData.reason,
        examFee: parseFloat(formData.examFee),
        paymentStatus: formData.paymentStatus,
        dueDate: formData.dueDate,
      };

      if (editingFee) {
        await handleEditFee(payload);
      } else {
        await handleCreateFee(payload);
      }

      // Close the edit modal after successful submission
      setEditModalOpen(false);
    } catch (error) {
      // Error handling is done in individual methods
    } finally {
      setLoading((prev) => ({ ...prev, submission: false }));
    }
  };

  // Utility Method to Reset Form
  const resetForm = () => {
    setFormData({
      reason: "",
      examFee: "",
      studentBatchId: "",
      dueDate: "",
      paymentStatus: "PENDING",
    });
    setSelectedStudentBatch(null);
    setEditingFee(null);
    setEditModalOpen(false);
  };
  const openEditModal = (fee: StudentBatchExamFee) => {
    setEditingFee(fee);
    setFormData({
      reason: fee.reason,
      examFee: fee.examFee.toString(),
      studentBatchId: fee.studentBatchId,
      dueDate: fee.dueDate
        ? new Date(fee.dueDate).toISOString().split("T")[0]
        : "",
      paymentStatus: fee.paymentStatus || "PENDING",
    });

    // Find and set the corresponding student batch
    const studentBatch = studentBatches.find(
      (sb) => sb.id === fee.studentBatchId
    );
    setSelectedStudentBatch(studentBatch || null);

    setEditModalOpen(true);
  };
  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Card className="w-full shadow-lg">
          <CardHeader className="">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div>
                <CardTitle className="text-xl md:text-2xl font-bold ">
                  Student Batch Exam Fee Management
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                  Streamline exam fee tracking with precision and flexibility
                </CardDescription>
              </div>
              {selectedBatch && (
                <AutoBaseExamFeeInsertion
                  batchId={selectedBatch}
                  onSuccessfulInsertion={() => {
                    fetchExamFees(selectedBatch);
                  }}
                />
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Batch and Student Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Batch Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium ">Select Batch</Label>
                <Select
                  onValueChange={(value) => {
                    setSelectedBatch(value);
                    // Clear all related states
                    setStudentBatches([]); // Clear student batches
                    setExamFees([]); // Clear exam fees
                    setSelectedStudentBatch(null);
                    resetForm();
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id} className="">
                        <div className="flex flex-col">
                          <span className="font-semibold">{batch.name}</span>
                          <span className="text-xs ">{batch.program.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Student Selection */}
              {selectedBatch && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium ">Select Student</Label>
                  {studentBatches.length === 0 ? (
                    <div className="text-center py-4   rounded-md border ">
                      <p className="font-medium">
                        No students found in this batch
                      </p>
                      <p className="text-sm">
                        Please check the batch selection or contact
                        administrator
                      </p>
                    </div>
                  ) : (
                    <Select
                      onValueChange={(studentBatchId) => {
                        const student = studentBatches.find(
                          (sb) => sb.id === studentBatchId
                        );
                        setSelectedStudentBatch(student || null);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {studentBatches.map((studentBatch) => (
                          <SelectItem
                            key={studentBatch.id}
                            value={studentBatch.id}
                            className=""
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {studentBatch.student.name}
                              </span>
                              <span className="text-xs ">
                                Enrollment No :{" "}
                                {studentBatch.student.enrollmentNo}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>

            {/* Exam Fee Creation/Edit Form */}
            {selectedStudentBatch && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Reason for Exam Fee
                      </Label>
                      <Input
                        value={formData.reason}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            reason: e.target.value,
                          }))
                        }
                        placeholder="Enter reason (e.g., Semester Exam 2024)"
                        className="w-full"
                        disabled={!!editingFee}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium ">
                        Exam Fee Amount
                      </Label>
                      <Input
                        type="number"
                        value={formData.examFee}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            examFee: e.target.value,
                          }))
                        }
                        placeholder="Enter exam fee"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Payment Status
                      </Label>

                      <Select
                        value={formData.paymentStatus}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            paymentStatus: value as
                              | "PENDING"
                              | "COMPLETED"
                              | "FAILED",
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Payment Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="FAILED">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Due Date</Label>
                      <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dueDate: e.target.value,
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Button
                        type="submit"
                        disabled={loading.submission}
                        className="w-full "
                      >
                        {loading.submission ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            {editingFee ? "Updating" : "Creating"}
                          </>
                        ) : editingFee ? (
                          `Update Fee for ${selectedStudentBatch.student.name}`
                        ) : (
                          `Create Fee for ${selectedStudentBatch.student.name}`
                        )}
                      </Button>
                      {editingFee && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full mt-2 "
                          onClick={resetForm}
                        >
                          Cancel Edit
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Exam Fees Table */}
            {selectedBatch &&
              (examFees.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                      Exam Fees Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/4">Student</TableHead>
                            <TableHead className="w-1/6">Reason</TableHead>
                            <TableHead className="w-1/6">Exam Fee</TableHead>
                            <TableHead className="w-1/6">Due Date</TableHead>
                            <TableHead className="w-1/6">
                              Payment Status
                            </TableHead>
                            <TableHead className="w-1/6 text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {examFees.map((fee) => (
                            <TableRow key={fee.id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {fee.student.name}
                                  </span>
                                  <span className="text-xs">
                                    {fee.student.enrollmentNo}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{fee.reason}</TableCell>
                              <TableCell className="font-semibold text-green-600">
                                ₹{fee.examFee.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                {fee.dueDate
                                  ? new Date(fee.dueDate).toLocaleDateString()
                                  : "Not Set"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    fee.paymentStatus === "COMPLETED"
                                      ? "default"
                                      : fee.paymentStatus === "FAILED"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {fee.paymentStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditModal(fee)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      setDeleteConfirmDialog({
                                        isOpen: true,
                                        feeId: fee.id,
                                      })
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8  rounded-md border">
                  <p className="text-lg font-semibold  mb-2">
                    No Exam Fees Found
                  </p>
                  <p className="text-sm ">
                    There are no exam fees recorded for the selected batch.
                  </p>
                </div>
              ))}
            {/* Edit Fee Modal */}
            <Dialog
              open={editModalOpen}
              onOpenChange={(open) => {
                setEditModalOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingFee ? "Edit Exam Fee" : "Create Exam Fee"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingFee
                      ? `Modify exam fee details for ${selectedStudentBatch?.student.name}`
                      : "Enter new exam fee details"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Student</Label>
                    <Input
                      value={selectedStudentBatch?.student.name || ""}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason for Exam Fee</Label>
                    <Input
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      placeholder="Enter reason (e.g., Semester Exam 2024)"
                      disabled={!!editingFee}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Fee Amount</Label>
                    <Input
                      type="number"
                      value={formData.examFee}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          examFee: e.target.value,
                        }))
                      }
                      placeholder="Enter exam fee"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentStatus: value as
                            | "PENDING"
                            | "COMPLETED"
                            | "FAILED",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Payment Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dueDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading.submission}>
                      {loading.submission ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingFee ? "Updating" : "Creating"}
                        </>
                      ) : editingFee ? (
                        "Update Fee"
                      ) : (
                        "Create Fee"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            {/* Delete Confirmation Dialog */}
            <Dialog
              open={deleteConfirmDialog.isOpen}
              onOpenChange={(open) =>
                setDeleteConfirmDialog((prev) => ({ ...prev, isOpen: open }))
              }
            >
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-xl ">
                    Confirm Exam Fee Deletion
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Are you absolutely sure you want to delete this exam fee?
                    This action cannot be undone and will permanently remove the
                    fee record.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <DialogClose asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteFee}
                    className="w-full sm:w-auto "
                  >
                    Confirm Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
}
