"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Search, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Alumnus {
  id: string;
  name: string;
  email: string;
  department: string;
  graduationYear: number;
  verified: boolean;
}

interface Department {
  id: string;
  name: string;
}

interface SearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder,
}) => (
  <div className="relative">
    <Input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="pl-10"
    />
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
  </div>
);

export default function AlumniList() {
  const { data: session } = useSession();
  const [alumni, setAlumni] = useState<Alumnus[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<Alumnus[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [verificationStatus, setVerificationStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
    fetchAlumni();
  }, []);

  useEffect(() => {
    filterAlumni();
  }, [alumni, selectedDepartment, verificationStatus, searchTerm]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/alumni/dept");
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      } else {
        throw new Error("Failed to fetch departments");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      });
    }
  };

  const fetchAlumni = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/alumni`);
      if (response.ok) {
        const data = await response.json();
        setAlumni(data);
      } else {
        throw new Error("Failed to fetch alumni");
      }
    } catch (error) {
      console.error("Error fetching alumni:", error);
      toast({
        title: "Error",
        description: "Failed to fetch alumni",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAlumni = () => {
    let filtered = alumni;
    if (selectedDepartment !== "all") {
      filtered = filtered.filter((a) => a.department === selectedDepartment);
    }
    if (verificationStatus !== "all") {
      filtered = filtered.filter(
        (a) => a.verified === (verificationStatus === "verified")
      );
    }
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(lowercasedSearch) ||
          a.email.toLowerCase().includes(lowercasedSearch)
      );
    }
    setFilteredAlumni(filtered);
  };

  const handleToggleVerification = async (
    id: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/alumni/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !currentStatus }),
      });

      if (response.ok) {
        setAlumni(
          alumni.map((a) =>
            a.id === id ? { ...a, verified: !currentStatus } : a
          )
        );
        toast({
          title: "Success",
          description: `Alumnus ${
            !currentStatus ? "verified" : "unverified"
          } successfully`,
        });
      } else {
        throw new Error(
          `Failed to ${!currentStatus ? "verify" : "unverify"} alumnus`
        );
      }
    } catch (error) {
      console.error(
        `Error ${!currentStatus ? "verifying" : "unverifying"} alumnus:`,
        error
      );
      toast({
        title: "Error",
        description: `Failed to ${
          !currentStatus ? "verify" : "unverify"
        } alumnus`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/alumni/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAlumni(alumni.filter((a) => a.id !== id));
        toast({
          title: "Success",
          description: "Alumnus deleted successfully",
        });
      } else {
        throw new Error("Failed to delete alumnus");
      }
    } catch (error) {
      console.error("Error deleting alumnus:", error);
      toast({
        title: "Error",
        description: "Failed to delete alumnus",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Alumni Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            onValueChange={setSelectedDepartment}
            value={selectedDepartment}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={setVerificationStatus}
            value={verificationStatus}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Verification Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={fetchAlumni}
            className="w-full md:w-auto"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Graduation Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredAlumni.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No alumni found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlumni.map((alumnus) => (
                  <TableRow key={alumnus.id}>
                    <TableCell>{alumnus.name}</TableCell>
                    <TableCell>{alumnus.email}</TableCell>
                    <TableCell>{alumnus.department}</TableCell>
                    <TableCell>{alumnus.graduationYear}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={alumnus.verified}
                          onCheckedChange={() =>
                            handleToggleVerification(
                              alumnus.id,
                              alumnus.verified
                            )
                          }
                        />
                        <Badge
                          className={
                            alumnus.verified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {alumnus.verified ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" /> Verified
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" /> Unverified
                            </>
                          )}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the alumnus account.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(alumnus.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
