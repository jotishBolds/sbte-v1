import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Certificate } from "@/types/types";

interface CertificateTableProps {
  certificates: Certificate[];
  onEdit: (certificate: Certificate) => void;
  onDelete: (certificateId: string) => void;
}

const ITEMS_PER_PAGE = 10;

export function CertificateTable({
  certificates,
  onEdit,
  onDelete,
}: CertificateTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Certificate | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedCertificates = [...certificates].sort((a, b) => {
    if (!sortField) return 0;

    let aValue: any;
    let bValue: any;

    // Handle nested properties
    switch (sortField) {
      case "student":
        aValue = a.student.name.toLowerCase();
        bValue = b.student.name.toLowerCase();
        break;
      case "certificateType":
        aValue = a.certificateType.name.toLowerCase();
        bValue = b.certificateType.name.toLowerCase();
        break;
      case "issueDate":
        aValue = new Date(a.issueDate || 0).getTime();
        bValue = new Date(b.issueDate || 0).getTime();
        break;
      default:
        aValue = (a[sortField as keyof Certificate] as string).toLowerCase();
        bValue = (b[sortField as keyof Certificate] as string).toLowerCase();
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Filter certificates based on search query and status
  const filteredCertificates = sortedCertificates.filter((cert) => {
    const matchesSearch =
      cert.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateType.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      cert.paymentStatus.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCertificates.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCertificates = filteredCertificates.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      COMPLETED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      FAILED: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={variants[status.toUpperCase()] + " capitalize"}>
        {status}
      </Badge>
    );
  };
  const handleSort = (field: keyof Certificate) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Certificates Management</CardTitle>
        <CardDescription>
          Manage and track all student certificates and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by student or certificate type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("student")}
                >
                  Student Name
                  {sortField === "student" && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("certificateType")}
                >
                  Certificate Type
                  {sortField === "certificateType" && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("issueDate")}
                >
                  Issue Date
                  {sortField === "issueDate" && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("paymentStatus")}
                >
                  Payment Status
                  {sortField === "paymentStatus" && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCertificates.map((certificate) => (
                <TableRow key={certificate.id}>
                  <TableCell className="font-medium">
                    {certificate.student.name}
                  </TableCell>
                  <TableCell>{certificate.certificateType.name}</TableCell>
                  <TableCell>
                    {certificate.issueDate
                      ? format(new Date(certificate.issueDate), "PPP")
                      : "Not Issued"}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(certificate.paymentStatus)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(certificate)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(certificate.id)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Certificate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredCertificates.length)}{" "}
            of {filteredCertificates.length} certificates
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
