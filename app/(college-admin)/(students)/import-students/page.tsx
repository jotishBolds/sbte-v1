"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import SideBarLayout from "@/components/sidebar/layout";

interface ErrorType {
  error: string;
  duplicates?: Array<{
    email?: string;
    personalEmail?: string;
    rows: number[];
  }>;
  rows?: number[];
  errors?: string[];
}

interface SuccessType {
  count: number;
}

export default function ImportStudentsPage(): JSX.Element {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<ErrorType | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [success, setSuccess] = useState<SuccessType | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(5);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    if (isUploading) {
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) return 95;
          return prev + 5;
        });
      }, 500);
    }
    return () => clearInterval(progressInterval);
  }, [isUploading]);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    if (success) {
      countdownInterval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            router.push("/student-list");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownInterval);
  }, [success, router]);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    handleFileSelection(droppedFile);
  };

  const handleFileSelection = (selectedFile: File | undefined): void => {
    if (
      selectedFile?.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError({ error: "Please select a valid Excel file (.xlsx)" });
      setFile(null);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const selectedFile = event.target.files?.[0];
    handleFileSelection(selectedFile);
  };

  const handleUpload = async (): Promise<void> => {
    if (!file) {
      setError({ error: "Please select a file to upload" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/student/excelImport", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setUploadProgress(100);

      if (!response.ok) {
        setError(data);
      } else {
        setSuccess({
          count: data.count,
        });
      }
    } catch (err) {
      setError({ error: "Failed to upload file. Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = (): void => {
    console.log("Downloading template...");
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Import Students</CardTitle>
            <CardDescription>
              Upload an Excel file containing student information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Download Template Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>

            {/* File Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
              border-2 border-dashed rounded-lg p-8
              transition-colors duration-200 ease-in-out
              ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
              ${!file ? "cursor-pointer" : ""}
            `}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <FileSpreadsheet className="h-8 w-8 text-gray-500" />
                </div>

                {!file ? (
                  <>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Drag and drop your Excel file here, or
                      </p>
                      <Label
                        htmlFor="file-upload"
                        className="cursor-pointer text-blue-600 hover:text-blue-700"
                      >
                        browse to choose a file
                      </Label>
                    </div>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".xlsx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </>
                ) : (
                  <div className="text-center">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <Button
                      variant="ghost"
                      className="mt-2"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-gray-500 text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">
                  Upload Successful!
                </AlertTitle>
                <AlertDescription className="text-green-600">
                  Successfully imported {success.count} student records.
                  Redirecting to student list in {redirectCountdown} seconds...
                </AlertDescription>
              </Alert>
            )}

            {/* Error Messages */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Upload Failed</AlertTitle>
                <AlertDescription>
                  {error.error}
                  {error.duplicates && (
                    <ul className="mt-2 list-disc pl-4">
                      {error.duplicates.map((dup, index) => (
                        <li key={index}>
                          {dup.email &&
                            `Email ${dup.email} found in rows: ${dup.rows.join(
                              ", "
                            )}`}
                          {dup.personalEmail &&
                            `Personal Email ${
                              dup.personalEmail
                            } found in rows: ${dup.rows.join(", ")}`}
                        </li>
                      ))}
                    </ul>
                  )}
                  {error.rows && (
                    <p className="mt-2">
                      Affected rows: {error.rows.join(", ")}
                    </p>
                  )}
                  {error.errors && (
                    <ul className="mt-2 list-disc pl-4">
                      {error.errors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload Students"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
}
