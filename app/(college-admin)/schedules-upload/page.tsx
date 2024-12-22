"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Download, FileUp, Trash2, FolderUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SideBarLayout from "@/components/sidebar/layout";

// Types remain the same
interface Schedules {
  id: string;
  title: string;
  pdfPath: string;
  collegeId: string;
  createdAt: string;
  updatedAt: string;
  college: {
    id: string;
    name: string;
  };
}

const schedulesSchema = z.object({
  title: z.string().min(1, "Title is required"),
  pdfFile: z
    .custom<FileList>()
    .transform((list) => list.item(0))
    .refine((file) => file !== null, "PDF file is required")
    .refine((file) => file?.type === "application/pdf", "File must be a PDF")
    .refine(
      (file) => file?.size <= 10 * 1024 * 1024,
      "File size must be less than 10MB"
    ),
});

type FormData = z.infer<typeof schedulesSchema>;

// Mobile-friendly card view component
const ScheduleCard = ({
  schedule,
  onDelete,
  onDownload,
  isDeleting,
}: {
  schedule: Schedules;
  onDelete: (id: string) => Promise<void>;
  onDownload: (id: string) => Promise<void>;
  isDeleting: string | null;
}) => (
  <div className="bg-card rounded-lg shadow p-4 mb-4">
    <div className="flex flex-col space-y-2">
      <h3 className="font-medium">{schedule.title}</h3>
      <p className="text-sm text-muted-foreground">{schedule.college.name}</p>
      <p className="text-sm text-muted-foreground">
        {format(new Date(schedule.createdAt), "PPP")}
      </p>
      <div className="flex space-x-2 mt-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => onDownload(schedule.id)}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="flex-1"
          onClick={() => onDelete(schedule.id)}
          disabled={isDeleting === schedule.id}
        >
          {isDeleting === schedule.id ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </>
          )}
        </Button>
      </div>
    </div>
  </div>
);

// Upload Form Component (mostly unchanged)
const UploadForm = ({
  isOpen,
  setIsOpen,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(schedulesSchema),
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[90vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Upload Schedule Document</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pdfFile"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>PDF File</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const EmptyState = ({ onUploadClick }: { onUploadClick: () => void }) => (
  <div className="text-center py-8 px-4">
    <FolderUp className="mx-auto h-12 w-12 text-primary" />
    <h3 className="mt-4 text-lg font-medium">No schedule documents</h3>
    <p className="mt-2 text-sm text-gray-500 px-4">
      Get started by uploading your first schedule document
    </p>
    <Button onClick={onUploadClick} className="mt-4">
      <FileUp className="mr-2 h-4 w-4" />
      Upload Schedule Document
    </Button>
  </div>
);

export default function SchedulesManager() {
  const [schedules, setSchedules] = useState<Schedules[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    fetchSchedules();

    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/schedules");
      if (!response.ok) throw new Error("Failed to fetch schedule documents");

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid data format");

      setSchedules(data);
    } catch (error) {
      setSchedules([]);
      toast({
        title: "Error",
        description: "Failed to fetch schedule documents",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("pdfFile", data.pdfFile as File);

      const response = await fetch("/api/schedules", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload schedule document");

      await fetchSchedules();
      setIsOpen(false);
      toast({
        title: "Success",
        description: "Schedule document uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload schedule document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete schedule document");

      setSchedules((prev) => prev.filter((item) => item.id !== id));

      toast({
        title: "Success",
        description: "Schedule document deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete schedule document",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`/api/schedules/${id}`);
      if (!response.ok) throw new Error("Failed to download schedule document");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "schedule.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download schedule document",
        variant: "destructive",
      });
    }
  };

  return (
    <SideBarLayout>
      <Card className="w-full max-w-7xl mx-auto p-2 sm:p-4 mt-4 sm:mt-10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle>Schedule Document Management</CardTitle>
            {schedules.length > 0 && (
              <Button
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto"
              >
                <FileUp className="mr-2 h-4 w-4" />
                Upload Schedule Document
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <EmptyState onUploadClick={() => setIsOpen(true)} />
          ) : isMobileView ? (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        {schedule.title}
                      </TableCell>
                      <TableCell>{schedule.college.name}</TableCell>
                      <TableCell>
                        {format(new Date(schedule.createdAt), "PPP")}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleDownload(schedule.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDelete(schedule.id)}
                            disabled={isDeleting === schedule.id}
                          >
                            {isDeleting === schedule.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        <UploadForm
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </Card>
    </SideBarLayout>
  );
}
