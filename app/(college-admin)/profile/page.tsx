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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SideBarLayout from "@/components/sidebar/layout";
import { Switch } from "@/components/ui/switch";

interface ProfileData {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  teacher?: {
    name?: string;
    phoneNo?: string;
    address?: string;
    qualification?: string;
    designationId?: string;
    categoryId?: string;
    experience?: string;
    maritalStatus?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
    joiningDate?: string;
    gender?: string;
    religion?: string;
    caste?: "GENERAL" | "OBC" | "SC" | "ST";
    isLocalResident?: boolean;
    isDifferentlyAbled?: boolean;
    hasResigned?: boolean;
  };
  headOfDepartment?: {
    name?: string;
    phoneNo?: string;
    address?: string;
    qualification?: string;
    experience?: string;
  };
  alumnus?: {
    jobStatus?: string;
    currentEmployer?: string;
    currentPosition?: string;
    industry?: string;
  };
}

type EmployeeCategory = {
  id: string;
  name: string;
  alias: string;
  description?: string;
};

type TeacherDesignation = {
  id: string;
  name: string;
  alias: string;
  description?: string;
};
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
  const [designations, setDesignations] = useState<TeacherDesignation[]>([]);
  const [categories, setCategories] = useState<EmployeeCategory[]>([]);
  useEffect(() => {
    const fetchProfileAndOptions = async () => {
      if (session?.user) {
        try {
          const [profileResponse, designationsResponse, categoriesResponse] =
            await Promise.all([
              fetch("/api/profile"),
              fetch("/api/teacherDesignation"),
              fetch("/api/employeeCategory"),
            ]);

          const profileData = await profileResponse.json();
          const designationsData = await designationsResponse.json();
          const categoriesData = await categoriesResponse.json();

          setProfile((prevProfile) => ({
            ...prevProfile,
            username: profileData.user.username || "",
            email: profileData.user.email || "",
            teacher: profileData.user.teacher || {},
            headOfDepartment: profileData.user.headOfDepartment || {},
            alumnus: profileData.user.alumnus || {},
          }));

          setDesignations(designationsData);
          setCategories(categoriesData);
        } catch (error) {
          console.error("Error fetching data:", error);
          setMessage("Failed to load profile data.");
        }
      }
    };

    fetchProfileAndOptions();
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

  const handleTeacherChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      teacher: {
        ...prevProfile.teacher,
        [name]: value,
      },
    }));
  };

  const handleTeacherSelectChange = (name: string, value: string) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      teacher: {
        ...prevProfile.teacher,
        [name]: value,
      },
    }));
  };

  const handleTeacherCheckboxChange = (name: string, checked: boolean) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      teacher: {
        ...prevProfile.teacher,
        [name]: checked,
      },
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
  const handleAlumnusChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      alumnus: {
        ...prevProfile.alumnus,
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

      console.log("this is profile", profile);
      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setProfile((prevProfile) => ({
          ...prevProfile,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }
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
            {session?.user?.role === "TEACHER" && (
              <TabsTrigger value="teacher">Teacher Information</TabsTrigger>
            )}
            {session?.user?.role === "HOD" && (
              <TabsTrigger value="hod">HOD Information</TabsTrigger>
            )}
            {session?.user?.role === "ALUMNUS" && (
              <TabsTrigger value="alumnus">Alumni Information</TabsTrigger>
            )}
          </TabsList>

          {/* Account Information Tab */}
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
          {/* Alumnus Information Tab */}
          {session?.user?.role === "ALUMNUS" && (
            <TabsContent value="alumnus">
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold">Alumni Information</h2>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobStatus">Job Status</Label>
                      <Input
                        id="jobStatus"
                        name="jobStatus"
                        value={profile.alumnus?.jobStatus || ""}
                        onChange={handleAlumnusChange}
                        placeholder="Enter your current job status"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentEmployer">Current Employer</Label>
                      <Input
                        id="currentEmployer"
                        name="currentEmployer"
                        value={profile.alumnus?.currentEmployer || ""}
                        onChange={handleAlumnusChange}
                        placeholder="Enter your current employer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentPosition">Current Position</Label>
                      <Input
                        id="currentPosition"
                        name="currentPosition"
                        value={profile.alumnus?.currentPosition || ""}
                        onChange={handleAlumnusChange}
                        placeholder="Enter your current position"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        name="industry"
                        value={profile.alumnus?.industry || ""}
                        onChange={handleAlumnusChange}
                        placeholder="Enter your industry"
                      />
                    </div>
                    <CardFooter className="flex justify-end pt-4">
                      <Button type="submit">Update Alumni Information</Button>
                    </CardFooter>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          {/* Teacher Information Tab */}
          {session?.user?.role === "TEACHER" && (
            <TabsContent value="teacher">
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-semibold">
                    Teacher Information
                  </h2>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={profile.teacher?.name || ""}
                        onChange={handleTeacherChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNo">Phone Number</Label>
                      <Input
                        id="phoneNo"
                        name="phoneNo"
                        value={profile.teacher?.phoneNo || ""}
                        onChange={handleTeacherChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={profile.teacher?.address || ""}
                        onChange={handleTeacherChange}
                        placeholder="Enter your address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="qualification">Qualification</Label>
                      <Input
                        id="qualification"
                        name="qualification"
                        value={profile.teacher?.qualification || ""}
                        onChange={handleTeacherChange}
                        placeholder="Enter your qualification"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designationId">Designation</Label>
                      <Select
                        value={profile.teacher?.designationId || ""}
                        onValueChange={(value) =>
                          handleTeacherSelectChange("designationId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select designation" />
                        </SelectTrigger>
                        <SelectContent>
                          {designations &&
                            designations.map((designation) => (
                              <SelectItem
                                key={designation.id}
                                value={designation.id}
                              >
                                {designation.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryId">Category</Label>
                      <Select
                        value={profile.teacher?.categoryId || ""}
                        onValueChange={(value) =>
                          handleTeacherSelectChange("categoryId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience</Label>
                      <Input
                        id="experience"
                        name="experience"
                        value={profile.teacher?.experience || ""}
                        onChange={handleTeacherChange}
                        placeholder="Enter your experience"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus">Marital Status</Label>
                      <Select
                        value={profile.teacher?.maritalStatus}
                        onValueChange={(value) =>
                          handleTeacherSelectChange("maritalStatus", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select marital status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SINGLE">Single</SelectItem>
                          <SelectItem value="MARRIED">Married</SelectItem>
                          <SelectItem value="DIVORCED">Divorced</SelectItem>
                          <SelectItem value="WIDOWED">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joiningDate">Joining Date</Label>
                      <Input
                        id="joiningDate"
                        name="joiningDate"
                        type="date"
                        value={
                          profile.teacher?.joiningDate?.split("T")[0] || ""
                        }
                        onChange={handleTeacherChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={profile.teacher?.gender}
                        onValueChange={(value) =>
                          handleTeacherSelectChange("gender", value)
                        }
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="religion">Religion</Label>
                      <Input
                        id="religion"
                        name="religion"
                        value={profile.teacher?.religion || ""}
                        onChange={handleTeacherChange}
                        placeholder="Enter your religion"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="caste">Caste</Label>
                      <Select
                        value={profile.teacher?.caste}
                        onValueChange={(value) =>
                          handleTeacherSelectChange("caste", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select caste" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GENERAL">General</SelectItem>
                          <SelectItem value="OBC">OBC</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="ST">ST</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isLocalResident"
                        checked={profile.teacher?.isLocalResident || false}
                        onCheckedChange={(checked) =>
                          handleTeacherCheckboxChange(
                            "isLocalResident",
                            checked
                          )
                        }
                      />
                      <Label htmlFor="isLocalResident">Local Resident</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isDifferentlyAbled"
                        checked={profile.teacher?.isDifferentlyAbled || false}
                        onCheckedChange={(checked) =>
                          handleTeacherCheckboxChange(
                            "isDifferentlyAbled",
                            checked
                          )
                        }
                      />
                      <Label htmlFor="isDifferentlyAbled">
                        Differently Abled
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hasResigned"
                        checked={profile.teacher?.hasResigned || false}
                        onCheckedChange={(checked) =>
                          handleTeacherCheckboxChange("hasResigned", checked)
                        }
                      />
                      <Label htmlFor="hasResigned">Has Resigned</Label>
                    </div>
                    <CardFooter className="flex justify-end pt-4">
                      <Button type="submit">Update Teacher Information</Button>
                    </CardFooter>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* HOD Information Tab */}
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
