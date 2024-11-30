"use client";
import React, { useState, useEffect } from "react";
import {
  Download,
  Trash2,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getSession } from "next-auth/react";
import { loadBalancingService } from "@/services/load-balance-service";
import { toast } from "sonner";
import { LoadBalancingPdf, UserSession } from "@/types/load-balace-types";

export default function LoadBalancingPdfList() {
  const [pdfs, setPdfs] = useState<LoadBalancingPdf[]>([]);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<LoadBalancingPdf | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 5; // Number of items to display per page

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const session = await getSession();

        if (session?.user) {
          const convertedSession: UserSession = {
            user: {
              role: session.user.role as UserSession["user"]["role"],
              collegeId: session.user.collegeId as string,
            },
          };
          setUserSession(convertedSession);
        }

        const fetchedPdfs = (await loadBalancingService.getPdfs()) || [];
        setPdfs(fetchedPdfs);

        // Calculate total pages
        setTotalPages(Math.ceil(fetchedPdfs.length / itemsPerPage));
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch PDFs:", error);
        setError("Unable to load PDFs. Please try again later.");
        setPdfs([]);
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleDownload = (pdf: LoadBalancingPdf) => {
    loadBalancingService.downloadPdf(pdf.id, pdf.title);
  };

  const handleDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      await loadBalancingService.deletePdf(deleteConfirmation.id);
      const updatedPdfs = pdfs.filter((p) => p.id !== deleteConfirmation.id);
      setPdfs(updatedPdfs);

      // Recalculate total pages after deletion
      setTotalPages(Math.ceil(updatedPdfs.length / itemsPerPage));

      // Adjust current page if needed
      if (currentPage > Math.ceil(updatedPdfs.length / itemsPerPage)) {
        setCurrentPage(
          Math.max(1, Math.ceil(updatedPdfs.length / itemsPerPage))
        );
      }

      toast.success("PDF deleted successfully");
      setDeleteConfirmation(null);
    } catch (error) {
      toast.error("Failed to delete PDF");
    }
  };

  // Pagination logic
  const paginatedPdfs = pdfs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <Card key={item}>
          <CardHeader className="px-4 py-3 sm:px-6">
            <Skeleton className="h-5 w-3/4 sm:h-6" />
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6">
            <Skeleton className="h-8 w-full sm:h-10" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <Card className="text-center">
      <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center space-y-3 sm:space-y-4">
        <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
        <p className="text-base sm:text-lg text-gray-600">No PDFs found</p>
        <p className="text-xs sm:text-sm text-gray-500">
          Upload a PDF to get started
        </p>
      </CardContent>
    </Card>
  );

  const renderErrorState = () => (
    <Card className="border-destructive bg-destructive/10">
      <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-destructive" />
        <div className="text-center sm:text-left">
          <p className="text-base sm:text-lg font-semibold text-destructive">
            Unable to Load PDFs
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">{error}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) return renderLoadingState();
  if (error) return renderErrorState();
  if (!pdfs || pdfs.length === 0) return renderEmptyState();

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        {paginatedPdfs.map((pdf) => (
          <Card
            key={pdf.id}
            className="hover:shadow-md transition-all duration-300 ease-in-out"
          >
            <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 p-3 sm:p-4 pb-0">
              <div className="flex items-center space-x-2 sm:space-x-3 w-full">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <CardTitle className="m-0 text-base sm:text-lg truncate">
                  {pdf.title}
                </CardTitle>
              </div>
              {pdf.college && (
                <Badge
                  variant="secondary"
                  className="mt-2 sm:mt-0 self-start sm:self-auto"
                >
                  {pdf.college.name}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 pt-2">
              <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-0">
                Uploaded on {new Date(pdf.createdAt).toLocaleDateString()}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => handleDownload(pdf)}
                >
                  <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Download
                </Button>
                {userSession?.user.role === "HOD" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setDeleteConfirmation(pdf)}
                  >
                    <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center space-x-4 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmation}
        onOpenChange={() => setDeleteConfirmation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Delete PDF
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Are you sure you want to delete the PDF &quot;
              {deleteConfirmation?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full sm:w-auto"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
