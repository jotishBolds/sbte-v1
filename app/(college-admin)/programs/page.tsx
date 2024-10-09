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

const programTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be smaller than 100 characters long")
    .regex(/^(?![0-9]+$)[a-zA-Z0-9\s]+$/, {
      message: "Name must be alphanumeric and cannot be purely numeric",
    }),
});

type ProgramTypeFormData = z.infer<typeof programTypeSchema>;

interface ProgramType {
  id: string;
  name: string;
  college: {
    name: string;
  };
}

const ProgramTypeManager: React.FC = () => {
  const router = useRouter();
  const [programTypes, setProgramTypes] = useState<ProgramType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [programTypeToDelete, setProgramTypeToDelete] =
    useState<ProgramType | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProgramTypeFormData>({
    resolver: zodResolver(programTypeSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    fetchProgramTypes();
  }, []);

  const fetchProgramTypes = async () => {
    try {
      const response = await fetch("/api/programs/programTypes");
      if (!response.ok) throw new Error("Failed to fetch program types");
      const data = await response.json();
      setProgramTypes(data);
    } catch (error) {
      console.error("Error fetching program types:", error);
      toast({
        title: "Error",
        description: "Failed to fetch program types. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: ProgramTypeFormData) => {
    try {
      const url = editingId
        ? `/api/programs/programTypes/${editingId}`
        : "/api/programs/programTypes";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save program type");

      toast({
        title: "Success",
        description: `Program type ${
          editingId ? "updated" : "created"
        } successfully`,
      });
      reset();
      setEditingId(null);
      fetchProgramTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save program type. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (programType: ProgramType) => {
    setEditingId(programType.id);
    reset({ name: programType.name });
  };

  const handleDeleteClick = (programType: ProgramType) => {
    setProgramTypeToDelete(programType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!programTypeToDelete) return;

    try {
      const response = await fetch(
        `/api/programs/programTypes/${programTypeToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete program type");

      toast({
        title: "Success",
        description: "Program type deleted successfully",
      });
      fetchProgramTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete program type. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProgramTypeToDelete(null);
    }
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-6">
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/programs"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary"
              >
                Programs
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  Program Types
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
                    {editingId ? "Edit Program Type" : "Create Program Type"}
                  </CardTitle>
                  <CardDescription>
                    Define program types for your academic programs.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/programs/create")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Programs
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
                  "Update Program Type"
                ) : (
                  "Create Program Type"
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
              <CardTitle>Program Types</CardTitle>
              <CardDescription>
                List of all program types in your college.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {programTypes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programTypes.map((programType) => (
                      <TableRow key={programType.id}>
                        <TableCell>{programType.name}</TableCell>
                        <TableCell>{programType.college.name}</TableCell>
                        <TableCell className="flex">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(programType)}
                            className="mr-2"
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(programType)}
                          >
                            <Trash className="w-4 h-4 mr-2" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No program types have been added yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the program type "
              {programTypeToDelete?.name}"? This action cannot be undone.
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

export default ProgramTypeManager;
