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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<College>>({});

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await fetch("/api/colleges");
      if (!response.ok) {
        throw new Error("Failed to fetch colleges");
      }
      const data = await response.json();
      setColleges(data);
    } catch (err) {
      setError("Failed to fetch colleges");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/colleges/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete college");
      }
      fetchColleges();
    } catch (err) {
      setError("Failed to delete college");
    }
  };

  const handleEdit = (college: College) => {
    setEditingId(college.id);
    setEditForm(college);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/colleges/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) {
        throw new Error("Failed to update college");
      }
      setEditingId(null);
      fetchColleges();
    } catch (err) {
      setError("Failed to update college");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  if (status === "loading") {
    return <div>Loading...</div>;
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
                    <TableCell>
                      {editingId === college.id ? (
                        <Input
                          name="name"
                          value={editForm.name || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        college.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === college.id ? (
                        <Input
                          name="address"
                          value={editForm.address || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        college.address
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === college.id ? (
                        <Input
                          name="establishedOn"
                          type="date"
                          value={editForm.establishedOn || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        new Date(college.establishedOn).toLocaleDateString()
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === college.id ? (
                        <Input
                          name="websiteUrl"
                          value={editForm.websiteUrl || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        college.websiteUrl
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === college.id ? (
                        <Input
                          name="contactEmail"
                          value={editForm.contactEmail || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        college.contactEmail
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === college.id ? (
                        <Input
                          name="contactPhone"
                          value={editForm.contactPhone || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        college.contactPhone
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {editingId === college.id ? (
                          <>
                            <Button
                              onClick={handleUpdate}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Save className="mr-2 h-4 w-4" /> Save
                            </Button>
                            <Button
                              onClick={() => setEditingId(null)}
                              className="bg-gray-500 hover:bg-gray-600 text-white"
                            >
                              <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleEdit(college)}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(college.id)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
};

export default CollegesPage;
