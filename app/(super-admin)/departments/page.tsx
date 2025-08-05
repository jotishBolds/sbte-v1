// app/departments/page.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SideBarLayout from "@/components/sidebar/layout";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { apiRequest, useApiRequest } from "@/lib/api-client";

interface Department {
  id: string;
  name: string;
  isActive: boolean;
  college: {
    name: string;
  };
}

const DepartmentsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [toggleConfirmation, setToggleConfirmation] = useState<{
    isOpen: boolean;
    department: Department | null;
  }>({ isOpen: false, department: null });

  // Use the new API request hooks
  const {
    loading: isLoading,
    error: fetchError,
    execute: executeRequest,
  } = useApiRequest<Department[]>();

  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const response = await executeRequest("/api/departments");
    if (response.data) {
      setDepartments(response.data);
    }
  };

  const handleCreateDepartment = () => {
    router.push("/department-creation");
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment) return;

    setUpdateLoading(true);
    try {
      const response = await apiRequest(
        `/api/departments/${editingDepartment.id}`,
        {
          method: "PUT",
          body: editingDepartment,
        }
      );

      if (response.error) {
        console.error("Error updating department:", response.error);
      } else {
        setDepartments((prevDepartments) =>
          prevDepartments.map((dept) =>
            dept.id === editingDepartment.id ? editingDepartment : dept
          )
        );
        setEditingDepartment(null);
      }
    } catch (error) {
      console.error("Error updating department:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    setDeleteLoading(true);
    try {
      const response = await apiRequest(`/api/departments/${id}`, {
        method: "DELETE",
      });

      if (response.error) {
        console.error("Error deleting department:", response.error);
      } else {
        setDepartments(departments.filter((dept) => dept.id !== id));
      }
    } catch (error) {
      console.error("Error deleting department:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (department: Department) => {
    setToggleConfirmation({ isOpen: true, department });
  };

  const confirmToggleActive = async () => {
    if (!toggleConfirmation.department) return;

    setToggleLoading(true);
    try {
      const updatedDepartment = {
        ...toggleConfirmation.department,
        isActive: !toggleConfirmation.department.isActive,
      };

      const response = await apiRequest(
        `/api/departments/${updatedDepartment.id}`,
        {
          method: "PUT",
          body: { isActive: updatedDepartment.isActive },
        }
      );

      if (response.error) {
        console.error("Error updating department status:", response.error);
      } else {
        setDepartments((prevDepartments) =>
          prevDepartments.map((dept) =>
            dept.id === updatedDepartment.id ? updatedDepartment : dept
          )
        );
      }
    } catch (error) {
      console.error("Error updating department status:", error);
    } finally {
      setToggleConfirmation({ isOpen: false, department: null });
      setToggleLoading(false);
    }
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
        <h1 className="text-2xl font-bold mb-5">Departments</h1>
        <Button onClick={handleCreateDepartment} className="mb-5">
          Create New Department
        </Button>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell>{department.name}</TableCell>
                <TableCell>{department.college.name}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={department.isActive}
                      onCheckedChange={() => handleToggleActive(department)}
                    />
                    <Badge
                      className={
                        department.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {department.isActive ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" /> Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => handleEditDepartment(department)}
                  >
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to delete this department?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the department and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteDepartment(department.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {editingDepartment && (
          <AlertDialog
            open={!!editingDepartment}
            onOpenChange={() => setEditingDepartment(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Edit Department</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editingDepartment.name}
                    onChange={(e) =>
                      setEditingDepartment({
                        ...editingDepartment,
                        name: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleUpdateDepartment}>
                  Save Changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <AlertDialog
          open={toggleConfirmation.isOpen}
          onOpenChange={(isOpen) =>
            setToggleConfirmation({ ...toggleConfirmation, isOpen })
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirm Department Status Change
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to{" "}
                {toggleConfirmation.department?.isActive ? "disable" : "enable"}{" "}
                the department &quot;{toggleConfirmation.department?.name}
                &quot;?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmToggleActive}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SideBarLayout>
  );
};

export default DepartmentsPage;
