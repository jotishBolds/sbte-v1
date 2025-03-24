"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { SubjectForm, SubjectFormValues } from "./form";
import SideBarLayout from "@/components/sidebar/layout";

type Subject = {
  id: string;
  name: string;
  code: string;
  semester: string;
  creditScore: number;
  teacherId: string | null;
};

type Teacher = {
  id: string;
  name: string;
};

export default function CreateSubjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      session?.user?.role !== "HOD" &&
      session?.user?.role !== "TEACHER"
    ) {
      router.push("/unauthorized");
    } else {
      fetchSubjects();
      fetchTeachers();
    }
  }, [status, session, router]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      if (response.ok) {
        const data: Subject[] = await response.json();
        setSubjects(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch subjects",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      });
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers");
      if (response.ok) {
        const data: Teacher[] = await response.json();
        setTeachers(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch teachers",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      });
    }
  };

  const handleCreateSubject = async (data: SubjectFormValues) => {
    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subject created successfully",
        });
        fetchSubjects();
        setIsDialogOpen(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to create subject",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating subject:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEditSubject = async (data: SubjectFormValues) => {
    if (!editingSubject) return;

    try {
      const response = await fetch(`/api/subjects/${editingSubject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subject updated successfully",
        });
        fetchSubjects();
        setEditingSubject(null);
        setIsDialogOpen(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update subject",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating subject:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      try {
        const response = await fetch(`/api/subjects/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Subject deleted successfully",
          });
          fetchSubjects();
        } else {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: errorData.message || "Failed to delete subject",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting subject:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Manage Subjects</CardTitle>
            <CardDescription>
              Create, edit, and delete subjects for your department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingSubject(null)}>
                    Create New Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSubject ? "Edit Subject" : "Create New Subject"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingSubject
                        ? "Update the subject details below."
                        : "Enter the details for the new subject."}
                    </DialogDescription>
                  </DialogHeader>
                  <SubjectForm
                    onSubmit={
                      editingSubject ? handleEditSubject : handleCreateSubject
                    }
                    initialValues={editingSubject || undefined}
                    teachers={teachers}
                    isEditing={!!editingSubject}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Credit Score</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>{subject.semester}</TableCell>
                    <TableCell>{subject.creditScore}</TableCell>
                    <TableCell>
                      {teachers.find((t) => t.id === subject.teacherId)?.name ||
                        "Not assigned"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        className="mr-2"
                        onClick={() => {
                          setEditingSubject(subject);
                          setIsDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteSubject(subject.id)}
                      >
                        Delete
                      </Button>
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
}
