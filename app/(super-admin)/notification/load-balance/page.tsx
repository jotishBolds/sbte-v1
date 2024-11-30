"use client";
import React, { useState, useEffect } from "react";
import { Download, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getSession } from "next-auth/react";
import { loadBalancingService } from "@/services/load-balance-service";
import { toast } from "sonner";
import { LoadBalancingPdf, UserSession } from "@/types/load-balace-types";
import SideBarLayout from "@/components/sidebar/layout";

export default function LoadBalancingPdfView() {
  const [pdfs, setPdfs] = useState<LoadBalancingPdf[]>([]);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          No load balancing PDFs are currently available
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
    <SideBarLayout>
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3 mt-4 sm:mt-5">
            <FileText className="w-5 h-5 sm:w-7 sm:h-7" />
            Collegewise Reports on Load Balancing
          </h1>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {pdfs.map((pdf) => (
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
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => handleDownload(pdf)}
                >
                  <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SideBarLayout>
  );
}
