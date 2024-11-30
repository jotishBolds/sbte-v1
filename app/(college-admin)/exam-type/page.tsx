"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
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
import { ChevronLeft, ChevronRight, Pencil, Trash2, Plus } from "lucide-react";
import SideBarLayout from "@/components/sidebar/layout";

const formSchema = z
  .object({
    examName: z.string().min(1, "Exam name is required"),
    totalMarks: z.number().min(1, "Total marks must be greater than 0"),
    passingMarks: z.number().optional(),
    status: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.passingMarks && data.passingMarks >= data.totalMarks) {
        return false;
      }
      return true;
    },
    {
      message: "Passing marks must be less than total marks",
      path: ["passingMarks"],
    }
  );

const ITEMS_PER_PAGE = 10;

export default function ExamTypesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  const form = useForm<ExamTypeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examName: "",
      totalMarks: 0,
      passingMarks: undefined,
      status: true,
    },
  });

  useEffect(() => {
    fetchExamTypes();
  }, []);

  const fetchExamTypes = async () => {
    try {
      const response = await fetch("/api/examType");
      const data = await response.json();

      if (response.ok) {
        // Check if the response is an array
        if (Array.isArray(data)) {
          setExamTypes(data);
        }
        // If it's an object with a message (no exam types found)
        else if (data.message === "No exam types found") {
          setExamTypes([]);
        }
        // For any other unexpected response format
        else {
          setExamTypes([]);
          toast({
            title: "Warning",
            description: "Unexpected data format received",
            variant: "destructive",
          });
        }
      } else {
        setExamTypes([]);
        toast({
          title: "Error",
          description: data.error || "Failed to fetch exam types",
          variant: "destructive",
        });
      }
    } catch (error) {
      setExamTypes([]);
      toast({
        title: "Error",
        description: "Failed to fetch exam types",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ExamTypeFormData) => {
    try {
      const url = selectedExamType
        ? `/api/examType/${selectedExamType.id}`
        : "/api/examType";

      const response = await fetch(url, {
        method: selectedExamType ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: selectedExamType
            ? "Exam type updated successfully"
            : "Exam type created successfully",
        });
        setIsOpen(false);
        form.reset();
        fetchExamTypes();
      } else {
        toast({
          title: "Error",
          description: result.error || "Operation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Operation failed",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/examType/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Exam type deleted successfully",
        });
        fetchExamTypes();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to delete exam type",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete exam type",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (examType: ExamType) => {
    setSelectedExamType(examType);
    form.reset({
      examName: examType.examName,
      totalMarks: Number(examType.totalMarks),
      passingMarks: examType.passingMarks
        ? Number(examType.passingMarks)
        : undefined,
      status: examType.status,
    });
    setIsOpen(true);
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    setSelectedExamType(null);
    form.reset();
  };
  // Pagination calculations
  const totalPages = Math.ceil(examTypes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExamTypes = examTypes.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const ExamTypeCard = ({ examType }: { examType: ExamType }) => (
    <div className="bg-card p-4 rounded-lg shadow-sm space-y-2 border">
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{examType.examName}</h3>
        <div
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            examType.status
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {examType.status ? "Active" : "Inactive"}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
        <div>Total Marks: {examType.totalMarks}</div>
        <div>Pass Marks: {examType.passingMarks || "-"}</div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEdit(examType)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Exam Type</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this exam type? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(examType.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  return (
    <SideBarLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Exam Types</CardTitle>
              <CardDescription>Manage your exam types here</CardDescription>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exam Type
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedExamType ? "Edit Exam Type" : "Create Exam Type"}
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the details for the exam type
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="examName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exam Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="totalMarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Marks</FormLabel>
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
                    <FormField
                      control={form.control}
                      name="passingMarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passing Marks (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <FormDescription>
                              Set whether this exam type is active
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter className="gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDialogClose}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {selectedExamType ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">Loading...</div>
            ) : examTypes.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                No exam types found
              </div>
            ) : (
              <>
                {/* Desktop view */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam Name</TableHead>
                        <TableHead className="">Total Marks</TableHead>
                        <TableHead className="">Pass Marks</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentExamTypes.map((examType) => (
                        <TableRow key={examType.id}>
                          <TableCell>{examType.examName}</TableCell>
                          <TableCell className="">
                            {examType.totalMarks}
                          </TableCell>
                          <TableCell className="">
                            {examType.passingMarks || "-"}
                          </TableCell>
                          <TableCell className="">
                            <div
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                examType.status
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {examType.status ? "Active" : "Inactive"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(examType)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Exam Type
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this exam
                                      type? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(examType.id)}
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

                {/* Mobile view */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {currentExamTypes.map((examType) => (
                    <ExamTypeCard key={examType.id} examType={examType} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
}
