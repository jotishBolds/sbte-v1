"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Edit,
  PlusCircle,
  Trash2,
  Globe,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  User,
  Wallet,
  School,
} from "lucide-react";
import SideBarLayout from "@/components/sidebar/layout";
import { ClipLoader } from "react-spinners";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

interface College {
  id: string;
  name: string;
  address: string;
  establishedOn: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  IFSCCode?: string;
  AccountNo?: string;
  AccountHolderName?: string;
  UPIID?: string;
}

const CollegesPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [colleges, setColleges] = useState<College[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/colleges");
      if (!response.ok) throw new Error("Failed to fetch colleges");
      const data = await response.json();
      setColleges(data);
    } catch (err) {
      setError("Failed to fetch colleges");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/colleges/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete college");
      setColleges(colleges.filter((college) => college.id !== id));
    } catch (err) {
      setError("Failed to delete college");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (college: College) => {
    setEditingCollege(college);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollege) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/colleges/${editingCollege.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCollege),
      });
      if (!response.ok) throw new Error("Failed to update college");

      setColleges(
        colleges.map((college) =>
          college.id === editingCollege.id ? editingCollege : college
        )
      );
      setIsEditModalOpen(false);
      setEditingCollege(null);
    } catch (err) {
      setError("Failed to update college");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredColleges = colleges.filter((college) =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#4A90E2" size={50} />
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "SBTE_ADMIN") {
    router.push("/login");
    return null;
  }

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-6 md:py-10">
        <Card className="shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">Colleges</CardTitle>
                <CardDescription>
                  Manage all registered colleges
                </CardDescription>
              </div>
              <Button
                onClick={() => router.push("/collage-creation")}
                className="bg-green-500 hover:bg-green-600 text-white w-full md:w-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add New College
              </Button>
            </div>
            <div className="w-full">
              <Input
                placeholder="Search colleges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <ClipLoader color="#4A90E2" size={50} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredColleges.map((college) => (
                  <Card
                    key={college.id}
                    className="hover:shadow-xl transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        {college.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                        <span className="text-sm">{college.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {new Date(college.establishedOn).toLocaleDateString()}
                        </span>
                      </div>
                      {college.websiteUrl && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <a
                            href={college.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                      {college.contactEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {college.contactEmail}
                          </span>
                        </div>
                      )}
                      {college.contactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {college.contactPhone}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          onClick={() => handleEdit(college)}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="bg-red-500 hover:bg-red-600 text-white"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete College
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {college.name}?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(college.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit College</DialogTitle>
          </DialogHeader>
          {editingCollege && (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">College Name</Label>
                  <Input
                    id="name"
                    value={editingCollege.name}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={editingCollege.address}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        address: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="establishedOn">Established Date</Label>
                  <Input
                    id="establishedOn"
                    type="date"
                    value={editingCollege.establishedOn}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        establishedOn: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    value={editingCollege.websiteUrl || ""}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        websiteUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={editingCollege.contactEmail || ""}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        contactEmail: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={editingCollege.contactPhone || ""}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        contactPhone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="IFSCCode">IFSC Code</Label>
                  <Input
                    id="IFSCCode"
                    value={editingCollege.IFSCCode || ""}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        IFSCCode: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="AccountNo">Account Number</Label>
                  <Input
                    id="AccountNo"
                    value={editingCollege.AccountNo || ""}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        AccountNo: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="AccountHolderName">Account Holder Name</Label>
                  <Input
                    id="AccountHolderName"
                    value={editingCollege.AccountHolderName || ""}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        AccountHolderName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="UPIID">UPI ID</Label>
                  <Input
                    id="UPIID"
                    value={editingCollege.UPIID || ""}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        UPIID: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-full md:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full md:w-auto bg-green-500 hover:bg-green-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <ClipLoader color="#ffffff" size={16} />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {!isLoading && filteredColleges.length === 0 && (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <School className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Colleges Found</h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm
                ? "No colleges match your search criteria. Try adjusting your search."
                : "Get started by adding your first college."}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => router.push("/collage-creation")}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add First College
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button for Mobile */}
      <div className="md:hidden fixed bottom-6 right-6">
        <Button
          onClick={() => router.push("/collage-creation")}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full h-14 w-14 shadow-lg"
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      </div>
    </SideBarLayout>
  );
};

export default CollegesPage;
