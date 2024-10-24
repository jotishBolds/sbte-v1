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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Import, Trash, User2 } from "lucide-react";
import SideBarLayout from "@/components/sidebar/layout";

// Define interfaces for the data structures
interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface College {
  id: string;
  name: string;
}

interface AcademicYear {
  id: string;
  name: string;
}

interface Program {
  id: string;
  name: string;
}

interface Batch {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface SubjectType {
  id: string;
  name: string;
}

interface BatchSubject {
  id: string;
  subject: Subject;
  subjectType: SubjectType;
  batch: Batch;
}

interface AssignedSubject {
  id: string;
  batchSubject: BatchSubject;
}

const assignSubjectsSchema = z.object({
  college: z.string().min(1, "College is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  program: z.string().min(1, "Program is required"),
  batchId: z.string().min(1, "Batch is required"),
  subjectIds: z
    .array(z.string())
    .min(1, "At least one subject must be selected"),
});

type FormValues = z.infer<typeof assignSubjectsSchema>;

const TeacherSubjectAssign: React.FC = () => {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchSubjects, setBatchSubjects] = useState<BatchSubject[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubject[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(assignSubjectsSchema),
    defaultValues: {
      college: "",
      academicYear: "",
      program: "",
      batchId: "",
      subjectIds: [],
    },
  });

  useEffect(() => {
    fetchTeachers();
    fetchColleges();
  }, []);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/teachers");
      if (!response.ok) throw new Error("Failed to fetch teachers");
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await fetch("/api/college");
      if (!response.ok) throw new Error("Failed to fetch colleges");
      const data = await response.json();
      setColleges(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch colleges",
        variant: "destructive",
      });
    }
  };

  const fetchAcademicYears = async (collegeId: string) => {
    try {
      const response = await fetch(`/api/academicYears?collegeId=${collegeId}`);
      if (!response.ok) throw new Error("Failed to fetch academic years");
      const data = await response.json();
      setAcademicYears(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch academic years",
        variant: "destructive",
      });
    }
  };

  const fetchPrograms = async (academicYearId: string) => {
    try {
      const response = await fetch(
        `/api/programs?academicYearId=${academicYearId}`
      );
      if (!response.ok) throw new Error("Failed to fetch programs");
      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch programs",
        variant: "destructive",
      });
    }
  };

  const fetchBatches = async (programId: string) => {
    try {
      const response = await fetch(`/api/batch?programId=${programId}`);
      if (!response.ok) throw new Error("Failed to fetch batches");
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch batches",
        variant: "destructive",
      });
    }
  };

  const fetchBatchSubjects = async (batchId: string) => {
    try {
      const response = await fetch(`/api/batch/${batchId}/subject`);
      if (!response.ok) throw new Error("Failed to fetch batch subjects");
      const data = await response.json();
      setBatchSubjects(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch batch subjects",
        variant: "destructive",
      });
    }
  };

  const fetchAssignedSubjects = async (teacherId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/teacherSubjectAssign/${teacherId}`);
      if (!response.ok) throw new Error("Failed to fetch assigned subjects");
      const data = await response.json();
      setAssignedSubjects(data);
    } catch (error) {
      setAssignedSubjects([]);
      toast({
        title: "Error",
        description: "Failed to fetch assigned subjects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    fetchAssignedSubjects(teacher.id);
  };

  const handleDeleteAssignment = async (assignedSubjectId: string) => {
    if (!selectedTeacher) return;

    try {
      const response = await fetch(
        `/api/teacherSubjectAssign/${selectedTeacher.id}/${assignedSubjectId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete assignment");

      toast({
        title: "Success",
        description: "Subject unassigned successfully",
      });

      fetchAssignedSubjects(selectedTeacher.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unassign subject",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!selectedTeacher) return;

    try {
      const response = await fetch(
        `/api/teacherSubjectAssign/${selectedTeacher.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subjectIds: data.subjectIds }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign subjects");
      }

      toast({
        title: "Success",
        description: "Subjects assigned successfully",
      });

      setIsImportDialogOpen(false);
      form.reset();
      fetchAssignedSubjects(selectedTeacher.id);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message || "Failed to assign subjects",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto p-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Teacher Subject Assignment
            </CardTitle>
            <CardDescription>
              Manage and assign subjects to teachers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Teachers Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Available Teachers</h3>
                  {isLoading && (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black" />
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {teachers.map((teacher) => (
                    <Button
                      key={teacher.id}
                      variant={
                        selectedTeacher?.id === teacher.id
                          ? "secondary"
                          : "outline"
                      }
                      className="w-full justify-start text-left p-4"
                      onClick={() => handleTeacherSelect(teacher)}
                    >
                      <User2 className="w-4 h-4 mr-2" />
                      <div>
                        <div className="font-medium">{teacher.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {teacher.email}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Assigned Subjects Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Assigned Subjects</h3>
                  {selectedTeacher && (
                    <Dialog
                      open={isImportDialogOpen}
                      onOpenChange={setIsImportDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Import className="w-4 h-4 mr-2" />
                          Import Subjects
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Import Subjects</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                          >
                            <FormField
                              control={form.control}
                              name="college"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>College</FormLabel>
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      fetchAcademicYears(value);
                                      form.setValue("academicYear", "");
                                      form.setValue("program", "");
                                      form.setValue("batchId", "");
                                    }}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select college" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {colleges.map((college) => (
                                        <SelectItem
                                          key={college.id}
                                          value={college.id}
                                        >
                                          {college.name}
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
                              name="academicYear"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Academic Year</FormLabel>
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      fetchPrograms(value);
                                      form.setValue("program", "");
                                      form.setValue("batchId", "");
                                    }}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select academic year" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {academicYears.map((year) => (
                                        <SelectItem
                                          key={year.id}
                                          value={year.id}
                                        >
                                          {year.name}
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
                              name="program"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Program</FormLabel>
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      fetchBatches(value);
                                      form.setValue("batchId", "");
                                    }}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select program" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {programs.map((program) => (
                                        <SelectItem
                                          key={program.id}
                                          value={program.id}
                                        >
                                          {program.name}
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
                              name="batchId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Batch</FormLabel>
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      fetchBatchSubjects(value);
                                    }}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select batch" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {batches.map((batch) => (
                                        <SelectItem
                                          key={batch.id}
                                          value={batch.id}
                                        >
                                          {batch.name}
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
                              name="subjectIds"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Subjects</FormLabel>
                                  <div className="space-y-2">
                                    {batchSubjects.map((subject) => (
                                      <div
                                        key={subject.id}
                                        className="flex items-center space-x-2"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={field.value.includes(
                                            subject.id
                                          )}
                                          onChange={(e) => {
                                            const updatedValue = e.target
                                              .checked
                                              ? [...field.value, subject.id]
                                              : field.value.filter(
                                                  (id) => id !== subject.id
                                                );
                                            field.onChange(updatedValue);
                                          }}
                                          className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <label className="text-sm">
                                          {subject.subject.name} (
                                          {subject.subjectType.name})
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsImportDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit">Assign Subjects</Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {selectedTeacher ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedSubjects.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center text-muted-foreground"
                            >
                              No subjects assigned
                            </TableCell>
                          </TableRow>
                        ) : (
                          assignedSubjects.map((assignment) => (
                            <TableRow key={assignment.id}>
                              <TableCell>
                                {assignment.batchSubject.subject.name}
                              </TableCell>
                              <TableCell>
                                {assignment.batchSubject.subjectType.name}
                              </TableCell>
                              <TableCell>
                                {assignment.batchSubject.batch.name}
                              </TableCell>
                              <TableCell>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Unassign Subject
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to unassign this
                                        subject from {selectedTeacher.name}?
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteAssignment(assignment.id)
                                        }
                                        className="bg-red-500 hover:bg-red-700"
                                      >
                                        Unassign
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground p-4 border rounded-md">
                    Select a teacher to view assigned subjects
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
};

export default TeacherSubjectAssign;
