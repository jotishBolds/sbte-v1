// File: app/profile/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import SideBarLayout from "@/components/sidebar/layout";

interface ProfileData {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  headOfDepartment?: {
    name?: string;
    phoneNo?: string;
    address?: string;
    qualification?: string;
    experience?: string;
    departmentId?: string;
  };
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData>({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/profile");
          const data = await response.json();
          setProfile((prevProfile) => ({
            ...prevProfile,
            ...data,
            username: data.username || "",
            email: data.email || "",
            headOfDepartment: data.headOfDepartment || {},
          }));
        } catch (error) {
          console.error("Error fetching profile:", error);
          setMessage("Failed to load profile data.");
        }
      }
    };

    fetchProfile();
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleHODChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      headOfDepartment: {
        ...prevProfile.headOfDepartment,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      setMessage(data.message);

      // Clear password fields after successful update
      setProfile((prevProfile) => ({
        ...prevProfile,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      setMessage("An error occurred while updating the profile.");
    }
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Profile Management</h1>
        <Tabs defaultValue="account" className="space-y-4">
          <TabsList>
            <TabsTrigger value="account">Account Information</TabsTrigger>
            {session?.user?.role === "HOD" && (
              <TabsTrigger value="hod">HOD Information</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold">Account Details</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={profile.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />
                  </div>
                  <Separator />
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={profile.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={profile.newPassword}
                      onChange={handleChange}
                      placeholder="Enter your new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={profile.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your new password"
                    />
                  </div>
                  <CardFooter className="flex justify-end pt-4">
                    <Button type="submit">Update Account</Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          {session?.user?.role === "HOD" && (
            <TabsContent value="hod">
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold">HOD Information</h2>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={profile.headOfDepartment?.name || ""}
                        onChange={handleHODChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNo">Phone Number</Label>
                      <Input
                        id="phoneNo"
                        name="phoneNo"
                        value={profile.headOfDepartment?.phoneNo || ""}
                        onChange={handleHODChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={profile.headOfDepartment?.address || ""}
                        onChange={handleHODChange}
                        placeholder="Enter your address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="qualification">Qualification</Label>
                      <Input
                        id="qualification"
                        name="qualification"
                        value={profile.headOfDepartment?.qualification || ""}
                        onChange={handleHODChange}
                        placeholder="Enter your qualification"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience</Label>
                      <Textarea
                        id="experience"
                        name="experience"
                        value={profile.headOfDepartment?.experience || ""}
                        onChange={handleHODChange}
                        placeholder="Describe your experience"
                      />
                    </div>
                    <CardFooter className="flex justify-end pt-4">
                      <Button type="submit">Update HOD Information</Button>
                    </CardFooter>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
        {message && (
          <Alert className="mt-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </div>
    </SideBarLayout>
  );
}
