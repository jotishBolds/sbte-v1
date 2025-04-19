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
import { Plus, FileSearch, Filter, X } from "lucide-react";
import Link from "next/link";
import SideBarLayout from "@/components/sidebar/layout";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface GradeCard {
  id: string;
  cardNo: string;
  student: {
    name: string;
    enrollmentNo: string;
  };
  semester: {
    name: string;
    id: string;
  };
  batch: {
    name: string;
    id: string;
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

  // Filter states
  const [filters, setFilters] = useState({
    semester: "all-semesters",
    batch: "all-batches",
    gpaMin: "",
    gpaMax: "",
    cgpaMin: "",
    cgpaMax: "",
    sortBy: "recent",
    sortOrder: "desc",
  });

  // Unique filter options
  const [filterOptions, setFilterOptions] = useState({
    semesters: [] as { id: string; name: string }[],
    batches: [] as { id: string; name: string }[],
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    const fetchGradeCards = async () => {
      try {
        const response = await fetch("/api/gradeCard");
        if (!response.ok) {
          throw new Error("Failed to fetch grade cards");
        }
        const data = await response.json();
        setGradeCards(data);

        // Extract unique semesters and batches for filters
        const semesters = Array.from(
          new Map(
            data.map((card: GradeCard) => [card.semester.id, card.semester])
          ).values()
        );

        const batches = Array.from(
          new Map(
            data.map((card: GradeCard) => [card.batch.id, card.batch])
          ).values()
        );

        setFilterOptions({
          semesters: semesters as { id: string; name: string }[],
          batches: batches as { id: string; name: string }[],
        });
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

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.semester) count++;
    if (filters.batch) count++;
    if (filters.gpaMin || filters.gpaMax) count++;
    if (filters.cgpaMin || filters.cgpaMax) count++;
    if (filters.sortBy !== "recent") count++;

    setActiveFiltersCount(count);

    // Reset to first page when filters change
    setCurrentPage(1);
  }, [filters]);

  const filteredGradeCards = gradeCards.filter((card) => {
    // Search filter
    const matchesSearch =
      card.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.student.enrollmentNo
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      card.cardNo.toLowerCase().includes(searchTerm.toLowerCase());

    // Semester filter
    const matchesSemester =
      !filters.semester ||
      filters.semester === "all-semesters" ||
      card.semester.id === filters.semester;
    const matchesBatch =
      !filters.batch ||
      filters.batch === "all-batches" ||
      card.batch.id === filters.batch;

    // GPA range filter
    const matchesGpaMin =
      !filters.gpaMin ||
      (card.gpa !== null && card.gpa >= parseFloat(filters.gpaMin));

    const matchesGpaMax =
      !filters.gpaMax ||
      (card.gpa !== null && card.gpa <= parseFloat(filters.gpaMax));

    // CGPA range filter
    const matchesCgpaMin =
      !filters.cgpaMin ||
      (card.cgpa !== null && card.cgpa >= parseFloat(filters.cgpaMin));

    const matchesCgpaMax =
      !filters.cgpaMax ||
      (card.cgpa !== null && card.cgpa <= parseFloat(filters.cgpaMax));

    return (
      matchesSearch &&
      matchesSemester &&
      matchesBatch &&
      matchesGpaMin &&
      matchesGpaMax &&
      matchesCgpaMin &&
      matchesCgpaMax
    );
  });

  // Sort the filtered results
  const sortedCards = [...filteredGradeCards].sort((a, b) => {
    const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

    switch (filters.sortBy) {
      case "name":
        return sortOrder * a.student.name.localeCompare(b.student.name);
      case "gpa":
        // Handle null GPA values
        if (a.gpa === null && b.gpa === null) return 0;
        if (a.gpa === null) return sortOrder * 1;
        if (b.gpa === null) return sortOrder * -1;
        return sortOrder * (a.gpa - b.gpa);
      case "cgpa":
        // Handle null CGPA values
        if (a.cgpa === null && b.cgpa === null) return 0;
        if (a.cgpa === null) return sortOrder * 1;
        if (b.cgpa === null) return sortOrder * -1;
        return sortOrder * (a.cgpa - b.cgpa);
      case "recent":
      default:
        // Sort by createdAt date
        return (
          sortOrder * new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
    }
  });

  const totalPages = Math.ceil(sortedCards.length / itemsPerPage);
  const paginatedCards = sortedCards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setFilters({
      semester: "all-semesters",
      batch: "all-batches",
      gpaMin: "",
      gpaMax: "",
      cgpaMin: "",
      cgpaMax: "",
      sortBy: "recent",
      sortOrder: "desc",
    });
  };

  const removeFilter = (filterName: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]:
        filterName === "semester"
          ? "all-semesters"
          : filterName === "batch"
          ? "all-batches"
          : "",
    }));
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      // Always show first page
      items.push(
        <PaginationItem key="page-1">
          <PaginationLink
            isActive={currentPage === 1}
            onClick={() => handlePageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis or page numbers
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={`page-${i}`}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis or page numbers
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={`page-${totalPages}`}>
            <PaginationLink
              isActive={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show all pages if total pages <= 7
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={`page-${i}`}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>All Grade Cards</CardTitle>
              <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
                <Input
                  placeholder="Search by name, enrollment or card no..."
                  className="w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />

                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex gap-1 items-center"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle>Filter Grade Cards</SheetTitle>
                      <SheetDescription>
                        Apply filters to narrow down your results
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Semester</h3>
                        <Select
                          value={filters.semester}
                          onValueChange={(value) =>
                            setFilters({ ...filters, semester: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Semesters" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-semesters">
                              All Semesters
                            </SelectItem>
                            {filterOptions.semesters.map((semester) => (
                              <SelectItem key={semester.id} value={semester.id}>
                                {semester.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Batch</h3>
                        <Select
                          value={filters.batch}
                          onValueChange={(value) =>
                            setFilters({ ...filters, batch: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Batches" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-batches">
                              All Batches
                            </SelectItem>
                            {filterOptions.batches.map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">GPA Range</h3>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            min="0"
                            max="10"
                            step="0.1"
                            value={filters.gpaMin}
                            onChange={(e) =>
                              setFilters({ ...filters, gpaMin: e.target.value })
                            }
                          />
                          <span className="flex items-center">to</span>
                          <Input
                            type="number"
                            placeholder="Max"
                            min="0"
                            max="10"
                            step="0.1"
                            value={filters.gpaMax}
                            onChange={(e) =>
                              setFilters({ ...filters, gpaMax: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">CGPA Range</h3>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            min="0"
                            max="10"
                            step="0.1"
                            value={filters.cgpaMin}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                cgpaMin: e.target.value,
                              })
                            }
                          />
                          <span className="flex items-center">to</span>
                          <Input
                            type="number"
                            placeholder="Max"
                            min="0"
                            max="10"
                            step="0.1"
                            value={filters.cgpaMax}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                cgpaMax: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Sort By</h3>
                        <div className="flex gap-2">
                          <Select
                            value={filters.sortBy}
                            onValueChange={(value) =>
                              setFilters({ ...filters, sortBy: value })
                            }
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="recent">
                                Date Created
                              </SelectItem>
                              <SelectItem value="name">Student Name</SelectItem>
                              <SelectItem value="gpa">GPA</SelectItem>
                              <SelectItem value="cgpa">CGPA</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={filters.sortOrder}
                            onValueChange={(value) =>
                              setFilters({ ...filters, sortOrder: value })
                            }
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asc">Asc</SelectItem>
                              <SelectItem value="desc">Desc</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <SheetFooter className="flex flex-row gap-2 sm:justify-between pt-2">
                      <Button variant="outline" onClick={clearAllFilters}>
                        Clear All
                      </Button>
                      <SheetClose asChild>
                        <Button>Apply Filters</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Active filters display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {filters.semester && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Semester:{" "}
                    {
                      filterOptions.semesters.find(
                        (s) => s.id === filters.semester
                      )?.name
                    }
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFilter("semester")}
                    />
                  </Badge>
                )}

                {filters.batch && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Batch:{" "}
                    {
                      filterOptions.batches.find((b) => b.id === filters.batch)
                        ?.name
                    }
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFilter("batch")}
                    />
                  </Badge>
                )}

                {(filters.gpaMin || filters.gpaMax) && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    GPA: {filters.gpaMin || "0"} - {filters.gpaMax || "10"}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setFilters({ ...filters, gpaMin: "", gpaMax: "" })
                      }
                    />
                  </Badge>
                )}

                {(filters.cgpaMin || filters.cgpaMax) && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    CGPA: {filters.cgpaMin || "0"} - {filters.cgpaMax || "10"}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setFilters({ ...filters, cgpaMin: "", cgpaMax: "" })
                      }
                    />
                  </Badge>
                )}

                {filters.sortBy !== "recent" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Sorted by: {filters.sortBy.toUpperCase()} (
                    {filters.sortOrder === "asc" ? "↑" : "↓"})
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          sortBy: "recent",
                          sortOrder: "desc",
                        })
                      }
                    />
                  </Badge>
                )}

                {activeFiltersCount > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={clearAllFilters}
                  >
                    Clear all
                  </Button>
                )}
              </div>
            )}
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
                  {searchTerm || activeFiltersCount > 0
                    ? "No grade cards match your search criteria. Try adjusting your search terms or filters."
                    : "There are no grade cards available in the system. Use the 'Import Internal Marks' button to add grade data."}
                </p>
                {(searchTerm || activeFiltersCount > 0) && (
                  <div className="flex gap-2 mt-4">
                    {searchTerm && (
                      <Button
                        variant="outline"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear Search
                      </Button>
                    )}
                    {activeFiltersCount > 0 && (
                      <Button variant="outline" onClick={clearAllFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {totalPages > 1 && !loading && (
              <div className="mt-6 flex justify-center">
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

                    {renderPaginationItems()}

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

            {/* Results count */}
            {!loading && (
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Showing{" "}
                {paginatedCards.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{" "}
                to {Math.min(currentPage * itemsPerPage, sortedCards.length)} of{" "}
                {sortedCards.length} results
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
}
