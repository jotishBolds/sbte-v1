"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Edit, Filter, Search } from "lucide-react";

import { EditBaseExamFee } from "./edit-base-exam-fee";
import { BatchBaseExamFee } from "@/types/batch-base";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function BaseExamFeeList() {
  // State Management
  const [baseExamFees, setBaseExamFees] = useState<BatchBaseExamFee[]>([]);
  const [filteredFees, setFilteredFees] = useState<BatchBaseExamFee[]>([]);
  const [selectedFee, setSelectedFee] = useState<BatchBaseExamFee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Filtering States
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [minFeeFilter, setMinFeeFilter] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch Base Exam Fees
  const fetchBaseExamFees = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/batchBaseExamFee");
      if (!response.ok) throw new Error("Failed to fetch base exam fees");
      const data = await response.json();
      setBaseExamFees(data);
    } catch (error: any) {
      toast({
        title: "Error Fetching Fees",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filtering Logic
  useEffect(() => {
    let result = baseExamFees;

    // Search Filter
    if (searchTerm) {
      result = result.filter(
        (fee) =>
          fee.batch?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fee.batch?.program?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Program Filter
    if (programFilter) {
      result = result.filter(
        (fee) => fee.batch?.program?.name === programFilter
      );
    }

    // Minimum Fee Filter
    if (minFeeFilter) {
      const minFee = parseFloat(minFeeFilter);
      result = result.filter((fee) => fee.baseFee >= minFee);
    }

    setFilteredFees(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [baseExamFees, searchTerm, programFilter, minFeeFilter]);

  // Pagination Logic
  const paginatedFees = useMemo(() => {
    // Ensure filteredFees is an array before slicing
    const safeFilteredFees = Array.isArray(filteredFees) ? filteredFees : [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    return safeFilteredFees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFees, currentPage]);

  // Total Pages Calculation
  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);

  // Unique Programs for Filtering
  // Update the uniquePrograms computation to handle potential null/undefined cases
  const uniquePrograms = useMemo(() => {
    // Ensure baseExamFees is an array before mapping
    const programNames = Array.isArray(baseExamFees)
      ? baseExamFees.map((fee) => fee.batch?.program?.name).filter(Boolean)
      : [];

    return [...new Set(programNames)];
  }, [baseExamFees]);

  // Existing Handlers (Delete, Edit)
  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const response = await fetch(`/api/batchBaseExamFee/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete base exam fee");

      toast({
        title: "Success",
        description: "Base exam fee deleted successfully",
      });

      fetchBaseExamFees();
    } catch (error: any) {
      toast({
        title: "Error Deleting Fee",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (fee: BatchBaseExamFee) => {
    setSelectedFee(fee);
    setIsEditDialogOpen(true);
  };

  // Initial Fetch
  useEffect(() => {
    fetchBaseExamFees();
  }, [fetchBaseExamFees]);

  return (
    <div className="w-full max-w-[74rem] mx-auto p-4 space-y-4">
      {/* Filtering Section */}
      <Card className="w-full ">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search Batch or Program"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Program" />
              </SelectTrigger>
              <SelectContent>
                {uniquePrograms.map((program) => (
                  <SelectItem key={program} value={program}>
                    {program}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* <Input
              type="number"
              placeholder="Minimum Fee"
              value={minFeeFilter}
              onChange={(e) => setMinFeeFilter(e.target.value)}
              className="w-full"
            /> */}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredFees.length === 0 ? (
        <div className="text-center text-muted-foreground p-8">
          No base exam fees found matching your criteria
        </div>
      ) : (
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Batch Name</TableHead>
                    <TableHead className="w-1/4 hidden md:table-cell">
                      Program
                    </TableHead>
                    <TableHead className="w-1/4">Base Fee</TableHead>
                    <TableHead className="w-1/4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFees.map((fee) => (
                    <TableRow
                      key={fee.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {fee.batch?.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {fee.batch?.program?.name}
                      </TableCell>
                      <TableCell className="text-emerald-600">
                        ₹
                        {fee.baseFee.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(fee)}
                            className="hidden md:inline-flex"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isDeleting === fee.id}
                              >
                                {isDeleting === fee.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                <span className="sr-only md:not-sr-only ml-2">
                                  Delete
                                </span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirm Deletion
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently remove the base
                                  exam fee for {fee.batch?.name}. Proceed with
                                  caution.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(fee.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Confirm Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(Math.max(1, currentPage - 1));
                }}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(index + 1);
                  }}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(Math.min(totalPages, currentPage + 1));
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Base Exam Fee</DialogTitle>
          </DialogHeader>
          {selectedFee && (
            <EditBaseExamFee
              fee={selectedFee}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                fetchBaseExamFees();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
