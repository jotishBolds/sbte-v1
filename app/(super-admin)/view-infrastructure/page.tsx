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

interface Infrastructure {
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

// Mobile-friendly card view component
const InfrastructureCard = ({
  infrastructure,
  onDownload,
}: {
  infrastructure: Infrastructure;
  onDownload: (id: string, title: string) => Promise<void>;
}) => (
  <div className="bg-card rounded-lg shadow p-4 mb-4">
    <div className="flex flex-col space-y-2">
      <h3 className="font-medium">{infrastructure.title}</h3>
      <p className="text-sm text-muted-foreground">
        {infrastructure.college.name}
      </p>
      <p className="text-sm text-muted-foreground">
        {format(new Date(infrastructure.createdAt), "PPP")}
      </p>
      <Button
        size="sm"
        variant="outline"
        className="w-full mt-2"
        onClick={() => onDownload(infrastructure.id, infrastructure.title)}
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
    <h3 className="mt-4 text-lg font-medium">
      No infrastructure files available
    </h3>
    <p className="mt-2 text-sm text-muted-foreground px-4">
      Infrastructure files will appear here once they are uploaded by authorized
      users
    </p>
  </div>
);

export default function AdminInfrastructureView() {
  const [infrastructures, setInfrastructures] = useState<Infrastructure[]>([]);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    fetchInfrastructures();

    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  const fetchInfrastructures = async () => {
    try {
      const response = await fetch("/api/infrastructures");
      if (!response.ok) throw new Error("Failed to fetch infrastructures");

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid data format");

      setInfrastructures(data);
    } catch (error) {
      setInfrastructures([]);
      toast({
        title: "Error",
        description: "Failed to fetch infrastructure data",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (infrastructureId: string, title: string) => {
    try {
      const response = await fetch(`/api/infrastructures/${infrastructureId}`);
      if (!response.ok)
        throw new Error("Failed to download infrastructure document");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download infrastructure file",
        variant: "destructive",
      });
    }
  };

  return (
    <SideBarLayout>
      <Card className="w-full max-w-7xl mx-auto p-2 sm:p-4 mt-4 sm:mt-10">
        <CardHeader>
          <CardTitle>Infrastructure Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {infrastructures.length === 0 ? (
            <EmptyState />
          ) : isMobileView ? (
            <div className="space-y-4">
              {infrastructures.map((infrastructure) => (
                <InfrastructureCard
                  key={infrastructure.id}
                  infrastructure={infrastructure}
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
                  {infrastructures.map((infrastructure) => (
                    <TableRow key={infrastructure.id}>
                      <TableCell className="font-medium">
                        {infrastructure.title}
                      </TableCell>
                      <TableCell>{infrastructure.college.name}</TableCell>
                      <TableCell>
                        {format(new Date(infrastructure.createdAt), "PPP")}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownload(
                              infrastructure.id,
                              infrastructure.title
                            )
                          }
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
