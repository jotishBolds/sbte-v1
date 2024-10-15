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
  MoreVertical,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import SideBarLayout from "@/components/sidebar/layout";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const subjectSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be less than 20 characters"),
  alias: z.string().optional(),
  creditScore: z.number().min(0, "Credit score must be a positive number"),
  status: z.boolean().optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface Subject {
  id: string;
  name: string;
  code: string;
  alias?: string;
  creditScore: number;
  status: boolean;
  createdByName: string;
}

const SubjectManager: React.FC = () => {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      code: "",
      alias: "",
      creditScore: 0,
      status: true,
    },
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subjects. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setValue("name", subject.name);
    setValue("code", subject.code);
    setValue("alias", subject.alias || "");
    setValue("creditScore", subject.creditScore);
    setValue("status", subject.status);
    setIsEditModalOpen(true);
  };

  const onSubmit = async (data: SubjectFormData) => {
    try {
      const url = editingSubject
        ? `/api/subjects/${editingSubject.id}`
        : "/api/subjects";
      const method = editingSubject ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save subject");

      toast({
        title: "Success",
        description: `Subject ${
          editingSubject ? "updated" : "created"
        } successfully`,
      });
      reset();
      setEditingSubject(null);
      setIsEditModalOpen(false);
      fetchSubjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save subject. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (subject: Subject) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;

    try {
      const response = await fetch(`/api/subjects/${subjectToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete subject");

      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
      fetchSubjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
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
                  Subjects
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
                  Subject Manager
                </CardTitle>
                <CardDescription className="text-sm">
                  Manage subjects for your academic programs.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Subject
                </Button>
                <Button
                  variant={"outline"}
                  className="w-full sm:w-auto"
                  onClick={() => router.push("/subject-type")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Subject Type
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {subjects.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="">Name</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Code
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Alias
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Credit Score
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Created By
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="">{subject.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {subject.code}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {subject.alias || "-"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {subject.creditScore}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {subject.createdByName}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              subject.status
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {subject.status ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="hidden sm:flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(subject)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(subject)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="sm:hidden">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(subject)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(subject)}
                                >
                                  Delete
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
                No subjects have been added yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? "Edit Subject" : "Create New Subject"}
            </DialogTitle>
          </DialogHeader>
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
              <Label htmlFor="code">Code</Label>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <Input id="code" {...field} className="mt-1" />
                )}
              />
              {errors.code && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.code.message}
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
            <div>
              <Label htmlFor="creditScore">Credit Score</Label>
              <Controller
                name="creditScore"
                control={control}
                render={({ field }) => (
                  <Input
                    id="creditScore"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    className="mt-1"
                  />
                )}
              />
              {errors.creditScore && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.creditScore.message}
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
          <DialogFooter>
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
                  {editingSubject ? "Updating..." : "Creating..."}
                </>
              ) : editingSubject ? (
                "Update Subject"
              ) : (
                "Create Subject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the subject "
              {subjectToDelete?.name}"? This action cannot be undone.
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

export default SubjectManager;
