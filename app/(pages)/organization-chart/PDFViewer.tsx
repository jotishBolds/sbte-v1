// app/(pages)/organization-chart/PDFViewer.tsx
import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Set up PDF.js worker
try {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js`;
} catch (error) {
  console.error("Error setting up PDF worker:", error);
}

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setError("Failed to load PDF. Please try again later.");
    setIsLoading(false);
  };

  const previousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const nextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  if (error) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        <Button
          variant="outline"
          size="icon"
          onClick={previousPage}
          disabled={pageNumber <= 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="flex items-center px-2">
          {isLoading ? "Loading..." : `Page ${pageNumber} of ${numPages}`}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={nextPage}
          disabled={pageNumber >= numPages || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={zoomOut}
          disabled={isLoading}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={zoomIn}
          disabled={isLoading}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      <div className="w-full overflow-x-auto">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="w-full min-h-[400px] flex items-center justify-center bg-muted">
              <p>Loading PDF...</p>
            </div>
          }
          className="flex justify-center"
          error={
            <div className="w-full min-h-[400px] flex items-center justify-center text-red-500">
              <p>Failed to load PDF. Please try again later.</p>
            </div>
          }
        >
          {!isLoading && (
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className="max-w-full"
              renderAnnotationLayer={false}
              renderTextLayer={false}
              loading={
                <div className="w-full min-h-[400px] flex items-center justify-center bg-muted">
                  <p>Loading page...</p>
                </div>
              }
            />
          )}
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
