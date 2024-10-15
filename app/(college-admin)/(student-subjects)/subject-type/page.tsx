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

const subjectTypeSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  alias: z
    .string()
    .min(1, "Alias must be at least 1 character")
    .max(10, "Alias must be less than 10 characters"),
});

type SubjectTypeFormData = z.infer<typeof subjectTypeSchema>;

interface SubjectType {
  id: string;
  name: string;
  alias: string;
  college: {
    name: string;
  };
}

const SubjectTypeManager: React.FC = () => {
  const router = useRouter();
  const [subjectTypes, setSubjectTypes] = useState<SubjectType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectTypeToDelete, setSubjectTypeToDelete] =
    useState<SubjectType | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubjectTypeFormData>({
    resolver: zodResolver(subjectTypeSchema),
    defaultValues: { name: "", alias: "" },
  });

  useEffect(() => {
    fetchSubjectTypes();
  }, []);

  const fetchSubjectTypes = async () => {
    try {
      const response = await fetch("/api/subjectType");
      if (!response.ok) throw new Error("Failed to fetch subject types");
      const data = await response.json();
      setSubjectTypes(data);
    } catch (error) {
      console.error("Error fetching subject types:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subject types. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: SubjectTypeFormData) => {
    try {
      const url = editingId
        ? `/api/subjectType/${editingId}`
        : "/api/subjectType";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save subject type");
      }

      toast({
        title: "Success",
        description: `Subject type ${
          editingId ? "updated" : "created"
        } successfully`,
      });
      reset();
      setEditingId(null);
      fetchSubjectTypes();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save subject type. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (subjectType: SubjectType) => {
    setEditingId(subjectType.id);
    reset({ name: subjectType.name, alias: subjectType.alias });
  };

  const handleDeleteClick = (subjectType: SubjectType) => {
    setSubjectTypeToDelete(subjectType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subjectTypeToDelete) return;

    try {
      const response = await fetch(
        `/api/subjectType/${subjectTypeToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete subject type");

      toast({
        title: "Success",
        description: "Subject type deleted successfully",
      });
      fetchSubjectTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject type. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSubjectTypeToDelete(null);
    }
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-6">
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/subject"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary"
              >
                Subjects
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  Subject Types
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
                    {editingId ? "Edit Subject Type" : "Create Subject Type"}
                  </CardTitle>
                  <CardDescription>
                    Define subject types for your academic programs.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/student-subjects")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Subjects
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
                <div>
                  <Label htmlFor="alias">Alias</Label>
                  <Controller
                    name="alias"
                    control={control}
                    render={({ field }) => (
                      <Input id="alias" {...field} className="mt-1" />
                    )}
                  />
                  {errors.alias && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.alias.message}
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
                  "Update Subject Type"
                ) : (
                  "Create Subject Type"
                )}
              </Button>
              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    reset({ name: "", alias: "" });
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subject Types</CardTitle>
              <CardDescription>
                List of all subject types in your college.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subjectTypes.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Alias</TableHead>
                        <TableHead className="hidden md:table-cell">
                          College
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjectTypes.map((subjectType) => (
                        <TableRow key={subjectType.id}>
                          <TableCell>{subjectType.name}</TableCell>
                          <TableCell>{subjectType.alias}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {subjectType.college.name}
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
                                    onClick={() => handleEdit(subjectType)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteClick(subjectType)
                                    }
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
                  No subject types have been added yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the subject type "
              {subjectTypeToDelete?.name}"? This action cannot be undone.
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

export default SubjectTypeManager;
