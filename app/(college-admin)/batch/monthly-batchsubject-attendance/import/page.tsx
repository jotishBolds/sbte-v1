"use client";
import { useState } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Upload, FileSpreadsheet, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SideBarLayout from "@/components/sidebar/layout";

const importFormSchema = z.object({
  file: z.instanceof(File, {
    message: "Please select an Excel file",
  }),
  monthlyBatchSubjectClassesId: z.string({
    required_error: "Please select a batch subject",
  }),
});

type ImportFormValues = z.infer<typeof importFormSchema>;

export default function AttendanceImport() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [importResponse, setImportResponse] = useState<{
    message?: string;
    errors?: string[];
    missingStudentRows?: number[];
    duplicateRows?: number[];
  } | null>(null);

  const { data: monthlyClasses, isLoading: isLoadingBatchSubjects } = useQuery({
    queryKey: ["monthlyBatchSubjectClasses"],
    queryFn: async () => {
      const response = await fetch("/api/monthlyBatchSubjectClasses");
      if (!response.ok) throw new Error("Failed to fetch batch subjects");
      return response.json();
    },
  });

  const getSubjectName = (monthlyClass: any) => {
    const subjectName =
      monthlyClass.batchSubject?.subject?.name || "Unnamed Subject";
    const batchName = monthlyClass.batchSubject?.batch?.name || "Unnamed Batch";
    return `${subjectName} (${batchName})`;
  };

  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
  });

  const onSubmit = async (values: ImportFormValues) => {
    try {
      setIsSubmitting(true);
      setImportResponse(null);

      const formData = new FormData();
      formData.append("file", values.file);
      formData.append(
        "monthlyBatchSubjectClassesId",
        values.monthlyBatchSubjectClassesId
      );

      const response = await fetch(
        "/api/batchSubjectAttendance/monthlyBatchSubjectAttendance/excelImport",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setImportResponse(data);
        return;
      }

      setImportResponse({ message: data.message });
      form.reset();
      setSelectedFileName("");
      router.refresh();
    } catch (error) {
      setImportResponse({
        errors: ["An unexpected error occurred while importing attendance."],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SideBarLayout>
      <Card className="w-full max-w-7xl mx-auto my-4 md:my-8 shadow-lg">
        <CardHeader className="space-y-2 md:space-y-4">
          <CardTitle className="text-2xl md:text-3xl font-bold text-center">
            Import Attendance
          </CardTitle>
          <CardDescription className="text-center text-sm md:text-base">
            Upload an Excel file (.xlsx) containing student attendance records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="monthlyBatchSubjectClassesId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Batch Subject
                    </FormLabel>
                    <Select
                      disabled={isLoadingBatchSubjects}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select batch subject">
                            {field.value && monthlyClasses
                              ? getSubjectName(
                                  monthlyClasses.find(
                                    (mc: any) => mc.id === field.value
                                  )
                                )
                              : "Select batch subject"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {monthlyClasses?.map((monthlyClass: any) => (
                          <SelectItem
                            key={monthlyClass.id}
                            value={monthlyClass.id}
                            className="py-4 px-3 hover:bg-accent cursor-pointer"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="font-medium">
                                {monthlyClass.batchSubject?.subject?.name ||
                                  "Unnamed Subject"}{" "}
                                (
                                {monthlyClass.batchSubject?.batch?.name ||
                                  "Unnamed Batch"}
                                )
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Month: {monthlyClass.month} | Theory:{" "}
                                {monthlyClass.completedTheoryClasses ?? 0}/
                                {monthlyClass.totalTheoryClasses ?? 0} |
                                Practical:{" "}
                                {monthlyClass.completedPracticalClasses ?? 0}/
                                {monthlyClass.totalPracticalClasses ?? 0}
                              </div>
                            </div>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Excel File
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div
                          className={`
                        border-2 border-dashed rounded-lg p-8
                        ${
                          selectedFileName
                            ? "border-green-400 bg-green-50"
                            : "border-gray-300 hover:border-gray-400"
                        }
                        transition-colors duration-200 cursor-pointer
                        flex flex-col items-center justify-center gap-4
                      `}
                        >
                          <Input
                            type="file"
                            accept=".xlsx"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                field.onChange(file);
                                setSelectedFileName(file.name);
                              }
                            }}
                          />
                          {selectedFileName ? (
                            <div className="flex flex-col items-center gap-2">
                              <FileSpreadsheet className="h-12 w-12 text-green-500" />
                              <span className="text-sm font-medium text-green-600">
                                {selectedFileName}
                              </span>
                              <span className="text-xs text-green-500">
                                Click or drag to change file
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="h-12 w-12 text-gray-400" />
                              <span className="text-sm font-medium">
                                Click or drag and drop
                              </span>
                              <span className="text-xs text-gray-500">
                                Supports Excel (.xlsx) files
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto md:min-w-[200px] h-8text-base font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Import Attendance
                  </>
                )}
              </Button>
            </form>
          </Form>

          {importResponse && (
            <div className="mt-8 space-y-4">
              {importResponse.message && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertTitle className="text-green-800 font-semibold">
                    Success
                  </AlertTitle>
                  <AlertDescription className="text-green-700">
                    {importResponse.message}
                  </AlertDescription>
                </Alert>
              )}

              {importResponse.errors?.map((error, index) => (
                <Alert
                  key={index}
                  variant="destructive"
                  className="flex items-start gap-2"
                >
                  <X className="h-5 w-5 mt-0.5" />
                  <div>
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </div>
                </Alert>
              ))}

              {(importResponse.missingStudentRows?.length || 0) > 0 && (
                <Alert variant="destructive" className="flex items-start gap-2">
                  <X className="h-5 w-5 mt-0.5" />
                  <div>
                    <AlertTitle>Missing Students</AlertTitle>
                    <AlertDescription>
                      Invalid or missing enrollment numbers in rows:{" "}
                      {importResponse.missingStudentRows?.join(", ")}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {(importResponse.duplicateRows?.length || 0) > 0 && (
                <Alert variant="destructive" className="flex items-start gap-2">
                  <X className="h-5 w-5 mt-0.5" />
                  <div>
                    <AlertTitle>Duplicate Entries</AlertTitle>
                    <AlertDescription>
                      Duplicate entries found in rows:{" "}
                      {importResponse.duplicateRows?.join(", ")}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </SideBarLayout>
  );
}
