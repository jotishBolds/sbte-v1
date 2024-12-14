"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SideBarLayout from "@/components/sidebar/layout";
import { Upload } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters." }),
  establishedOn: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date.",
  }),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  IFSCCode: z.string().optional().or(z.literal("")),
  AccountNo: z.string().optional().or(z.literal("")),
  AccountHolderName: z.string().optional().or(z.literal("")),
  UPIID: z.string().optional().or(z.literal("")),
  abbreviation: z
    .string()
    .min(2, { message: "Abbreviation must be at least 2 characters." })
    .max(10, { message: "Abbreviation must be at most 10 characters." }),
  logo: z.instanceof(File).optional(),
  superAdminEmail: z
    .string()
    .email({ message: "Please enter a valid email for the Super Admin." }),
  superAdminPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." }),
});

type FormValues = z.infer<typeof formSchema>;

const CreateCollegePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      establishedOn: "",
      websiteUrl: "",
      contactEmail: "",
      contactPhone: "",
      IFSCCode: "",
      AccountNo: "",
      AccountHolderName: "",
      UPIID: "",
      abbreviation: "",
      superAdminEmail: "",
      superAdminPassword: "",
      username: "",
    },
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "SBTE_ADMIN") {
    router.push("/login");
    return null;
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Please upload a valid image file.");
        return;
      }

      if (file.size > maxSize) {
        setError("File size too large. Maximum size is 5MB.");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Set file for upload
      setLogoFile(file);
      form.setValue("logo", file);
      setError(null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      let logoPath = "";

      // Upload logo if exists
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append("logo", logoFile);
        logoFormData.append("abbreviation", values.abbreviation);

        const logoResponse = await fetch("/api/colleges/logoUpload", {
          method: "POST",
          body: logoFormData,
        });

        if (!logoResponse.ok) {
          const errorData = await logoResponse.json();
          throw new Error(errorData.error || "Failed to upload logo");
        }

        const logoData = await logoResponse.json();
        logoPath = logoData.logoPath;
      }

      // Prepare submission data
      const submissionData = {
        ...values,
        logo: logoPath,
      };

      // Submit college and super admin data
      const response = await fetch("/api/colleges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to create college and super admin"
        );
      }

      router.push("/colleges");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <Card className="shadow-xl border-none">
          <CardHeader className="border-b  pb-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div>
                <CardTitle className="text-2xl md:text-3xl font-semibold ">
                  Create New College
                </CardTitle>
                <CardDescription className="mt-2">
                  Configure comprehensive college details and admin account
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            {error && (
              <Alert variant="destructive" className="mb-6 rounded-lg">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* College Basic Information */}
                <div className=" p-6 rounded-lg  ">
                  <h3 className="text-xl font-semibold  mb-6 border-b pb-3">
                    College Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="abbreviation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>College Abbreviation</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter college abbreviation"
                              {...field}
                              className="w-full "
                            />
                          </FormControl>
                          <FormDescription>
                            Short, unique identifier (2-10 characters)
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormLabel>College Logo</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-4">
                          <Input
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif"
                            className="hidden"
                            id="logo-upload"
                            onChange={handleLogoChange}
                          />
                          <label
                            htmlFor="logo-upload"
                            className="flex items-center justify-center 
                            cursor-pointer bg-primary text-white 
                            hover:bg-primary/90 px-4 py-2 rounded-md 
                            transition-colors duration-200 w-full"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Logo
                          </label>
                          {logoPreview && (
                            <img
                              src={logoPreview}
                              alt="Logo Preview"
                              className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-md border"
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Max 5MB, JPG, PNG, GIF formats
                      </FormDescription>
                    </FormItem>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>College Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Full college name"
                              {...field}
                              className="w-full "
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Complete college address"
                              {...field}
                              className="w-full "
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Added Established On and Website URL Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <FormField
                      control={form.control}
                      name="establishedOn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Established On</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              placeholder="Select date"
                              {...field}
                              className="w-full "
                            />
                          </FormControl>
                          <FormDescription>
                            Date when the college was established
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="websiteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://www.college.edu"
                              {...field}
                              className="w-full "
                            />
                          </FormControl>
                          <FormDescription>
                            Official college website
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contact and Financial Information */}
                <div className=" p-6 rounded-lg ">
                  <h3 className="text-xl font-semibold  mb-6 border-b pb-3">
                    Contact & Financial Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="official@college.edu"
                              {...field}
                              className="w-full "
                            />
                          </FormControl>
                          <FormDescription>
                            Primary institutional email
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+91 (XXX) XXX-XXXX"
                              {...field}
                              className="w-full "
                            />
                          </FormControl>
                          <FormDescription>
                            Official contact number
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <FormField
                      control={form.control}
                      name="IFSCCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="BANK0001234"
                              {...field}
                              className="w-full "
                            />
                          </FormControl>
                          <FormDescription>Bank IFSC code</FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="AccountNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="XXXXXXXXXX"
                              {...field}
                              className="w-full "
                            />
                          </FormControl>
                          <FormDescription>
                            Institutional account
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="AccountHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter account holder name"
                              {...field}
                              className="w-full "
                            />
                          </FormControl>
                          <FormDescription>
                            Name of the account holder
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <FormField
                      control={form.control}
                      name="UPIID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UPI ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="college@upi"
                              {...field}
                              className="w-full "
                            />
                          </FormControl>
                          <FormDescription>Payment identifier</FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Super Admin Credentials */}
                <div className="p-6 rounded-lg ">
                  <h3 className="text-xl font-semibold  mb-6 border-b pb-3">
                    Super Admin Account
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="superAdminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="admin@college.edu"
                              {...field}
                              className="w-full "
                            />
                          </FormControl>
                          <FormDescription>
                            Primary administrative email
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="college_admin"
                              {...field}
                              className="w-full "
                            />
                          </FormControl>
                          <FormDescription>
                            Choose a unique username
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="superAdminPassword"
                    render={({ field }) => (
                      <FormItem className="mt-6">
                        <FormLabel>Admin Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Strong password"
                            {...field}
                            className="w-full "
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum 8 characters, include uppercase, lowercase,
                          numbers
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-center mt-8 w-full">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Loading...
                      </div>
                    ) : (
                      "Create College & Admin Account"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
};

export default CreateCollegePage;
