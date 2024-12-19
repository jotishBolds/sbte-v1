"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Download, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Certificate, PaymentStatus } from "@/types/types";

const CertificateList = () => {
  const { data: session } = useSession();
  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [studentId, setStudentId] = React.useState<string | null>(null);

  // First, fetch the student ID for the logged-in user
  React.useEffect(() => {
    const fetchStudentId = async () => {
      try {
        const response = await fetch("/api/studentOperations/student");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch student information"
          );
        }
        const data = await response.json();
        setStudentId(data.id);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch student information"
        );
        setIsLoading(false);
      }
    };

    if (session) {
      fetchStudentId();
    }
  }, [session]);

  // Then fetch certificates once we have the student ID
  React.useEffect(() => {
    const fetchCertificates = async () => {
      if (!studentId) return;

      try {
        const response = await fetch(
          `/api/studentOperations/${studentId}/certificate`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch certificates");
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setCertificates(data);
        } else if (data.message === "No certificates found") {
          // Specifically handle the "No certificates" case
          setCertificates([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      fetchCertificates();
    }
  }, [studentId]);

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return "bg-green-500";
      case PaymentStatus.PENDING:
        return "bg-yellow-500";
      case PaymentStatus.FAILED:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Handle unauthorized or forbidden cases specifically
  if (error === "Unauthorized" || error === "Forbidden") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don&apos;t have permission to view these certificates. Please
          contact your administrator if you believe this is an error.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">My Certificates</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <Table>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  You currently have no certificates. Certificates will appear
                  here once they are issued.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate Type</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Issue Date
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Created At
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">
                      {cert.certificateType.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {cert.issueDate
                        ? new Date(cert.issueDate).toLocaleDateString()
                        : "Not issued"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getPaymentStatusColor(
                          cert.paymentStatus
                        )} text-white`}
                      >
                        {cert.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(cert.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificateList;
