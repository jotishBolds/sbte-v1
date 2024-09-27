// app/admin/colleges/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Edit, PlusCircle, Save, Trash2, X } from "lucide-react";
import SideBarLayout from "@/components/sidebar/layout";
import { ClipLoader } from "react-spinners";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from "@/components/ui/label";

interface College {
  id: string;
  name: string;
  address: string;
  establishedOn: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
}

const CollegesPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [colleges, setColleges] = useState<College[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/colleges");
      if (!response.ok) {
        throw new Error("Failed to fetch colleges");
      }
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
      if (!response.ok) {
        throw new Error("Failed to delete college");
      }
      setColleges(colleges.filter((college) => college.id !== id));
      setDeleteConfirmation(null);
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

  const handleUpdate = async (updatedCollege: College) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/colleges/${updatedCollege.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCollege),
      });
      if (!response.ok) {
        throw new Error("Failed to update college");
      }
      setColleges(
        colleges.map((college) =>
          college.id === updatedCollege.id ? updatedCollege : college
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
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Colleges</CardTitle>
            <Button
              onClick={() => router.push("/collage-creation")}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create College
            </Button>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Established On</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colleges.map((college) => (
                    <TableRow key={college.id}>
                      <TableCell>{college.name}</TableCell>
                      <TableCell>{college.address}</TableCell>
                      <TableCell>
                        {new Date(college.establishedOn).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{college.websiteUrl}</TableCell>
                      <TableCell>{college.contactEmail}</TableCell>
                      <TableCell>{college.contactPhone}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEdit(college)}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Edit className=" h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="bg-red-500 hover:bg-red-600 text-white">
                                <Trash2 className=" h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the college and all data
                                  associated with it.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(college.id)}
                                >
                                  Delete
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
            )}
          </CardContent>
        </Card>
      </div>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit College</DialogTitle>
          </DialogHeader>
          {editingCollege && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate(editingCollege);
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editingCollege.name}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        name: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={editingCollege.address}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        address: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="establishedOn" className="text-right">
                    Established On
                  </Label>
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
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="websiteUrl" className="text-right">
                    Website
                  </Label>
                  <Input
                    id="websiteUrl"
                    value={editingCollege.websiteUrl || ""}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        websiteUrl: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contactEmail" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="contactEmail"
                    value={editingCollege.contactEmail || ""}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        contactEmail: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contactPhone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="contactPhone"
                    value={editingCollege.contactPhone || ""}
                    onChange={(e) =>
                      setEditingCollege({
                        ...editingCollege,
                        contactPhone: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </SideBarLayout>
  );
};

export default CollegesPage;
