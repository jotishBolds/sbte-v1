"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Code,
  Tag,
  Building,
  Settings,
  Loader2,
  Plus,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

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
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import SideBarLayout from "@/components/sidebar/layout";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import Link from "next/link";
import ProgramList from "../programs-list";

const programSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be less than 20 characters"),
  alias: z
    .string()
    .min(2, "Alias must be at least 2 characters")
    .max(50, "Alias must be less than 50 characters"),
  departmentId: z.string({
    required_error: "Please select a department",
  }),
  programTypeId: z.string({
    required_error: "Please select a program type",
  }),
  isActive: z.boolean().default(true),
});

type ProgramFormData = z.infer<typeof programSchema>;

const formFields = [
  { name: "name", label: "Program Name", icon: GraduationCap, type: "text" },
  { name: "code", label: "Program Code", icon: Code, type: "text" },
  { name: "alias", label: "Program Alias", icon: Tag, type: "text" },
];

export default function ProgramForm() {
  const router = useRouter();
  const [departments, setDepartments] = useState([]);
  const [programTypes, setProgramTypes] = useState([]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: "",
      code: "",
      alias: "",
      isActive: true,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptResponse, typeResponse] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/programs/programTypes"),
        ]);

        if (!deptResponse.ok || !typeResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [deptData, typeData] = await Promise.all([
          deptResponse.json(),
          typeResponse.json(),
        ]);

        setDepartments(deptData);
        setProgramTypes(typeData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch required data. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: ProgramFormData) => {
    try {
      const response = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create program");
      }

      toast({ title: "Success", description: "Program created successfully" });
      router.push("/programs/create");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create program",
        variant: "destructive",
      });
    }
  };

  return (
    <SideBarLayout>
      <TooltipProvider>
        <div className="container mx-auto px-4 py-6">
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/programs"
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary"
                >
                  Programs
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    Create New Program
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row gap-6">
            <Card className="flex-1">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      Create New Program
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Define a new academic program by providing the required
                      details.
                    </CardDescription>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/programs")}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Program Type
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create a new program type</TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formFields.map(({ name, label, icon: Icon, type }) => (
                      <div key={name} className="space-y-2">
                        <Label
                          htmlFor={name}
                          className="flex items-center text-sm font-medium"
                        >
                          <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {label}
                        </Label>
                        <Input
                          id={name}
                          type={type}
                          {...register(name as keyof ProgramFormData)}
                          className={
                            errors[name as keyof ProgramFormData]
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {errors[name as keyof ProgramFormData] && (
                          <p className="text-sm text-red-500">
                            {errors[name as keyof ProgramFormData]?.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="departmentId"
                        className="flex items-center text-sm font-medium"
                      >
                        <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                        Department
                      </Label>
                      <Controller
                        name="departmentId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger
                              className={
                                errors.departmentId ? "border-red-500" : ""
                              }
                            >
                              <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept: any) => (
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

                    <div className="space-y-2">
                      <Label
                        htmlFor="programTypeId"
                        className="flex items-center text-sm font-medium"
                      >
                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                        Program Type
                      </Label>
                      <Controller
                        name="programTypeId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger
                              className={
                                errors.programTypeId ? "border-red-500" : ""
                              }
                            >
                              <SelectValue placeholder="Select a program type" />
                            </SelectTrigger>
                            <SelectContent>
                              {programTypes.map((type: any) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.programTypeId && (
                        <p className="text-sm text-red-500">
                          {errors.programTypeId.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="isActive"
                        />
                      )}
                    />
                    <Label htmlFor="isActive">Active Program</Label>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-end gap-4">
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Program"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </TooltipProvider>
      <ProgramList />
    </SideBarLayout>
  );
}
