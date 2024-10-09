"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Tag,
  Hash,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Menu,
} from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import SideBarLayout from "@/components/sidebar/layout";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const semesterSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  alias: z
    .string()
    .min(2, "Alias must be at least 2 characters")
    .max(20, "Alias must be less than 20 characters"),
  numerical: z
    .number()
    .min(1, "Numerical value must be at least 1")
    .max(12, "Numerical value must be less than 12"),
});

type SemesterFormData = z.infer<typeof semesterSchema>;

interface Semester extends SemesterFormData {
  id: string;
}

const formFields = [
  { name: "name", label: "Semester Name", icon: Calendar, type: "text" },
  { name: "alias", label: "Semester Alias", icon: Tag, type: "text" },
  { name: "numerical", label: "Numerical Value", icon: Hash, type: "number" },
];

export default function SemesterManagement() {
  const router = useRouter();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SemesterFormData>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      name: "",
      alias: "",
      numerical: 1,
    },
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/semesters");
      if (!response.ok) throw new Error("Failed to fetch semesters");
      const data = await response.json();
      setSemesters(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch semesters",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SemesterFormData) => {
    try {
      const method = selectedSemester ? "PUT" : "POST";
      const url = selectedSemester
        ? `/api/semesters/${selectedSemester.id}`
        : "/api/semesters";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${selectedSemester ? "update" : "create"} semester`
        );
      }

      toast({
        title: "Success",
        description: `Semester ${
          selectedSemester ? "updated" : "created"
        } successfully`,
      });

      reset();
      setSelectedSemester(null);
      setIsEditDialogOpen(false);
      fetchSemesters();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (semester: Semester) => {
    setSelectedSemester(semester);
    Object.keys(semester).forEach((key) => {
      setValue(key as keyof SemesterFormData, semester[key as keyof Semester]);
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/semesters/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete semester");

      toast({
        title: "Success",
        description: "Semester deleted successfully",
      });
      fetchSemesters();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete semester",
        variant: "destructive",
      });
    }
  };

  return (
    <SideBarLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-6">
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <span className="text-sm font-medium text-gray-700">
                  Semesters
                </span>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">
                      Semester Management
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Create and manage semesters for your academic programs.
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Semester
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          {selectedSemester
                            ? "Edit Semester"
                            : "Create New Semester"}
                        </DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        {formFields.map(({ name, label, icon: Icon, type }) => (
                          <div key={name} className="space-y-2">
                            <Label
                              htmlFor={name}
                              className="flex items-center text-sm font-medium"
                            >
                              <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                              {label}
                            </Label>
                            <Input
                              id={name}
                              type={type}
                              {...register(name as keyof SemesterFormData, {
                                valueAsNumber: type === "number",
                              })}
                              className={
                                errors[name as keyof SemesterFormData]
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                            {errors[name as keyof SemesterFormData] && (
                              <p className="text-sm text-red-500">
                                {
                                  errors[name as keyof SemesterFormData]
                                    ?.message
                                }
                              </p>
                            )}
                          </div>
                        ))}
                        <div className="flex justify-end gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              reset();
                              setSelectedSemester(null);
                              setIsEditDialogOpen(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {selectedSemester
                                  ? "Updating..."
                                  : "Creating..."}
                              </>
                            ) : selectedSemester ? (
                              "Update Semester"
                            ) : (
                              "Create Semester"
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : semesters.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Alias
                          </TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Numerical Value
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {semesters.map((semester) => (
                          <TableRow key={semester.id}>
                            <TableCell>{semester.name}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {semester.alias}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {semester.numerical}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <div className="hidden sm:flex gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleEdit(semester)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Edit semester
                                    </TooltipContent>
                                  </Tooltip>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete Semester
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this
                                          semester? This action cannot be
                                          undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDelete(semester.id)
                                          }
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                                <div className="sm:hidden">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="icon">
                                        <Menu className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() => handleEdit(semester)}
                                      >
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDelete(semester.id)
                                        }
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No semesters found. Create your first semester to get
                      started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </SideBarLayout>
  );
}
