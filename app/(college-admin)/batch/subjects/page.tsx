"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus, Pencil, Trash, FileX, FolderClosed } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import SideBarLayout from "@/components/sidebar/layout";

// Enums
enum ClassType {
  PRACTICAL = "PRACTICAL",
  THEORY = "THEORY",
  BOTH = "BOTH",
}

// Interfaces
interface User {
  id: string;
  username: string;
  email: string;
}

interface EditFormValues {
  creditScore: number;
  subjectTypeId: string;
  classType: ClassType;
}

const editFormSchema = z.object({
  creditScore: z.coerce.number().min(0),
  subjectTypeId: z.string().min(1, "Subject type is required"),
  classType: z.enum(["PRACTICAL", "THEORY", "BOTH"]),
});

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
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy: User | null;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  creditScore: number;
}

interface SubjectType {
  id: string;
  name: string;
  alias: string;
}

interface BatchSubject {
  id: string;
  subject: Subject;
  subjectType: SubjectType;
  creditScore: number;
  classType: ClassType;
}

// Form Schema
const formSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  subjectCode: z.string().min(1, "Subject code is required"),
  subjectTypeId: z.string().min(1, "Subject type is required"),
  classType: z.nativeEnum(ClassType),
  creditScore: z.coerce.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

const BatchSubjectManagement = () => {
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [batchSubjects, setBatchSubjects] = useState<BatchSubject[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<BatchSubject | null>(
    null
  );
  const [subjectTypes, setSubjectTypes] = useState<SubjectType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectId: "",
      subjectCode: "",
      subjectTypeId: "",
      classType: ClassType.THEORY,
      creditScore: 0,
    },
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      creditScore: 0,
      subjectTypeId: "",
      classType: ClassType.THEORY,
    },
  });

  useEffect(() => {
    fetchBatches();
    fetchSubjects();
    fetchSubjectTypes();
  }, []);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "subjectId") {
        const selectedSubject = subjects.find((s) => s.id === value.subjectId);
        if (selectedSubject) {
          // Auto-fill subject code
          form.setValue("subjectCode", selectedSubject.code, {
            shouldValidate: true,
          });

          // Auto-fill credit score if available in the subject model
          if ("creditScore" in selectedSubject) {
            form.setValue("creditScore", selectedSubject.creditScore, {
              shouldValidate: true,
            });
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, subjects]);

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/batch");
      if (!response.ok) throw new Error("Failed to fetch batches");
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch batches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      });
    }
  };

  const fetchSubjectTypes = async () => {
    try {
      const response = await fetch("/api/subjectType");
      if (!response.ok) throw new Error("Failed to fetch subject types");
      const data = await response.json();
      setSubjectTypes(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subject types",
        variant: "destructive",
      });
    }
  };

  const fetchBatchSubjects = async (batchId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/batch/${batchId}/subject`);
      if (!response.ok) throw new Error("Failed to fetch batch subjects");
      const data = await response.json();
      setBatchSubjects(data.error ? [] : data);
    } catch (error) {
      setBatchSubjects([]);
      toast({
        title: "Error",
        description: "Failed to fetch batch subjects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchSelect = (batch: Batch) => {
    setSelectedBatch(batch);
    fetchBatchSubjects(batch.id);
  };

  const fetchSubjectDetails = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/subjects/${subjectId}`);
      if (!response.ok) throw new Error("Failed to fetch subject details");
      const data = await response.json();

      // Auto-fill the form with subject details
      form.setValue("subjectCode", data.code, { shouldValidate: true });
      if (data.creditScore) {
        form.setValue("creditScore", data.creditScore, {
          shouldValidate: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subject details",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (subject: BatchSubject) => {
    setEditingSubject(subject);
    editForm.reset({
      creditScore: Number(subject.creditScore),
      subjectTypeId: subject.subjectType.id,
      classType: subject.classType,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (subjectId: string) => {
    if (!selectedBatch) return;

    try {
      const response = await fetch(
        `/api/batch/${selectedBatch.id}/subject/${subjectId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete subject");
      }

      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });

      fetchBatchSubjects(selectedBatch.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!selectedBatch) return;

    try {
      const response = await fetch(`/api/batch/${selectedBatch.id}/subject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign subject");
      }

      toast({
        title: "Success",
        description: "Subject assigned successfully",
      });

      setIsAssignDialogOpen(false);
      form.reset();
      fetchBatchSubjects(selectedBatch.id);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to assign subject",
        variant: "destructive",
      });
    }
  };

  const onEditSubmit = async (data: EditFormValues) => {
    if (!selectedBatch || !editingSubject) return;

    try {
      const response = await fetch(
        `/api/batch/${selectedBatch.id}/subject/${editingSubject.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update subject");
      }

      toast({
        title: "Success",
        description: "Subject updated successfully",
      });

      setIsEditDialogOpen(false);
      editForm.reset();
      fetchBatchSubjects(selectedBatch.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subject",
        variant: "destructive",
      });
    }
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto p-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Batch Subject Management
            </CardTitle>
            <CardDescription>
              Manage and organize subjects for different batches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Batches Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Available Batches</h3>
                  {isLoading && (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 ">
                  {batches.map((batch) => (
                    <Button
                      key={batch.id}
                      variant={
                        selectedBatch?.id === batch.id ? "secondary" : "outline"
                      }
                      className="w-full justify-start text-left p-8"
                      onClick={() => handleBatchSelect(batch)}
                    >
                      <div>
                        <div className="font-medium">{batch.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {batch.program} - {batch.term}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Subjects Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Batch Subjects</h3>
                  {selectedBatch && (
                    <Dialog
                      open={isAssignDialogOpen}
                      onOpenChange={setIsAssignDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Assign Subject
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>
                            Assign Subject to {selectedBatch.name}
                          </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                          >
                            <FormField
                              control={form.control}
                              name="subjectId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Subject</FormLabel>
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      fetchSubjectDetails(value);
                                    }}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select subject" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {subjects.map((subject) => (
                                        <SelectItem
                                          key={subject.id}
                                          value={subject.id}
                                        >
                                          {subject.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="subjectCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Subject Code</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="subjectTypeId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Subject Type</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select subject type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {subjectTypes.map((type) => (
                                        <SelectItem
                                          key={type.id}
                                          value={type.id}
                                        >
                                          {type.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="classType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Class Type</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select class type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {Object.values(ClassType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {type}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="creditScore"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Credit Score</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button type="submit" className="w-full">
                              Assign Subject
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {selectedBatch ? (
                  isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
                    </div>
                  ) : batchSubjects.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Class Type</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {batchSubjects.map((subject) => (
                            <TableRow key={subject.id}>
                              <TableCell className="font-medium">
                                {subject.subject.name}
                              </TableCell>
                              <TableCell>{subject.subject.code}</TableCell>
                              <TableCell>{subject.subjectType.name}</TableCell>
                              <TableCell>{subject.classType}</TableCell>
                              <TableCell>{subject.creditScore}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(subject)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <Trash className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete Subject
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this
                                          subject? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDelete(subject.id)
                                          }
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <FileX className="w-12 h-12 text-muted-foreground mb-4" />
                      <h4 className="text-lg font-medium mb-2">
                        No subjects assigned
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        This batch doesn't have any subjects assigned yet.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <FolderClosed className="w-12 h-12 text-muted-foreground mb-4" />
                    <h4 className="text-lg font-medium mb-2">
                      No batch selected
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Select a batch to view and manage its subjects
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onEditSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="subjectTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjectTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="classType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ClassType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="creditScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Score</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Update Subject
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </SideBarLayout>
  );
};

export default BatchSubjectManagement;
