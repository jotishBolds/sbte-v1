"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  FileSpreadsheet,
  Upload,
  AlertCircle,
  Info,
  Download,
} from "lucide-react";
import SideBarLayout from "@/components/sidebar/layout";
import Link from "next/link";

interface Batch {
  id: string;
  name: string;
}

interface BatchSubject {
  id: string;
  subjectId: string;
  subject: {
    name: string;
  };
}

interface ExamType {
  id: string;
  examName: string;
  totalMarks: number;
  passingMarks: number;
}

interface ErrorDetails {
  errors?: string[];
  missingRows?: number[];
  existingRows?: number[];
  exceededMarksRows?: number[];
  message?: string;
  details?: string;
}

const formSchema = z.object({
  examTypeId: z.string().min(1, "Exam type is required"),
  batchId: z.string().min(1, "Batch is required"),
  batchSubjectId: z.string().min(1, "Subject is required"),
  file: z.custom<File>((val) => val instanceof File, "Please select a file"),
});

export default function ExamMarksImport() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchSubjects, setBatchSubjects] = useState<BatchSubject[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examTypeId: "",
      batchId: "",
      batchSubjectId: "",
      file: undefined,
    },
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [batchesResponse, examTypesResponse] = await Promise.all([
          fetch("/api/batch"),
          fetch("/api/examType"),
        ]);

        if (!batchesResponse.ok || !examTypesResponse.ok) {
          throw new Error("Failed to fetch initial data");
        }

        const batchesData = await batchesResponse.json();
        const examTypesData = await examTypesResponse.json();

        setBatches(batchesData);
        setExamTypes(examTypesData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load initial data",
          variant: "destructive",
        });
      }
    };

    fetchInitialData();
  }, [toast]);

  useEffect(() => {
    const batchId = form.watch("batchId");
    if (batchId) {
      const fetchBatchSubjects = async () => {
        try {
          const response = await fetch(`/api/batch/${batchId}/subject`);
          if (!response.ok) throw new Error("Failed to fetch subjects");
          const data = await response.json();
          setBatchSubjects(data);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load subjects",
            variant: "destructive",
          });
        }
      };
      fetchBatchSubjects();
    }
  }, [form.watch("batchId"), toast]);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session?.user?.collegeId) {
      toast({
        title: "Error",
        description: "No college ID found in session",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", values.file);
    formData.append("examTypeId", values.examTypeId);
    formData.append("batchSubjectId", values.batchSubjectId);

    try {
      setUploadProgress(0);
      const response = await fetch("/api/examMarks/excelImport", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Standardize error details
        const errorInfo: ErrorDetails = {
          errors: data.errors || [data.error || "An unknown error occurred"],
          missingRows: data.missingRows || [],
          existingRows: data.existingRows || [],
          exceededMarksRows: data.exceededMarksRows || [],
          message: data.message,
          details: data.details,
        };

        setErrorDetails(errorInfo);
        setShowErrorDialog(true);
        return;
      }

      toast({
        title: "Success",
        description: data.message || "Exam marks imported successfully",
        variant: "default",
      });

      form.reset();
      resetFileInput();
      setUploadProgress(100);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      const errorInfo: ErrorDetails = {
        errors: [errorMessage],
      };

      setErrorDetails(errorInfo);
      setShowErrorDialog(true);
    }
  };

  // Render method for displaying error details
  const renderErrorDetails = () => {
    if (!errorDetails) return null;

    return (
      <div className="space-y-4">
        {/* General Errors */}
        {errorDetails.errors &&
          errorDetails.errors.length > 0 &&
          errorDetails.errors.map((error, index) => (
            <Alert key={`error-${index}`} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ))}

        {/* Specific Error Categories */}
        {errorDetails.missingRows && errorDetails.missingRows.length > 0 && (
          <div className="bg-yellow-50 p-3 rounded-md">
            <p className="font-semibold text-yellow-800">
              Missing Enrollment Numbers
            </p>
            <p className="text-sm text-yellow-700">
              Rows with missing or invalid enrollment numbers:{" "}
              {errorDetails.missingRows.join(", ")}
            </p>
          </div>
        )}

        {errorDetails.existingRows && errorDetails.existingRows.length > 0 && (
          <div className="bg-orange-50 p-3 rounded-md">
            <p className="font-semibold text-orange-800">Duplicate Entries</p>
            <p className="text-sm text-orange-700">
              Rows with duplicate entries:{" "}
              {errorDetails.existingRows.join(", ")}
            </p>
          </div>
        )}

        {errorDetails.exceededMarksRows &&
          errorDetails.exceededMarksRows.length > 0 && (
            <div className="bg-red-50 p-3 rounded-md">
              <p className="font-semibold text-red-800">Marks Exceeded</p>
              <p className="text-sm text-red-700">
                Rows with marks exceeding total marks:{" "}
                {errorDetails.exceededMarksRows.join(", ")}
              </p>
            </div>
          )}

        {/* Additional Details if Available */}
        {errorDetails.message && (
          <p className="text-sm italic text-gray-600">{errorDetails.message}</p>
        )}
        {errorDetails.details && (
          <p className="text-xs text-gray-500">
            Details: {errorDetails.details}
          </p>
        )}
      </div>
    );
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card className="max-w-7xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6" />
              Import Exam Marks
            </CardTitle>
            <CardDescription>
              Upload an Excel file containing student exam marks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="batchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a batch" />
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

                <FormField
                  control={form.control}
                  name="batchSubjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!form.watch("batchId")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {batchSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.subject.name}
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
                  name="examTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select exam type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {examTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.examName} ({type.totalMarks} marks)
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
                  name="file"
                  render={() => (
                    <FormItem>
                      <FormLabel>Excel File</FormLabel>
                      <FormControl>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              form.setValue("file", file, {
                                shouldValidate: true,
                              });
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload an Excel file (.xlsx) containing student marks
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-muted-foreground text-center">
                      {uploadProgress === 100
                        ? "Upload complete"
                        : "Uploading..."}
                    </p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="flex-grow"
                >
                  <Link href="/templates/exam_marks_template.xlsx" download>
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Link>
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Marks
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                Make sure your Excel file follows the required format.
              </AlertDescription>
            </Alert>
          </CardFooter>
        </Card>

        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Import Errors</AlertDialogTitle>
              <AlertDialogDescription>
                {renderErrorDetails()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Acknowledge</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SideBarLayout>
  );
}
