"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, FileSearch } from "lucide-react";
import Link from "next/link";
import SideBarLayout from "@/components/sidebar/layout";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface GradeCard {
  id: string;
  cardNo: string;
  student: {
    name: string;
    enrollmentNo: string;
  };
  semester: {
    name: string;
  };
  batch: {
    name: string;
  };
  gpa: number | null;
  cgpa: number | null;
  createdAt: string;
}

export default function GradeCardListPage() {
  const { toast } = useToast();
  const [gradeCards, setGradeCards] = useState<GradeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchGradeCards = async () => {
      try {
        const response = await fetch("/api/gradeCard");
        if (!response.ok) {
          throw new Error("Failed to fetch grade cards");
        }
        const data = await response.json();
        setGradeCards(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load grade cards",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGradeCards();
  }, [toast]);

  const filteredGradeCards = gradeCards.filter(
    (card) =>
      card.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.student.enrollmentNo
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      card.cardNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGradeCards.length / itemsPerPage);
  const paginatedCards = filteredGradeCards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const TableRowSkeleton = () => (
    <TableRow>
      <TableCell>
        <Skeleton className="h-6 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-10" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-10" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-20" />
      </TableCell>
    </TableRow>
  );

  return (
    <SideBarLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Grade Cards</h1>
          <Link href="/import-internal">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Import Internal Marks
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Grade Cards</CardTitle>
              <Input
                placeholder="Search by name, enrollment or card no..."
                className="max-w-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Card No</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))}
                </TableBody>
              </Table>
            ) : paginatedCards.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Card No</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell>{card.cardNo}</TableCell>
                      <TableCell>{card.student.name}</TableCell>
                      <TableCell>{card.student.enrollmentNo}</TableCell>
                      <TableCell>{card.batch.name}</TableCell>
                      <TableCell>{card.semester.name}</TableCell>
                      <TableCell>{card.gpa?.toFixed(2) ?? "N/A"}</TableCell>
                      <TableCell>{card.cgpa?.toFixed(2) ?? "N/A"}</TableCell>
                      <TableCell>
                        <Link href={`/gradecard-view/${card.id}`}>
                          <Button variant="outline" size="sm">
                            <FileSearch className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-20 w-20 text-muted-foreground mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 12h-6" />
                    <path d="M2 12h6" />
                    <path d="M12 2v6" />
                    <path d="M12 16v6" />
                    <path d="M4.9 4.9l4.2 4.2" />
                    <path d="M14.9 14.9l4.2 4.2" />
                    <path d="M14.9 9.1l4.2-4.2" />
                    <path d="M4.9 19.1l4.2-4.2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">No grade cards found</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  {searchTerm
                    ? "No grade cards match your search criteria. Try adjusting your search terms or clear the search field."
                    : "There are no grade cards available in the system. Use the 'Import Internal Marks' button to add grade data."}
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
            {totalPages > 1 && !loading && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
}
