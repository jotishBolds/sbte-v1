"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { SBTEUser, UserFormData, UserRole } from "@/types/types";

// Modified schema to make password optional and validate only when present
const userSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")), // Allow empty string for password
  role: z.enum(["SBTE_ADMIN", "EDUCATION_DEPARTMENT"]),
});

interface SBTEUserFormProps {
  initialData?: SBTEUser | null;
  onSuccess?: () => void;
}

const SBTEUserForm: React.FC<SBTEUserFormProps> = ({
  initialData,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      id: initialData?.id,
      username: initialData?.username || "",
      email: initialData?.email || "",
      role: initialData?.role || undefined,
      password: "",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      // Remove password from payload if it's empty (for updates)
      const submitData = { ...data };
      if (!submitData.password?.trim()) {
        delete submitData.password;
      }
      const url = data.id
        ? `/api/SBTEUserManagement/${data.id}`
        : "/api/SBTEUserManagement";

      const method = data.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) throw new Error("Failed to save user");

      toast({
        title: "Success",
        description: data.id
          ? "User updated successfully"
          : "User created successfully",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: "Failed to save user",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Username</Label>
        <Input {...register("username")} placeholder="Enter username" />
        {errors.username && (
          <p className="text-red-500 text-sm">{errors.username.message}</p>
        )}
      </div>

      <div>
        <Label>Email</Label>
        <Input {...register("email")} placeholder="Enter email" />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label>Password</Label>
        <Input
          type="password"
          {...register("password")}
          placeholder={
            initialData
              ? "Leave blank to keep current password"
              : "Enter password"
          }
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div>
        <Label>Role</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SBTE_ADMIN">SBTE Admin</SelectItem>
                <SelectItem value="EDUCATION_DEPARTMENT">
                  Education Department
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && (
          <p className="text-red-500 text-sm">{errors.role.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {initialData ? "Update User" : "Create User"}
      </Button>
    </form>
  );
};

export default SBTEUserForm;
