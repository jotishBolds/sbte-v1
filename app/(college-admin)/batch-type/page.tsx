"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  ArrowLeft,
  ChevronRight,
  Edit,
  Trash,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import SideBarLayout from "@/components/sidebar/layout";

const batchTypeSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^(?![0-9]+$)[a-zA-Z0-9\s]+$/, {
      message: "Name must be alphanumeric and cannot be purely numeric",
    }),
});

type BatchTypeFormData = z.infer<typeof batchTypeSchema>;

interface BatchType {
  id: string;
  name: string;
  college: {
    name: string;
  };
}

const BatchTypeManager: React.FC = () => {
  const router = useRouter();
  const [batchTypes, setBatchTypes] = useState<BatchType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchTypeToDelete, setBatchTypeToDelete] = useState<BatchType | null>(
    null
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BatchTypeFormData>({
    resolver: zodResolver(batchTypeSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    fetchBatchTypes();
  }, []);

  const fetchBatchTypes = async () => {
    try {
      const response = await fetch("/api/batchType");
      if (!response.ok) throw new Error("Failed to fetch batch types");
      const data = await response.json();
      setBatchTypes(data);
    } catch (error) {
      console.error("Error fetching batch types:", error);
      toast({
        title: "Error",
        description: "Failed to fetch batch types. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: BatchTypeFormData) => {
    try {
      const url = editingId ? `/api/batchType/${editingId}` : "/api/batchType";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save batch type");

      toast({
        title: "Success",
        description: `Batch type ${
          editingId ? "updated" : "created"
        } successfully`,
      });
      reset();
      setEditingId(null);
      fetchBatchTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save batch type. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (batchType: BatchType) => {
    setEditingId(batchType.id);
    reset({ name: batchType.name });
  };

  const handleDeleteClick = (batchType: BatchType) => {
    setBatchTypeToDelete(batchType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!batchTypeToDelete) return;

    try {
      const response = await fetch(`/api/batchType/${batchTypeToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete batch type");

      toast({
        title: "Success",
        description: "Batch type deleted successfully",
      });
      fetchBatchTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete batch type. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setBatchTypeToDelete(null);
    }
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-6">
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/batch"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary"
              >
                Batches
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  Batch Types
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {editingId ? "Edit Batch Type" : "Create Batch Type"}
                  </CardTitle>
                  <CardDescription>
                    Define batch types for your academic programs.
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => router.push("/batch")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Batch
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input id="name" {...field} className="mt-1" />
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-4">
              <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingId ? "Updating..." : "Creating..."}
                  </>
                ) : editingId ? (
                  "Update Batch Type"
                ) : (
                  "Create Batch Type"
                )}
              </Button>
              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    reset({ name: "" });
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Batch Types</CardTitle>
              <CardDescription>
                List of all batch types in your college.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {batchTypes.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">
                          College
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batchTypes.map((batchType) => (
                        <TableRow key={batchType.id}>
                          <TableCell>{batchType.name}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {batchType.college.name}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(batchType)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(batchType)}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No batch types have been added yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the batch type "
              {batchTypeToDelete?.name}"? This action cannot be undone.
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

export default BatchTypeManager;
