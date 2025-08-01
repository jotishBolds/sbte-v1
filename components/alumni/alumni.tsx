"use client";
import React, { useState, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdmissionYear, BatchYear, Program } from "@prisma/client";
import ProfilePictureUpload from "./upload-profile-pic/profile-pic";

interface Department {
  id: string;
  name: string;
  college: {
    name: string;
  };
}

const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
  phoneNo: z.string().min(10).max(15),
  dateOfBirth: z.string(),
  address: z.string().min(5).max(255),
  departmentId: z.string(),
  programId: z.string(),
  batchYearId: z.string(),
  profilePic: z.string().optional(),
  admissionYearId: z.string(),
  batchYear: z.number().int().min(1900).max(new Date().getFullYear()),
  graduationYear: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 5),
  gpa: z.number().min(0).max(10).optional(),
  jobStatus: z.string().optional(),
  currentEmployer: z.string().optional(),
  currentPosition: z.string().optional(),
  industry: z.string().optional(),
  linkedInProfile: z.string().url().optional(),
  achievements: z.string().optional(),
});

class AlumniRegistrationError extends Error {
  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = "AlumniRegistrationError";

    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
        scope.setLevel("error");
        Sentry.captureException(this);
      });
    }
  }
}

export default function AlumniRegistrationForm() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [batchYears, setBatchYears] = useState<BatchYear[]>([]);
  const [admissionYears, setAdmissionYears] = useState<AdmissionYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
  const [isLoadingBatchYears, setIsLoadingBatchYears] = useState(true);
  const [isLoadingAdmissionYears, setIsLoadingAdmissionYears] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      name: "",
      phoneNo: "",
      dateOfBirth: "",
      address: "",
      departmentId: "",
      programId: "",
      batchYearId: "",
      admissionYearId: "",
      batchYear: new Date().getFullYear(),
      graduationYear: new Date().getFullYear(),
      gpa: undefined,
      jobStatus: "",
      currentEmployer: "",
      currentPosition: "",
      industry: "",
      linkedInProfile: "",
      achievements: "",
    },
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoadingDepartments(true);
      try {
        await Sentry.startSpan(
          {
            name: "Fetch Departments",
            op: "http",
          },
          async () => {
            const response = await fetch("/api/departments/alumni");
            if (!response.ok) {
              throw new AlumniRegistrationError("Failed to fetch departments", {
                status: response.status,
                statusText: response.statusText,
              });
            }
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              setDepartments(data);
            } else {
              const errorMessage = "Received empty or invalid departments data";
              console.error(errorMessage, data);
              throw new AlumniRegistrationError(errorMessage, {
                responseData: data,
              });
            }
          }
        );
      } catch (error) {
        console.error("Error fetching departments:", error);
        if (!(error instanceof AlumniRegistrationError)) {
          Sentry.captureException(
            new AlumniRegistrationError("Failed to load departments", {
              originalError:
                error instanceof Error ? error.message : String(error),
            })
          );
        }
        toast({
          title: "Error",
          description: "Failed to load departments. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchRelatedData = async () => {
      if (form.watch("departmentId")) {
        setIsLoadingPrograms(true);
        setIsLoadingBatchYears(true);
        setIsLoadingAdmissionYears(true);

        try {
          await Sentry.startSpan(
            {
              name: "Fetch Related Data",
              op: "http",
            },
            async () => {
              const [programsRes, batchYearsRes, admissionYearsRes] =
                await Promise.all([
                  fetch(`/api/programs/alumni/${form.watch("departmentId")}`),
                  fetch(`/api/batchYear/alumni/${form.watch("departmentId")}`),
                  fetch(
                    `/api/admissionYear/alumni/${form.watch("departmentId")}`
                  ),
                ]);

              if (
                !programsRes.ok ||
                !batchYearsRes.ok ||
                !admissionYearsRes.ok
              ) {
                throw new AlumniRegistrationError(
                  "Failed to fetch related data",
                  {
                    departmentId: form.watch("departmentId"),
                    programsStatus: programsRes.status,
                    batchYearsStatus: batchYearsRes.status,
                    admissionYearsStatus: admissionYearsRes.status,
                  }
                );
              }

              const [programsData, batchYearsData, admissionYearsData] =
                await Promise.all([
                  programsRes.json(),
                  batchYearsRes.json(),
                  admissionYearsRes.json(),
                ]);

              setPrograms(programsData);
              setBatchYears(batchYearsData);
              setAdmissionYears(admissionYearsData);
            }
          );
        } catch (error) {
          console.error("Error fetching related data:", error);
          if (!(error instanceof AlumniRegistrationError)) {
            Sentry.captureException(
              new AlumniRegistrationError("Failed to load related data", {
                departmentId: form.watch("departmentId"),
                originalError:
                  error instanceof Error ? error.message : String(error),
              })
            );
          }
          toast({
            title: "Error",
            description: "Failed to load related data. Please try again later.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingPrograms(false);
          setIsLoadingBatchYears(false);
          setIsLoadingAdmissionYears(false);
        }
      }
    };

    fetchRelatedData();
  }, [form.watch("departmentId")]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await Sentry.startSpan(
        {
          name: "Alumni Registration",
          op: "auth",
        },
        async () => {
          const response = await fetch("/api/register-alumni", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new AlumniRegistrationError(
              errorData.error || "Registration failed",
              {
                status: response.status,
                errorData,
                formValues: {
                  username: values.username,
                  email: values.email,
                  departmentId: values.departmentId,
                },
              }
            );
          }

          toast({
            title: "Registration Successful",
            description: "You have successfully registered as an alumnus.",
          });
          router.push("/login");
        }
      );
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof AlumniRegistrationError) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Failed",
          description:
            "There was an error during registration. Please try again.",
          variant: "destructive",
        });
        Sentry.captureException(
          new AlumniRegistrationError("Unexpected registration error", {
            originalError:
              error instanceof Error ? error.message : String(error),
            formValues: {
              username: values.username,
              email: values.email,
            },
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome, Future Alumni!
          </h1>
          <p className="text-xl text-muted-foreground">
            Join our vibrant community and stay connected with your alma mater.
          </p>
        </div>

        <Card className="border shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              Alumni Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="profilePic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Picture</FormLabel>
                        <FormControl>
                          <ProfilePictureUpload
                            alumniId={null}
                            currentProfilePic={field.value}
                            onUploadSuccess={(path) => field.onChange(path)}
                            isSubmitting={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Username"
                            {...field}
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="youremail@sbte.com"
                            {...field}
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your Full Name"
                            {...field}
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1234567890"
                            {...field}
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Gangtok, Sikkim 737102"
                            {...field}
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoadingDepartments}
                        >
                          <FormControl>
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name} - {dept.college.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Please select a department.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="programId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoadingPrograms}
                        >
                          <FormControl>
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select a program" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {programs.map((program) => (
                              <SelectItem key={program.id} value={program.id}>
                                {program.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Please select a program.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="batchYearId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch Year</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoadingBatchYears}
                        >
                          <FormControl>
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select a batch year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {batchYears.map((batchYear) => (
                              <SelectItem
                                key={batchYear.id}
                                value={batchYear.id}
                              >
                                {batchYear.year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Please select your batch year.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="admissionYearId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission Year</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoadingAdmissionYears}
                        >
                          <FormControl>
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select admission year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {admissionYears.map((admissionYear) => (
                              <SelectItem
                                key={admissionYear.id}
                                value={admissionYear.id}
                              >
                                {admissionYear.year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Please select your admission year.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="graduationYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Graduation Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gpa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GPA</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Status</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Employed, Unemployed, Student, etc."
                            {...field}
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentEmployer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Employer</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Company Name"
                            {...field}
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Position</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Job Title"
                            {...field}
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Technology, Healthcare, Finance"
                            {...field}
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkedInProfile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Profile</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://www.linkedin.com/in/username"
                            {...field}
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="achievements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Achievements</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Notable accomplishments or awards"
                            {...field}
                            className=""
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-8">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full "
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Already registered?{" "}
            <a href="/login" className="text-blue-700 hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
