"use client";
import React, { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Upload, Building2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import SideBarLayout from "@/components/sidebar/layout";
import SBTEAdminNotifications from "./list/page";

interface College {
  id: string;
  name: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const NotificationSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  collegeIds: z.array(z.string()).min(1, "Select at least one college"),
  pdfFile: z
    .instanceof(File)
    .refine(
      (file) => file.type === "application/pdf",
      "Only PDF files are allowed"
    )
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "File must be less than 10MB"
    ),
});

type NotificationFormData = z.infer<typeof NotificationSchema>;

export default function ProfessionalNotificationUpload() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(NotificationSchema),
    defaultValues: {
      title: "",
      collegeIds: [],
      pdfFile: undefined,
    },
  });

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch("/api/colleges");
        if (!response.ok) throw new Error("Failed to fetch colleges");
        const data: College[] = await response.json();
        setColleges(data);
      } catch (error) {
        toast({
          title: "Error Loading Colleges",
          description: "Unable to load colleges. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchColleges();
  }, [toast]);

  const onSubmit = async (data: NotificationFormData) => {
    setIsSubmitting(true);
    try {
      // Create the FormData object for the file upload
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("collegeIds", JSON.stringify(data.collegeIds));
      formData.append("pdfFile", data.pdfFile);

      // Call the API endpoint
      const response = await fetch("/api/notification/pdfUpload", {
        method: "POST",
        body: formData,
        // Do not set Content-Type header - browser will set it with boundary for multipart/form-data
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.errors?.[0] || "Upload failed");
      }

      toast({
        title: "Success!",
        description: "Notification uploaded successfully",
        variant: "default",
      });

      // Redirect to notifications page
      router.push("/notification");
    } catch (error) {
      toast({
        title: "Upload Failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const collegeOptions: SelectOption[] = colleges.map((college) => ({
    value: college.id,
    label: college.name,
  }));

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type === "application/pdf") {
        form.setValue("pdfFile", file);
        // Trigger validation after setting value
        form.trigger("pdfFile");
      } else {
        toast({
          title: "Invalid File",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
      }
    },
    [form, toast]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        form.setValue("pdfFile", file);
        // Trigger validation after setting value
        form.trigger("pdfFile");
      }
    },
    [form]
  );

  const removeFile = useCallback(() => {
    form.resetField("pdfFile");
  }, [form]);

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center text-primary">
              Create New Notification
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Upload a notification to share with selected colleges
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Notification Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter a descriptive title"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collegeIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Select Colleges
                      </FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={collegeOptions}
                          onValueChange={field.onChange}
                          value={field.value}
                          placeholder="Select target colleges"
                          disabled={isLoading}
                          maxCount={3}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pdfFile"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload PDF
                      </FormLabel>
                      <FormControl>
                        <div
                          className={`relative border-2 border-dashed rounded-lg p-6 ${
                            dragActive
                              ? "border-primary bg-primary/5"
                              : "border-gray-300 dark:border-gray-700"
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <input
                            {...field}
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="text-center">
                            {value instanceof File ? (
                              <div className="flex items-center justify-center gap-2">
                                <FileText className="h-8 w-8 text-primary" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {value.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(value.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={removeFile}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm font-medium">
                                  Drag and drop your PDF here, or click to
                                  browse
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  Maximum file size: 10MB
                                </p>
                              </>
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
                  className="w-full"
                  disabled={
                    isLoading || isSubmitting || !form.formState.isValid
                  }
                >
                  {isLoading || isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isLoading ? "Loading..." : "Uploading..."}
                    </>
                  ) : (
                    "Create Notification"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <SBTEAdminNotifications />
    </SideBarLayout>
  );
}
