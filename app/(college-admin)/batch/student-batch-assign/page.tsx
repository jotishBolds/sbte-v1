"use client";
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import StudentBatchTable from "./batch-table";
import SideBarLayout from "@/components/sidebar/layout";

// Define interfaces for our data types
interface Student {
  id: string;
  name: string;
  enrollmentNo: string;
  gender: string;
  personalEmail: string;
  phoneNo: string;
}

interface Batch {
  id: string;
  name: string;
}

interface AssignedStudent {
  student: Student;
  batchStatus: "PROMOTED" | "IN_PROGRESS" | "RESIT";
}

const assignStudentsSchema = z.object({
  batchId: z.string().min(1, "Batch is required"),
  studentIds: z
    .array(z.string())
    .min(1, "At least one student must be selected"),
});

type FormValues = z.infer<typeof assignStudentsSchema>;

const StudentBatchAssign: React.FC = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>("");
  const [openMultiSelect, setOpenMultiSelect] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(assignStudentsSchema),
    defaultValues: {
      batchId: "",
      studentIds: [],
    },
  });

  useEffect(() => {
    fetchBatches();
    fetchStudents();
  }, []);

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/batch");
      if (!response.ok) throw new Error("Failed to fetch batches");
      const data = await response.json();
      setBatches(Array.isArray(data) ? data : []);
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

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/student");
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/batch/${data.batchId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: data.studentIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign students");
      }

      const responseData = await response.json();
      toast({
        title: "Success",
        description: responseData.message,
      });

      await fetchAssignedStudents(data.batchId);
      form.reset({ batchId: data.batchId, studentIds: [] });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to assign students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignedStudents = async (batchId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/batch/${batchId}/students`);
      if (!response.ok) throw new Error("Failed to fetch assigned students");
      const data = await response.json();
      setAssignedStudents(data || []); // Use empty array if data is undefined
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assigned students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/batch/${form.getValues("batchId")}/students/${studentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove student");
      }

      await fetchAssignedStudents(form.getValues("batchId"));
      toast({
        title: "Success",
        description: "Student removed from batch successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to remove student",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchChange = async (batchId: string) => {
    form.setValue("batchId", batchId);
    await fetchAssignedStudents(batchId);
  };

  const handleStatusUpdate = async (
    studentIds: string[],
    batchStatus: string
  ) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/batch/${form.getValues("batchId")}/students`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentIds, batchStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      await fetchAssignedStudents(form.getValues("batchId"));
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Update filteredStudents and availableStudents logic to include fallback defaults
  const filteredStudents =
    students?.filter((student) =>
      student?.name
        ?.toLowerCase()
        .includes((studentSearchTerm || "").toLowerCase())
    ) ?? [];

  const availableStudents =
    filteredStudents?.filter(
      (student) =>
        !assignedStudents?.some((as) => as?.student?.id === student?.id)
    ) ?? [];

  const getSelectedStudents = (selectedIds: string[]) => {
    return (
      students?.filter((student) => selectedIds.includes(student.id)) || []
    );
  };

  // Handle student selection with added default array for field.value
  const handleStudentSelection = (
    studentId: string,
    field: { value: string[]; onChange: (value: string[]) => void }
  ) => {
    const currentIds = field.value || []; // Ensure currentIds is always an array
    const isSelected = currentIds.includes(studentId);

    // Update selected students based on whether student is already selected or not
    field.onChange(
      isSelected
        ? currentIds.filter((id) => id !== studentId)
        : [...currentIds, studentId]
    );
  };

  return (
    <SideBarLayout>
      <Card className="shadow-lg w-full max-w-[95vw] mx-auto">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold">
            Assign Students to Batch
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Manage and assign students to batches efficiently
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-6"
            >
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Batch Selection Field */}
                <FormField
                  control={form.control}
                  name="batchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">
                        Batch
                      </FormLabel>
                      <Select
                        onValueChange={handleBatchChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {batches.map((batch) => (
                            <SelectItem key={batch.id} value={batch.id}>
                              {batch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Student Selection Field */}
                <FormField
                  control={form.control}
                  name="studentIds"
                  render={({ field }) => (
                    <FormItem className="relative w-full">
                      <FormLabel className="text-sm sm:text-base">
                        Select Students
                      </FormLabel>
                      <Popover
                        open={openMultiSelect}
                        onOpenChange={setOpenMultiSelect}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              type="button"
                              className={cn(
                                "w-full justify-between text-sm sm:text-base",
                                !field.value?.length && "text-muted-foreground"
                              )}
                            >
                              <span className="truncate">
                                {field.value?.length
                                  ? `${field.value.length} students selected`
                                  : "Select students"}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[100vw] p-0 sm:w-[var(--radix-popover-trigger-width)] left-0 right-0"
                          align="start"
                          side="bottom"
                          sideOffset={4}
                          style={
                            {
                              "--radix-popover-content-transform-origin":
                                "var(--radix-popover-trigger-width)",
                              maxWidth: "calc(100vw - 32px)",
                            } as React.CSSProperties
                          }
                        >
                          <Command className="w-full">
                            <CommandInput
                              placeholder="Search students..."
                              onValueChange={setStudentSearchTerm}
                              className="text-sm sm:text-base"
                            />
                            <CommandList>
                              <CommandEmpty>No students found.</CommandEmpty>
                              <CommandGroup>
                                <ScrollArea className="h-[200px] sm:h-[300px]">
                                  {availableStudents.map((student) => (
                                    <CommandItem
                                      key={student.id}
                                      onSelect={() =>
                                        handleStudentSelection(student.id, {
                                          value: field.value || [],
                                          onChange: field.onChange,
                                        })
                                      }
                                      className="text-sm sm:text-base"
                                    >
                                      <div className="flex items-center w-full justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                          <Check
                                            className={cn(
                                              "h-4 w-4",
                                              field.value?.includes(student.id)
                                                ? "opacity-100 text-green-400"
                                                : "opacity-20 text-red-500"
                                            )}
                                          />
                                          <span>{student.name}</span>
                                        </div>
                                        <div className="flex items-start justify-items-start gap-2 flex-wrap">
                                          <Badge
                                            variant="outline"
                                            className="text-xs sm:text-sm"
                                          >
                                            {student.enrollmentNo}
                                          </Badge>
                                          <Badge
                                            variant="secondary"
                                            className="text-xs sm:text-sm"
                                          >
                                            {student.gender}
                                          </Badge>
                                        </div>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </ScrollArea>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {field.value?.length > 0 && (
                        <div className="mt-2">
                          <ScrollArea className="h-[80px] sm:h-[100px] w-full rounded-md border p-2">
                            <div className="flex flex-wrap gap-2">
                              {getSelectedStudents(field.value || []).map(
                                (student) => (
                                  <Badge
                                    key={student.id}
                                    variant="secondary"
                                    className="cursor-pointer text-xs sm:text-sm"
                                    onClick={() =>
                                      handleStudentSelection(student.id, {
                                        value: field.value || [],
                                        onChange: field.onChange,
                                      })
                                    }
                                  >
                                    {student.name}
                                    <span className="ml-1 text-xs">×</span>
                                  </Badge>
                                )
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={
                    isLoading || !(form.getValues("studentIds")?.length > 0)
                  }
                >
                  {isLoading ? "Assigning..." : "Assign Students"}
                </Button>
              </div>
            </form>
          </Form>

          {form.getValues("batchId") && (
            <div className="mt-6 sm:mt-8">
              <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
                Assigned Students
              </h3>
              <div className="overflow-x-auto">
                <StudentBatchTable
                  students={assignedStudents}
                  batchId={form.getValues("batchId")}
                  onStatusUpdate={handleStatusUpdate}
                  onDeleteStudent={handleDeleteStudent}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </SideBarLayout>
  );
};

export default StudentBatchAssign;
