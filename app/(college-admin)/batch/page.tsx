"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  ChevronRight,
  Edit,
  Trash,
  Plus,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import SideBarLayout from "@/components/sidebar/layout";
import { Switch } from "@/components/ui/switch";

const batchSchema = z.object({
  termId: z.string().min(1, "Term is required"),
  academicYearId: z.string().min(1, "Academic Year is required"),
  programId: z.string().min(1, "Program is required"),
  batchTypeId: z.string().min(1, "Batch Type is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  status: z.boolean().optional(),
});

type BatchFormData = z.infer<typeof batchSchema>;

interface Batch {
  id: string;
  name: string;
  term: string;
  academicYear: string;
  batchType: string;
  program: string;
  startDate: string;
  endDate: string;
  status: boolean;
}

interface SelectOption {
  id: string;
  name: string;
}

const BatchManager: React.FC = () => {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);
  const [terms, setTerms] = useState<SelectOption[]>([]);
  const [academicYears, setAcademicYears] = useState<SelectOption[]>([]);
  const [programs, setPrograms] = useState<SelectOption[]>([]);
  const [batchTypes, setBatchTypes] = useState<SelectOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      termId: "",
      academicYearId: "",
      programId: "",
      batchTypeId: "",
      startDate: "",
      endDate: "",
      status: true,
    },
  });

  useEffect(() => {
    fetchBatches();
    fetchSelectOptions();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch("/api/batch");
      if (!response.ok) throw new Error("Failed to fetch batches");
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      console.error("Error fetching batches:", error);
      toast({
        title: "Error",
        description: "Failed to fetch batches. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchSelectOptions = async () => {
    try {
      const [termsRes, academicYearsRes, programsRes, batchTypesRes] =
        await Promise.all([
          fetch("/api/semesters"),
          fetch("/api/academicYear"),
          fetch("/api/programs"),
          fetch("/api/batchType"),
        ]);

      const [termsData, academicYearsData, programsData, batchTypesData] =
        await Promise.all([
          termsRes.json(),
          academicYearsRes.json(),
          programsRes.json(),
          batchTypesRes.json(),
        ]);

      setTerms(termsData);
      setAcademicYears(academicYearsData);
      setPrograms(programsData);
      setBatchTypes(batchTypesData);
      setIsLoadingOptions(false); // Set loading state to false once options are loaded
    } catch (error) {
      console.error("Error fetching select options:", error);
      toast({
        title: "Error",
        description: "Failed to fetch select options. Please try again.",
        variant: "destructive",
      });
      setIsLoadingOptions(false);
    }
  };

  const handleEdit = (batch: Batch) => {
    if (isLoadingOptions) return;

    setEditingBatch(batch);

    const termId = terms.find((term) => term.name === batch.term)?.id || "";
    const programId =
      programs.find((program) => program.name === batch.program)?.id || "";
    const batchTypeId =
      batchTypes.find((batchType) => batchType.name === batch.batchType)?.id ||
      "";
    const academicYearId =
      academicYears.find(
        (academicYear) => academicYear.name === batch.academicYear
      )?.id || "";

    if (termId) setValue("termId", termId);
    if (programId) setValue("programId", programId);
    if (batchTypeId) setValue("batchTypeId", batchTypeId);
    if (academicYearId) setValue("academicYearId", academicYearId);

    setValue("startDate", batch.startDate.split("T")[0]);
    setValue("endDate", batch.endDate.split("T")[0]);
    setValue("status", batch.status);

    setIsEditModalOpen(true);
  };

  const onSubmit = async (data: BatchFormData) => {
    try {
      const url = editingBatch ? `/api/batch/${editingBatch.id}` : "/api/batch";
      const method = editingBatch ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          status: data.status ?? true,
        }),
      });

      if (!response.ok) throw new Error("Failed to save batch");

      toast({
        title: "Success",
        description: `Batch ${
          editingBatch ? "updated" : "created"
        } successfully`,
      });
      reset();
      setEditingBatch(null);
      setIsEditModalOpen(false);
      fetchBatches();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save batch. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (batch: Batch) => {
    setBatchToDelete(batch);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!batchToDelete) return;

    try {
      const response = await fetch(`/api/batch/${batchToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete batch");

      toast({
        title: "Success",
        description: "Batch deleted successfully",
      });
      fetchBatches();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete batch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setBatchToDelete(null);
    }
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-6">
        <nav className="flex mb-6 overflow-x-auto" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  Batches
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold">
                  Batch Manager
                </CardTitle>
                <CardDescription className="text-sm">
                  Manage batches for your academic programs.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Batch
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => router.push("/batch-type")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Batch Type
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {batches.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </TableHead>
                      <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Term
                      </TableHead>
                      <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Academic Year
                      </TableHead>
                      <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Program
                      </TableHead>
                      <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Batch Type
                      </TableHead>
                      <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Start Date
                      </TableHead>
                      <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        End Date
                      </TableHead>
                      <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="px-2 py-4 whitespace-nowrap">
                          {batch.name}
                        </TableCell>
                        <TableCell className="px-2 py-4 whitespace-nowrap hidden md:table-cell">
                          {batch.term}
                        </TableCell>
                        <TableCell className="px-2 py-4 whitespace-nowrap hidden md:table-cell">
                          {batch.academicYear}
                        </TableCell>
                        <TableCell className="px-2 py-4 whitespace-nowrap hidden md:table-cell">
                          {batch.program}
                        </TableCell>
                        <TableCell className="px-2 py-4 whitespace-nowrap hidden md:table-cell">
                          {batch.batchType}
                        </TableCell>
                        <TableCell className="px-2 py-4 whitespace-nowrap hidden md:table-cell">
                          {new Date(batch.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-2 py-4 whitespace-nowrap hidden md:table-cell">
                          {new Date(batch.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-2 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              batch.status
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {batch.status ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="px-2 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(batch)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(batch)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No batches have been added yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingBatch ? "Edit Batch" : "Create New Batch"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="termId">Term</Label>
              <Controller
                name="termId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a term" />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map((term) => (
                        <SelectItem key={term.id} value={term.id}>
                          {term.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.termId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.termId.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="academicYearId">Academic Year</Label>
              <Controller
                name="academicYearId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.academicYearId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.academicYearId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="programId">Program</Label>
              <Controller
                name="programId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.programId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.programId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="batchTypeId">Batch Type</Label>
              <Controller
                name="batchTypeId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a batch type" />
                    </SelectTrigger>
                    <SelectContent>
                      {batchTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.batchTypeId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.batchTypeId.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <Input
                    type="date"
                    id="startDate"
                    {...field}
                    value={field.value || ""}
                    className="mt-1"
                  />
                )}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <Input type="date" id="endDate" {...field} className="mt-1" />
                )}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.endDate.message}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="status"
                  />
                )}
              />
              <Label htmlFor="status">Active</Label>
            </div>
          </form>
          <DialogFooter className="">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingBatch ? "Updating..." : "Creating..."}
                </>
              ) : editingBatch ? (
                "Update Batch"
              ) : (
                "Create Batch"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the batch "{batchToDelete?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SideBarLayout>
  );
};

export default BatchManager;
