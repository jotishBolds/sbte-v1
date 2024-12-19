"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
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
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaCalendar,
  FaVenusMars,
  FaPray,
  FaUsers,
  FaHome,
  FaWheelchair,
  FaRing,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import DeleteModal from "@/components/modals/deleteModal";

const roleSchema = z.enum([
  "HOD",
  "TEACHER",
  "FINANCE_MANAGER",
  "STUDENT",
  "ALUMNUS",
]);

type Role = z.infer<typeof roleSchema>;
const casteSchema = z.enum(["GENERAL", "OBC", "ST", "SC"]);
interface TeacherDesignation {
  id: string;
  name: string;
}

interface EmployeeCategory {
  id: string;
  name: string;
}

// Base user interface
interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
}

// Role-specific additional fields schema
const baseFieldsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNo: z.string().optional(),
  address: z.string().optional(),
});

const hodFieldsSchema = baseFieldsSchema.extend({
  qualification: z.string().optional(),
  experience: z.string().optional(),
});

const teacherFieldsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNo: z.string().optional(),
  address: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.string().optional(),
  designationId: z.string().optional(),
  categoryId: z.string().optional(),
  joiningDate: z.string().optional(),
  gender: z.string().optional(),
  religion: z.string().optional(),
  caste: casteSchema.optional(),
  hasResigned: z.boolean().optional(),
  maritalStatus: z
    .enum(["MARRIED", "WIDOWED", "SEPARATED", "DIVORCED", "SINGLE"])
    .optional(),
  isLocalResident: z.boolean().optional(),
  isDifferentlyAbled: z.boolean().optional(),
});

const financeManagerFieldsSchema = baseFieldsSchema;

const studentFieldsSchema = baseFieldsSchema.extend({
  dob: z.string().optional(),
  programId: z.string().optional(),
  departmentId: z.string().optional(),
  gender: z.string().optional(),
  isLocalStudent: z.boolean().optional(),
  isDifferentlyAbled: z.boolean().optional(),
});

const alumnusFieldsSchema = baseFieldsSchema.extend({
  dateOfBirth: z.string().optional(),
  departmentId: z.string().optional(),
  programId: z.string().optional(),
  graduationYear: z.number().optional(),
  jobStatus: z.string().optional(),
  currentEmployer: z.string().optional(),
  currentPosition: z.string().optional(),
  industry: z.string().optional(),
  linkedInProfile: z.string().optional(),
  achievements: z.string().optional(),
  verified: z.boolean().optional(),
});

// Combined schema for all possible fields
const userSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    role: roleSchema,
  })
  .and(
    z.union([
      teacherFieldsSchema,
      hodFieldsSchema,
      financeManagerFieldsSchema,
      studentFieldsSchema,
      alumnusFieldsSchema,
    ])
  );

type UserFormData = z.infer<typeof userSchema>;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [designations, setDesignations] = useState<TeacherDesignation[]>([]);
  const [categories, setCategories] = useState<EmployeeCategory[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete modal
  const [userToDelete, setUserToDelete] = useState<string | null>(null); // User ID to delete
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      hasResigned: false,
      isLocalResident: false,
      isDifferentlyAbled: false,
    },
  });

  const currentRole = watch("role");

  useEffect(() => {
    fetchUsers();
    fetchDesignations();
    fetchCategories();
  }, []);

  // Fetch designations
  const fetchDesignations = async () => {
    try {
      const response = await fetch("/api/teacherDesignation");
      if (!response.ok) throw new Error("Failed to fetch designations");
      const data = await response.json();
      setDesignations(data);
    } catch (error) {
      console.error("Error fetching designations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch designations.",
        variant: "destructive",
      });
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/employeeCategory");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories.",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/register-users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({
      username: user.username,
      email: user.email,
      role: user.role,
      ...(user as any),
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/register-users/${userToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
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
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
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

      if (!response.ok) throw new Error("Failed to update user");

      await fetchUsers();

      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderRoleSpecificFields = () => {
    switch (currentRole) {
      case "TEACHER":
        return (
          <>
            <ScrollArea className="h-80 w-full rounded-md border">
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div className=" p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 ">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center ">
                        <FaUser className="mr-2 " /> Full Name
                      </Label>
                      <Input
                        {...register("name")}
                        className=""
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNo" className="flex items-center ">
                        <FaPhone className="mr-2 " /> Phone Number
                      </Label>
                      <Input
                        {...register("phoneNo")}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="flex items-center ">
                        <FaVenusMars className="mr-2 " /> Gender
                      </Label>
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MALE">Male</SelectItem>
                              <SelectItem value="FEMALE">Female</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="maritalStatus"
                        className="flex items-center "
                      >
                        <FaRing className="mr-2 " /> Marital Status
                      </Label>
                      <Controller
                        name="maritalStatus"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MARRIED">Married</SelectItem>
                              <SelectItem value="WIDOWED">Widowed</SelectItem>
                              <SelectItem value="SEPARATED">
                                Separated
                              </SelectItem>
                              <SelectItem value="DIVORCED">Divorced</SelectItem>
                              <SelectItem value="SINGLE">Single</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="religion" className="flex items-center ">
                        <FaPray className="mr-2 " /> Religion
                      </Label>
                      <Input
                        {...register("religion")}
                        placeholder="Enter religion"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="caste" className="flex items-center">
                        <FaUsers className="mr-2" /> Caste
                      </Label>
                      <Controller
                        name="caste"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select caste" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GENERAL">General</SelectItem>
                              <SelectItem value="OBC">OBC</SelectItem>
                              <SelectItem value="ST">ST</SelectItem>
                              <SelectItem value="SC">SC</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="address" className="flex items-center ">
                      <FaMapMarkerAlt className="mr-2 " /> Address
                    </Label>
                    <Textarea
                      {...register("address")}
                      className="mt-2 "
                      placeholder="Enter complete address"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className="p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 ">
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="qualification"
                        className="flex items-center "
                      >
                        <FaGraduationCap className="mr-2 " /> Qualification
                      </Label>
                      <Input
                        {...register("qualification")}
                        className=""
                        placeholder="Enter qualification"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="experience"
                        className="flex items-center "
                      >
                        <FaBriefcase className="mr-2 " /> Experience
                      </Label>
                      <Input
                        {...register("experience")}
                        className=""
                        placeholder="Years of experience"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="designationId"
                        className="flex items-center "
                      >
                        <FaUserTag className="mr-2 " /> Designation
                      </Label>
                      <Controller
                        name="designationId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select designation" />
                            </SelectTrigger>
                            <SelectContent>
                              {designations.map((designation) => (
                                <SelectItem
                                  key={designation.id}
                                  value={designation.id}
                                >
                                  {designation.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="categoryId"
                        className="flex items-center "
                      >
                        <FaUsers className="mr-2 " /> Category
                      </Label>
                      <Controller
                        name="categoryId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="joiningDate"
                        className="flex items-center "
                      >
                        <FaCalendar className="mr-2 " /> Joining Date
                      </Label>
                      <Input
                        type="date"
                        {...register("joiningDate")}
                        className=""
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className=" p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 ">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4  rounded-lg">
                      <Label
                        htmlFor="hasResigned"
                        className="flex items-center "
                      >
                        <FaBriefcase className="mr-2 " /> Has Resigned
                      </Label>
                      <Controller
                        name="hasResigned"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4  rounded-lg">
                      <Label
                        htmlFor="isLocalResident"
                        className="flex items-center "
                      >
                        <FaHome className="mr-2 " /> Local Resident
                      </Label>
                      <Controller
                        name="isLocalResident"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4  rounded-lg">
                      <Label
                        htmlFor="isDifferentlyAbled"
                        className="flex items-center "
                      >
                        <FaWheelchair className="mr-2 " /> Differently Abled
                      </Label>
                      <Controller
                        name="isDifferentlyAbled"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        );
      case "HOD":
        return (
          <ScrollArea className="h-80 w-full rounded-md border">
            <div className="space-y-6">
              {/* Personal Information Section */}
              <div className=" p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4 ">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center ">
                      <FaUser className="mr-2 " /> Full Name
                    </Label>
                    <Input
                      {...register("name")}
                      className=""
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNo" className="flex items-center ">
                      <FaPhone className="mr-2 " /> Phone Number
                    </Label>
                    <Input
                      {...register("phoneNo")}
                      className=""
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="col-span-full">
                    <Label htmlFor="address" className="flex items-center ">
                      <FaMapMarkerAlt className="mr-2 " /> Address
                    </Label>
                    <Textarea
                      {...register("address")}
                      className=""
                      placeholder="Enter complete address"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className=" p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4 ">
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="qualification"
                      className="flex items-center "
                    >
                      <FaGraduationCap className="mr-2 " /> Qualification
                    </Label>
                    <Input
                      {...register("qualification")}
                      className=""
                      placeholder="Enter qualification"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="flex items-center ">
                      <FaBriefcase className="mr-2 " /> Experience
                    </Label>
                    <Input
                      {...register("experience")}
                      className=""
                      placeholder="Years of experience"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        );
      case "STUDENT":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="dob" className="flex items-center">
                <FaUser className="mr-2" /> Date of Birth
              </Label>
              <Input type="date" {...register("dob")} />
            </div>
          </>
        );
      case "ALUMNUS":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="graduationYear" className="flex items-center">
                <FaGraduationCap className="mr-2" /> Graduation Year
              </Label>
              <Input
                type="number"
                {...register("graduationYear", { valueAsNumber: true })}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Pagination calculation
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
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : users.length === 0 ? (
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
                          <div className="md:hidden mt-1 text-sm ">
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
          <DialogContent className="sm:max-w-[425px] md:max-w-[80%] lg:max-w-[1000px] p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Edit User
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Base fields */}
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center">
                  <FaUser className="mr-2" /> Username
                </Label>
                <Input {...register("username")} />
                {errors.username && (
                  <p className="text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <FaEnvelope className="mr-2" /> Email
                </Label>
                <Input type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center">
                  <FaUserTag className="mr-2" /> Role
                </Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
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
              </div>

              {/* Role-specific fields */}
              {renderRoleSpecificFields()}

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

        {/* Delete Modal */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      </div>
    </SideBarLayout>
  );
};

export default UserManagement;
