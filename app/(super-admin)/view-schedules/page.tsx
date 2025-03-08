"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FolderUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import SideBarLayout from "@/components/sidebar/layout";

interface Schedules {
  id: string;
  title: string;
  pdfPath: string; // This stores the S3 URL
  collegeId: string;
  createdAt: string;
  updatedAt: string;
  college: {
    id: string;
    name: string;
  };
}

// Mobile-friendly card view component
const ScheduleCard = ({
  schedule,
  onDownload,
}: {
  schedule: Schedules;
  onDownload: (pdfPath: string) => Promise<void>;
}) => (
  <div className="bg-card rounded-lg shadow p-4 mb-4">
    <div className="flex flex-col space-y-2">
      <h3 className="font-medium">{schedule.title}</h3>
      <p className="text-sm text-muted-foreground">{schedule.college.name}</p>
      <p className="text-sm text-muted-foreground">
        {format(new Date(schedule.createdAt), "PPP")}
      </p>
      <Button
        size="sm"
        variant="outline"
        className="w-full mt-2"
        onClick={() => onDownload(schedule.pdfPath)}
      >
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </Button>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-8 px-4">
    <FolderUp className="mx-auto h-12 w-12 text-muted-foreground" />
    <h3 className="mt-4 text-lg font-medium">No schedules available</h3>
    <p className="mt-2 text-sm text-muted-foreground px-4">
      Schedules will appear here once they are uploaded by authorized users
    </p>
  </div>
);

export default function AdminSchedulesView() {
  const [schedules, setSchedules] = useState<Schedules[]>([]);
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
      if (!response.ok) throw new Error("Failed to fetch schedules");

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid data format");

      setSchedules(data);
    } catch (error) {
      setSchedules([]);
      toast({
        title: "Error",
        description: "Failed to fetch schedules",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (pdfPath: string) => {
    try {
      const response = await fetch(pdfPath);
      if (!response.ok) throw new Error("Failed to download schedule");

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
        description: "Failed to download schedule",
        variant: "destructive",
      });
    }
  };

  return (
    <SideBarLayout>
      <Card className="w-full max-w-7xl mx-auto p-2 sm:p-4 mt-4 sm:mt-10">
        <CardHeader>
          <CardTitle>Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <EmptyState />
          ) : isMobileView ? (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onDownload={handleDownload}
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
                    <TableHead>Action</TableHead>
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(schedule.pdfPath)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </SideBarLayout>
  );
}
