// app/certificates/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Certificate, CertificateType, Student } from "@/types/types";
import { CertificateForm } from "./cert-form";
import { CertificateTable } from "./cert-table";
import SideBarLayout from "@/components/sidebar/layout";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [certificateTypes, setCertificateTypes] = useState<CertificateType[]>(
    []
  );
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCertificates();
    fetchStudents();
    fetchCertificateTypes();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch("/api/certificateIssuance/singleStudent");
      if (!response.ok) throw new Error("Failed to fetch certificates");
      const data = await response.json();
      setCertificates(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch certificates",
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/student");
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    }
  };

  const fetchCertificateTypes = async () => {
    try {
      const response = await fetch("/api/certificateType");
      if (!response.ok) throw new Error("Failed to fetch certificate types");
      const data = await response.json();
      setCertificateTypes(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch certificate types",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: any, isMultipleMode: boolean) => {
    try {
      let url = selectedCertificate
        ? `/api/certificateIssuance/singleStudent/${selectedCertificate.id}`
        : `/api/certificateIssuance/${
            isMultipleMode ? "multipleStudents" : "singleStudent"
          }`;

      const response = await fetch(url, {
        method: selectedCertificate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save certificate");
      }

      const responseData = await response.json();

      toast({
        title: "Success",
        description: isMultipleMode
          ? `Certificates issued successfully${
              responseData.alreadyAssignedStudentIds?.length
                ? `. ${responseData.alreadyAssignedStudentIds.length} students already had this certificate.`
                : ""
            }`
          : `Certificate ${
              selectedCertificate ? "updated" : "created"
            } successfully`,
      });

      setIsDialogOpen(false);
      setSelectedCertificate(null);
      fetchCertificates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save certificate",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsDialogOpen(true);
  };

  const handleDelete = async (certificateId: string) => {
    try {
      const response = await fetch(
        `/api/certificateIssuance/singleStudent/${certificateId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete certificate");

      toast({
        title: "Success",
        description: "Certificate deleted successfully",
      });

      fetchCertificates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete certificate",
        variant: "destructive",
      });
    }
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Certificates</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedCertificate(null)}>
                Issue Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedCertificate
                    ? "Edit Certificate"
                    : "Issue Certificate"}
                </DialogTitle>
              </DialogHeader>
              <CertificateForm
                students={students}
                certificateTypes={certificateTypes}
                initialData={selectedCertificate || undefined}
                onSubmit={handleSubmit}
              />
            </DialogContent>
          </Dialog>
        </div>

        <CertificateTable
          certificates={certificates}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </SideBarLayout>
  );
}
