"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTag,
  FaBuilding,
} from "react-icons/fa";

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
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import SideBarLayout from "@/components/sidebar/layout";

// Schemas
const roleSchema = z.enum([
  "HOD",
  "TEACHER",
  "FINANCE_MANAGER",
  "STUDENT",
  "ALUMNUS",
]);

const userSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: roleSchema,
    departmentId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UserFormData = z.infer<typeof userSchema>;

// Form field configuration
const formFields = [
  { name: "username", label: "Username", icon: FaUser, type: "text" },
  { name: "email", label: "Email", icon: FaEnvelope, type: "email" },
  { name: "password", label: "Password", icon: FaLock, type: "password" },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    icon: FaLock,
    type: "password",
  },
];

interface Department {
  id: string;
  name: string;
}

const UserRegistrationForm: React.FC = () => {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showDepartmentField, setShowDepartmentField] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
      departmentId: undefined,
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    setShowDepartmentField(["HOD", "STUDENT"].includes(selectedRole));
  }, [selectedRole]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/departments");
        if (!response.ok) {
          throw new Error("Failed to fetch departments");
        }
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast({
          title: "Error",
          description: "Failed to fetch departments. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchDepartments();
  }, []);

  const onSubmit = async (data: UserFormData) => {
    try {
      const response = await fetch("/api/register-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create user");

      toast({ title: "Success", description: "User created successfully" });
      router.push("/create-user");
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderFormField = ({
    name,
    label,
    icon: Icon,
    type,
  }: (typeof formFields)[0]) => (
    <div key={name} className="space-y-2">
      <Label htmlFor={name} className="flex items-center text-sm font-medium">
        <Icon className="mr-2 text-gray-500" /> {label}
      </Label>
      <Input
        id={name}
        type={type}
        {...register(name as keyof UserFormData)}
        className="w-full"
      />
      {errors[name as keyof UserFormData] && (
        <p className="text-sm text-red-500">
          {errors[name as keyof UserFormData]?.message}
        </p>
      )}
    </div>
  );

  return (
    <SideBarLayout>
      <div className="flex flex-col justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2">
              User Registration
            </CardTitle>
            <CardDescription className="text-gray-600">
              Create a new user account by filling out the form below. Ensure
              all required fields are completed accurately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formFields.map(renderFormField)}
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
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role.message}</p>
                )}
              </div>

              {showDepartmentField && (
                <div className="space-y-2">
                  <Label
                    htmlFor="departmentId"
                    className="flex items-center text-sm font-medium"
                  >
                    <FaBuilding className="mr-2 text-gray-500" /> Department
                  </Label>
                  <Controller
                    name="departmentId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.departmentId && (
                    <p className="text-sm text-red-500">
                      {errors.departmentId.message}
                    </p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
};

export default UserRegistrationForm;
