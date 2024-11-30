"use client";
import React, { useState, useRef } from "react";
import { Upload, File, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadBalancingService } from "@/services/load-balance-service";
import { toast } from "sonner";

export default function LoadBalancingUpload() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast.error("Please select a valid PDF file");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("pdfFile", file);

    try {
      setIsUploading(true);
      const response = await loadBalancingService.uploadPdf(formData);
      toast.success("PDF uploaded successfully");

      // Reset form
      setTitle("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload PDF");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full  mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-6 h-6" />
          PDF Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="pdf-title" className="block text-sm font-medium ">
              PDF Title
            </label>
            <Input
              id="pdf-title"
              type="text"
              placeholder="Enter PDF title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
              required
            />
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <label htmlFor="pdf-file" className="block text-sm font-medium">
              Select PDF
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              required
            />
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={triggerFileInput}
              >
                <FileText className="w-4 h-4" />
                Choose File
              </Button>
              {file && (
                <div className="flex items-center text-sm ">
                  <File className="w-4 h-4 mr-2" />
                  {file.name}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full mt-4" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload PDF"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
