"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
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
import { zodResolver } from "@hookform/resolvers/zod";

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

interface ErrorDetails {
  errors?: any[];
  missingStudents?: {
    enrollmentNo?: string;
    row?: number;
    error: string;
  }[];
  existingRecords?: {
    enrollmentNo: string;
    message: string;
  }[];
  message?: string;
  details?: string;
}

const formSchema = z.object({
  batchId: z.string().min(1, "Batch is required"),
  batchSubjectId: z.string().min(1, "Subject is required"),
  file: z.custom<File>((val) => val instanceof File, "Please select a file"),
});

export default function InternalMarksImport() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  // Initialize batches as an empty array to prevent the "map is not a function" error
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchSubjects, setBatchSubjects] = useState<BatchSubject[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchId: "",
      batchSubjectId: "",
      file: undefined,
    },
  });

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch("/api/batch");
        if (!response.ok) throw new Error("Failed to fetch batches");
        const data = await response.json();
        // Ensure data is an array before setting it
        if (Array.isArray(data)) {
          setBatches(data);
        } else {
          console.error("Expected array but got:", data);
          setBatches([]);
          toast({
            title: "Error",
            description: "Invalid batch data format received",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
        setBatches([]);
        toast({
          title: "Error",
          description: "Failed to load batches",
          variant: "destructive",
        });
      }
    };

    fetchBatches();
  }, [toast]);

  useEffect(() => {
    const batchId = form.watch("batchId");
    if (batchId) {
      const fetchBatchSubjects = async () => {
        try {
          const response = await fetch(`/api/batch/${batchId}/subject`);
          if (!response.ok) throw new Error("Failed to fetch subjects");
          const data = await response.json();
          // Ensure data is an array before setting it
          if (Array.isArray(data)) {
            setBatchSubjects(data);
          } else {
            console.error("Expected array but got:", data);
            setBatchSubjects([]);
            toast({
              title: "Error",
              description: "Invalid subject data format received",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error fetching batch subjects:", error);
          setBatchSubjects([]);
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
    formData.append("batchSubjectId", values.batchSubjectId);

    try {
      setUploadProgress(10);
      const response = await fetch("/api/gradeCard/importInternal", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(70);
      const data = await response.json();
      setUploadProgress(90);

      if (!response.ok) {
        const errorInfo: ErrorDetails = {
          errors: data.errors || [],
          missingStudents: data.missingStudents || [],
          existingRecords: data.existingRecords || [],
          message: data.message || "An error occurred during import",
          details: data.details,
        };

        setErrorDetails(errorInfo);
        setShowErrorDialog(true);
        setUploadProgress(0);
        return;
      }

      toast({
        title: "Success",
        description:
          data.message ||
          `Successfully imported ${data.successCount} records. Redirecting to grade cards in 5 seconds...`,
        variant: "default",
      });

      form.reset();
      resetFileInput();
      setUploadProgress(100);

      // Redirect after 5 seconds
      setTimeout(() => {
        router.push("/gradecard-view");
      }, 5000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      const errorInfo: ErrorDetails = {
        errors: [{ error: errorMessage }],
      };

      setErrorDetails(errorInfo);
      setShowErrorDialog(true);
      setUploadProgress(0);
    }
  };

  const renderErrorDetails = () => {
    if (!errorDetails) return null;

    return (
      <div className="space-y-4">
        {errorDetails.errors && errorDetails.errors.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold">Validation Errors:</p>
            {errorDetails.errors.map((error, index) => (
              <Alert key={`error-${index}`} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Row {error.row}: {JSON.stringify(error.error)}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {errorDetails.missingStudents &&
          errorDetails.missingStudents.length > 0 && (
            <div className="bg-yellow-50 p-3 rounded-md">
              <p className="font-semibold text-yellow-800">Missing Students</p>
              <ul className="text-sm text-yellow-700 space-y-1 mt-2">
                {errorDetails.missingStudents.map((item, index) => (
                  <li key={`missing-${index}`}>
                    {item.enrollmentNo
                      ? `Enrollment: ${item.enrollmentNo}`
                      : `Row: ${item.row}`}{" "}
                    - {item.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

        {errorDetails.existingRecords &&
          errorDetails.existingRecords.length > 0 && (
            <div className="bg-orange-50 p-3 rounded-md">
              <p className="font-semibold text-orange-800">Existing Records</p>
              <ul className="text-sm text-orange-700 space-y-1 mt-2">
                {errorDetails.existingRecords.map((item, index) => (
                  <li key={`existing-${index}`}>
                    Enrollment: {item.enrollmentNo} - {item.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

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
              Import Internal Marks
            </CardTitle>
            <CardDescription>
              Upload an Excel file containing student internal marks (max 30
              marks)
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
                          {Array.isArray(batches) ? (
                            batches.map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading">
                              Loading batches...
                            </SelectItem>
                          )}
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
                          {Array.isArray(batchSubjects) ? (
                            batchSubjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.subject.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading">
                              Loading subjects...
                            </SelectItem>
                          )}
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
                        Upload an Excel file (.xlsx) containing student
                        enrollment numbers and internal marks
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
                  <Link href="/templates/internal_marks_template.xlsx" download>
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
                      Import Internal Marks
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
                Internal marks must be between 0 and 30. Make sure your Excel
                file follows the required format with enrollment numbers in
                column C and internal marks in column D.
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
