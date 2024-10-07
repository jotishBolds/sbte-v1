"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Label } from "@/components/ui/label";
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
import { toast } from "@/components/ui/use-toast";
import {
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaUserTag,
  FaEdit,
  FaTrash,
  FaUserPlus,
} from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import SideBarLayout from "@/components/sidebar/layout";

const roleSchema = z.enum([
  "HOD",
  "TEACHER",
  "FINANCE_MANAGER",
  "STUDENT",
  "ALUMNUS",
]);

type Role = z.infer<typeof roleSchema>;

interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
}

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  role: roleSchema,
});

type UserFormData = z.infer<typeof userSchema>;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/register-users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({
      username: user.username,
      email: user.email,
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/register-users/${userId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete user");
        }
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({
          title: "Error",
          description: "Failed to delete user. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = async (data: UserFormData) => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/register-users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start gap-2 md:gap-0 md:items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              User Management
            </CardTitle>
            <Link href="/create-user">
              <Button>
                <FaUserPlus className="mr-2" />
                Add New User
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p>No users found for your college.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Username</TableHead>
                      <TableHead className="w-1/4 hidden md:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="w-1/4 hidden md:table-cell">
                        Role
                      </TableHead>
                      <TableHead className="w-1/4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.username}
                          <div className="md:hidden mt-1 text-sm text-gray-500">
                            {user.email}
                            <br />
                            {user.role}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.role}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              <FaEdit className="mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                            >
                              <FaTrash className="mr-2" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {users.length > itemsPerPage && (
              <Pagination className="mt-4">
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                      />
                    </PaginationItem>
                  )}
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <PaginationItem
                      key={index}
                      className="hidden md:inline-block"
                    >
                      <PaginationLink
                        onClick={() => handlePageChange(index + 1)}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Edit User
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="flex items-center text-sm font-medium"
                >
                  <FaUser className="mr-2 text-gray-500" /> Username
                </Label>
                <Input
                  id="username"
                  {...register("username")}
                  className="w-full"
                />
                {errors.username && (
                  <p className="text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="flex items-center text-sm font-medium"
                >
                  <FaEnvelope className="mr-2 text-gray-500" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="role"
                  className="flex items-center text-sm font-medium"
                >
                  <FaUserTag className="mr-2 text-gray-500" /> Role
                </Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleSchema.options.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role?.message && (
                  <p className="text-sm text-red-500">{errors.role.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update User"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SideBarLayout>
  );
};

export default UserManagement;
