// File: app/gradeCard/[id]/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import SideBarLayout from "@/components/sidebar/layout";
import { useToast } from "@/hooks/use-toast";

interface SubjectGrade {
  id: string;
  batchSubject: {
    subject: {
      name: string;
    };
  };
  credit: number;
  grade: string | null;
  gradePoint: number | null;
  qualityPoint: number | null;
  internalMarks: number | null;
  externalMarks: number | null;
}

interface GradeCard {
  id: string;
  cardNo: string;
  student: {
    name: string;
    enrollmentNo: string;
  };
  semester: {
    name: string;
    numerical: number;
  };
  batch: {
    name: string;
  };
  totalQualityPoint: number | null;
  totalGradedCredit: number | null;
  gpa: number | null;
  cgpa: number | null;
  subjectGrades: SubjectGrade[];
}

export default function GradeCardViewPage() {
  const params = useParams();
  const { toast } = useToast();
  const [gradeCard, setGradeCard] = useState<GradeCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGradeCard = async () => {
      try {
        const response = await fetch(`/api/gradeCard/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch grade card");
        }
        const data = await response.json();
        setGradeCard(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load grade card",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchGradeCard();
    }
  }, [params.id, toast]);

  if (loading) {
    return (
      <SideBarLayout>
        <div className="container mx-auto p-4">Loading...</div>
      </SideBarLayout>
    );
  }

  if (!gradeCard) {
    return (
      <SideBarLayout>
        <div className="container mx-auto p-4">Grade card not found</div>
      </SideBarLayout>
    );
  }
  const downloadPDF = async () => {
    try {
      // Show loading state
      toast({
        title: "Generating PDF",
        description: "Please wait while we prepare your download...",
      });

      // Make request to the PDF endpoint
      const response = await fetch(`/api/gradeCard/${params.id}/pdf`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = `GradeCard_${gradeCard?.student.enrollmentNo}_Sem${gradeCard?.semester.numerical}.pdf`;

      // Append the link to the body
      document.body.appendChild(link);

      // Click the link to trigger download
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Grade card PDF has been downloaded",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to download PDF",
        variant: "destructive",
      });
    }
  };
  const calculateTotalCredits = () => {
    return gradeCard.subjectGrades.reduce(
      (sum, subject) => sum + subject.credit,
      0
    );
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/gradecard-view">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Grade Cards
            </Button>
          </Link>
          <Button onClick={downloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Grade Card Details</span>
              <Badge variant="secondary">Card No: {gradeCard.cardNo}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Student</h3>
                <p className="text-lg font-semibold">
                  {gradeCard.student.name}
                </p>
                <p className="text-sm text-gray-600">
                  Enrollment: {gradeCard.student.enrollmentNo}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Batch</h3>
                <p className="text-lg font-semibold">{gradeCard.batch.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Semester</h3>
                <p className="text-lg font-semibold">
                  {gradeCard.semester.name} (Semester{" "}
                  {gradeCard.semester.numerical})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Total Credits
                </h3>
                <p className="text-lg font-semibold">
                  {calculateTotalCredits()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">GPA</h3>
                <p className="text-lg font-semibold">
                  {gradeCard.gpa ? gradeCard.gpa.toFixed(2) : "N/A"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">CGPA</h3>
                <p className="text-lg font-semibold">
                  {gradeCard.cgpa ? gradeCard.cgpa.toFixed(2) : "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Subject Grades</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead>Internal Marks</TableHead>
                    <TableHead>External Marks</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Grade Point</TableHead>
                    <TableHead>Quality Point</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gradeCard.subjectGrades.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>{subject.batchSubject.subject.name}</TableCell>
                      <TableCell>{subject.credit}</TableCell>
                      <TableCell>{subject.internalMarks ?? "N/A"}</TableCell>
                      <TableCell>{subject.externalMarks ?? "N/A"}</TableCell>
                      <TableCell>
                        {subject.grade ? (
                          <Badge variant="outline">{subject.grade}</Badge>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>{subject.gradePoint ?? "N/A"}</TableCell>
                      <TableCell>{subject.qualityPoint ?? "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
}
