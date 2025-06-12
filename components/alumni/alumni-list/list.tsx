"use client";
import React, { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
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
import {
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  User,
  Eye,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Alumnus {
  id: string;
  name: string;
  email: string;
  department: string;
  graduationYear: number;
  verified: boolean;
  profilePic: string | null;
  phoneNo?: string;
  dateOfBirth?: Date;
  address?: string;
  currentEmployer?: string;
  currentPosition?: string;
  industry?: string;
  linkedInProfile?: string;
  jobStatus?: string;
  gpa?: number;
  achievements?: string;
  program?: {
    name: string;
    code: string;
  };
  batchYear?: {
    year: number;
  };
  admissionYear?: {
    year: number;
  };
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

interface AlumnusDetailsProps {
  alumnus: Alumnus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

class AlumniManagementError extends Error {
  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = "AlumniManagementError";

    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
        scope.setLevel("error");
        Sentry.captureException(this);
      });
    }
  }
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

const AlumnusDetails: React.FC<AlumnusDetailsProps> = ({
  alumnus,
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Alumni Profile Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center gap-4 pb-6 border-b">
            <Avatar className="h-32 w-32">
              {alumnus.profilePic ? (
                <AvatarImage
                  src={alumnus.profilePic}
                  alt={alumnus.name}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback>
                  <User className="h-16 w-16 text-gray-400" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold">{alumnus.name}</h2>
              <p className="text-gray-500">{alumnus.email}</p>
            </div>
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

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{alumnus.department}</p>
              </div>
              {alumnus.program && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Program</p>
                  <p className="font-medium">{alumnus.program.name}</p>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Graduation Year</p>
                <p className="font-medium">{alumnus.graduationYear}</p>
              </div>
              {alumnus.batchYear && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Batch Year</p>
                  <p className="font-medium">{alumnus.batchYear.year}</p>
                </div>
              )}
              {alumnus.admissionYear && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Admission Year</p>
                  <p className="font-medium">{alumnus.admissionYear.year}</p>
                </div>
              )}
              {alumnus.gpa !== undefined && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">GPA</p>
                  <p className="font-medium">{alumnus.gpa}</p>
                </div>
              )}
              {alumnus.phoneNo && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{alumnus.phoneNo}</p>
                </div>
              )}
              {alumnus.dateOfBirth && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">
                    {new Date(alumnus.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              )}
              {alumnus.address && (
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{alumnus.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          {(alumnus.currentEmployer ||
            alumnus.currentPosition ||
            alumnus.industry ||
            alumnus.jobStatus) && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alumnus.jobStatus && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Job Status</p>
                    <p className="font-medium">{alumnus.jobStatus}</p>
                  </div>
                )}
                {alumnus.currentEmployer && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Current Employer</p>
                    <p className="font-medium">{alumnus.currentEmployer}</p>
                  </div>
                )}
                {alumnus.currentPosition && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Current Position</p>
                    <p className="font-medium">{alumnus.currentPosition}</p>
                  </div>
                )}
                {alumnus.industry && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Industry</p>
                    <p className="font-medium">{alumnus.industry}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Achievements */}
          {alumnus.achievements && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Achievements</h3>
              <div className="space-y-2">
                <p className="font-medium whitespace-pre-wrap">
                  {alumnus.achievements}
                </p>
              </div>
            </div>
          )}

          {/* Social Links */}
          {alumnus.linkedInProfile && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Social Links</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">LinkedIn Profile</p>
                <a
                  href={alumnus.linkedInProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  <span>{alumnus.linkedInProfile}</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function AlumniList() {
  const { data: session } = useSession();
  const [alumni, setAlumni] = useState<Alumnus[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<Alumnus[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [verificationStatus, setVerificationStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedAlumnus, setSelectedAlumnus] = useState<Alumnus | null>(null);

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
      await Sentry.startSpan(
        {
          name: "Fetch Departments",
          op: "http",
        },
        async () => {
          const response = await fetch("/api/alumni/dept");
          if (!response.ok) {
            throw new AlumniManagementError("Failed to fetch departments", {
              status: response.status,
              statusText: response.statusText,
            });
          }
          const data = await response.json();
          setDepartments(data);
        }
      );
    } catch (error) {
      console.error("Error fetching departments:", error);
      if (!(error instanceof AlumniManagementError)) {
        Sentry.captureException(
          new AlumniManagementError("Failed to fetch departments", {
            originalError:
              error instanceof Error ? error.message : String(error),
          })
        );
      }
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
      await Sentry.startSpan(
        {
          name: "Fetch Alumni",
          op: "http",
        },
        async () => {
          const response = await fetch(`/api/alumni`);
          if (!response.ok) {
            throw new AlumniManagementError("Failed to fetch alumni", {
              status: response.status,
              statusText: response.statusText,
            });
          }
          const data = await response.json();
          setAlumni(data);
        }
      );
    } catch (error) {
      console.error("Error fetching alumni:", error);
      if (!(error instanceof AlumniManagementError)) {
        Sentry.captureException(
          new AlumniManagementError("Failed to fetch alumni", {
            originalError:
              error instanceof Error ? error.message : String(error),
          })
        );
      }
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
    try {
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
    } catch (error) {
      console.error("Error filtering alumni:", error);
      Sentry.captureException(
        new AlumniManagementError("Failed to filter alumni", {
          originalError: error instanceof Error ? error.message : String(error),
          filterParams: {
            selectedDepartment,
            verificationStatus,
            searchTerm,
          },
        })
      );
    }
  };

  const handleToggleVerification = async (
    id: string,
    currentStatus: boolean
  ) => {
    try {
      await Sentry.startSpan(
        {
          name: "Toggle Verification",
          op: "http",
        },
        async () => {
          const response = await fetch(`/api/alumni/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ verified: !currentStatus }),
          });

          if (!response.ok) {
            throw new AlumniManagementError(
              `Failed to ${!currentStatus ? "verify" : "unverify"} alumnus`,
              {
                alumnusId: id,
                newStatus: !currentStatus,
                status: response.status,
              }
            );
          }

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
        }
      );
    } catch (error) {
      console.error(
        `Error ${!currentStatus ? "verifying" : "unverifying"} alumnus:`,
        error
      );
      if (!(error instanceof AlumniManagementError)) {
        Sentry.captureException(
          new AlumniManagementError(
            `Failed to ${!currentStatus ? "verify" : "unverify"} alumnus`,
            {
              alumnusId: id,
              originalError:
                error instanceof Error ? error.message : String(error),
            }
          )
        );
      }
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
      await Sentry.startSpan(
        {
          name: "Delete Alumnus",
          op: "http",
        },
        async () => {
          const response = await fetch(`/api/alumni/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new AlumniManagementError("Failed to delete alumnus", {
              alumnusId: id,
              status: response.status,
            });
          }

          setAlumni(alumni.filter((a) => a.id !== id));
          toast({
            title: "Success",
            description: "Alumnus deleted successfully",
          });
        }
      );
    } catch (error) {
      console.error("Error deleting alumnus:", error);
      if (!(error instanceof AlumniManagementError)) {
        Sentry.captureException(
          new AlumniManagementError("Failed to delete alumnus", {
            alumnusId: id,
            originalError:
              error instanceof Error ? error.message : String(error),
          })
        );
      }
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
                <TableHead>Profile</TableHead>
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
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredAlumni.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No alumni found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlumni.map((alumnus) => (
                  <TableRow key={alumnus.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        {alumnus.profilePic ? (
                          <AvatarImage
                            src={alumnus.profilePic}
                            alt={alumnus.name}
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback>
                            <User className="h-6 w-6 text-gray-400" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </TableCell>
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAlumnus(alumnus)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {selectedAlumnus && (
          <AlumnusDetails
            alumnus={selectedAlumnus}
            open={!!selectedAlumnus}
            onOpenChange={(open) => !open && setSelectedAlumnus(null)}
          />
        )}
      </CardContent>
    </Card>
  );
}
