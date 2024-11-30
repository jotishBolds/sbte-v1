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

  const onSubmit = async (values: FormValues) => {
    setError(null);

    try {
      const response = await fetch("/api/colleges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
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
    }
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Create New College and Super Admin</CardTitle>
            <CardDescription>
              Enter the details of the new college and its super admin below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<FormValues, "name">;
                  }) => (
                    <FormItem>
                      <FormLabel>College Name</FormLabel>
                      <FormControl>
                        <Input placeholder="College name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the official name of the college.
                      </FormDescription>
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
                        <Input placeholder="College address" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide the full address of the college.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="establishedOn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Established On</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Select the date when the college was established.
                      </FormDescription>
                      <FormMessage />
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
                          type="url"
                          placeholder="https://www.example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the college &apos; s official website URL
                        (optional).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide the main contact email for the college
                        (optional).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1234567890"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the main contact phone number for the college
                        (optional).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="IFSCCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter IFSC Code" {...field} />
                      </FormControl>
                      <FormDescription>
                        Bank IFSC Code (optional)
                      </FormDescription>
                      <FormMessage />
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
                        <Input placeholder="Enter Account Number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Bank Account Number (optional)
                      </FormDescription>
                      <FormMessage />
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
                          placeholder="Enter Account Holder Name"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Bank Account Holder Name (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="UPIID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UPI ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter UPI ID" {...field} />
                      </FormControl>
                      <FormDescription>
                        UPI Payment ID (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="superAdminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super Admin Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="superadmin@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the email for the College Super Admin account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="superAdminPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super Admin Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a strong password for the College Super Admin
                        account.
                      </FormDescription>
                      <FormMessage />
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
                        <Input placeholder="Enter username" {...field} />
                      </FormControl>
                      <FormDescription>
                        Choose a username for the College Super Admin account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Create College and Super Admin</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
};

export default CreateCollegePage;
