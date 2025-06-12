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
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

interface ValidationError {
  validation: string;
  code: string;
  message: string;
  path: string[];
}

interface ApiError {
  message: string;
  errors?: ValidationError[];
}

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

// Password validation rules
const passwordRules = [
  {
    test: (password: string) => password.length >= 8,
    message: "At least 8 characters long",
    key: "length",
  },
  {
    test: (password: string) => /[A-Z]/.test(password),
    message: "At least one uppercase letter",
    key: "uppercase",
  },
  {
    test: (password: string) => /[a-z]/.test(password),
    message: "At least one lowercase letter",
    key: "lowercase",
  },
  {
    test: (password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    message: "At least one special character",
    key: "special",
  },
  {
    test: (password: string) => /[0-9]/.test(password),
    message: "At least one number",
    key: "number",
  },
];

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
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [designations, setDesignations] = useState<TeacherDesignation[]>([]);
  const [categories, setCategories] = useState<EmployeeCategory[]>([]);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);

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
          setMessageType("error");
        }
      }
    };

    fetchProfileAndOptions();
  }, [session]);

  const clearMessages = () => {
    setMessage("");
    setValidationErrors([]);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));

    // Clear messages when user starts typing
    if (message || validationErrors.length > 0) {
      clearMessages();
    }
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
    clearMessages();
  };

  const handleTeacherSelectChange = (name: string, value: string) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      teacher: {
        ...prevProfile.teacher,
        [name]: value,
      },
    }));
    clearMessages();
  };

  const handleTeacherCheckboxChange = (name: string, checked: boolean) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      teacher: {
        ...prevProfile.teacher,
        [name]: checked,
      },
    }));
    clearMessages();
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
    clearMessages();
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
    clearMessages();
  };

  const validatePasswords = () => {
    const errors: string[] = [];

    if (
      profile.newPassword &&
      profile.confirmPassword &&
      profile.newPassword !== profile.confirmPassword
    ) {
      errors.push("New password and confirmation password do not match");
    }

    return errors;
  };

  const getPasswordStrength = (password: string) => {
    const passedRules = passwordRules.filter((rule) => rule.test(password));
    return {
      score: passedRules.length,
      total: passwordRules.length,
      percentage: (passedRules.length / passwordRules.length) * 100,
    };
  };

  const getFieldError = (fieldPath: string) => {
    return validationErrors.find((error) => error.path.join(".") === fieldPath);
  };

  const getFieldErrors = (fieldPath: string) => {
    return validationErrors.filter(
      (error) => error.path.join(".") === fieldPath
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();

    // Client-side validation
    const clientErrors = validatePasswords();
    if (clientErrors.length > 0) {
      setMessage(clientErrors[0]);
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data: ApiError = await response.json();

      if (response.ok) {
        setMessage("Profile updated successfully!");
        setMessageType("success");
        setProfile((prevProfile) => ({
          ...prevProfile,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        // Handle validation errors
        if (data.errors && data.errors.length > 0) {
          setValidationErrors(data.errors);
          setMessage("Please fix the validation errors below");
          setMessageType("error");
        } else {
          setMessage(
            data.message || "An error occurred while updating the profile."
          );
          setMessageType("error");
        }
      }
    } catch (error) {
      setMessage("An error occurred while updating the profile.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const passwordStrength = getPasswordStrength(profile.newPassword);
  const newPasswordErrors = getFieldErrors("newPassword");

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
                      className={
                        getFieldError("username") ? "border-red-500" : ""
                      }
                    />
                    {getFieldError("username") && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        {getFieldError("username")?.message}
                      </p>
                    )}
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
                      className={getFieldError("email") ? "border-red-500" : ""}
                    />
                    {getFieldError("email") && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        {getFieldError("email")?.message}
                      </p>
                    )}
                  </div>

                  <Separator />
                  <h3 className="text-lg font-medium">Change Password</h3>

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword.current ? "text" : "password"}
                        value={profile.currentPassword}
                        onChange={handleChange}
                        placeholder="Enter your current password"
                        className={
                          getFieldError("currentPassword")
                            ? "border-red-500 pr-10"
                            : "pr-10"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {getFieldError("currentPassword") && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        {getFieldError("currentPassword")?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword.new ? "text" : "password"}
                        value={profile.newPassword}
                        onChange={handleChange}
                        placeholder="Enter your new password"
                        className={
                          newPasswordErrors.length > 0
                            ? "border-red-500 pr-10"
                            : "pr-10"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Password strength indicator */}
                    {profile.newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                passwordStrength.percentage < 40
                                  ? "bg-red-500"
                                  : passwordStrength.percentage < 70
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${passwordStrength.percentage}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {passwordStrength.score}/{passwordStrength.total}
                          </span>
                        </div>

                        {/* Password requirements */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                          {passwordRules.map((rule) => {
                            const isValid = rule.test(profile.newPassword);
                            return (
                              <div
                                key={rule.key}
                                className={`flex items-center gap-1 ${
                                  isValid ? "text-green-600" : "text-gray-500"
                                }`}
                              >
                                {isValid ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                {rule.message}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Server validation errors for new password */}
                    {newPasswordErrors.map((error, index) => (
                      <p
                        key={index}
                        className="text-sm text-red-600 flex items-center gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        {error.message}
                      </p>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword.confirm ? "text" : "password"}
                        value={profile.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your new password"
                        className={`pr-10 ${
                          profile.newPassword &&
                          profile.confirmPassword &&
                          profile.newPassword !== profile.confirmPassword
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Password match indicator */}
                    {profile.newPassword && profile.confirmPassword && (
                      <div
                        className={`text-sm flex items-center gap-1 ${
                          profile.newPassword === profile.confirmPassword
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {profile.newPassword === profile.confirmPassword ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {profile.newPassword === profile.confirmPassword
                          ? "Passwords match"
                          : "Passwords do not match"}
                      </div>
                    )}
                  </div>

                  <CardFooter className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Account"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rest of the tabs remain the same */}
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
                      <Button type="submit" disabled={isLoading}>
                        {isLoading
                          ? "Updating..."
                          : "Update Alumni Information"}
                      </Button>
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
                      <Button type="submit" disabled={isLoading}>
                        {isLoading
                          ? "Updating..."
                          : "Update Teacher Information"}
                      </Button>
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
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update HOD Information"}
                      </Button>
                    </CardFooter>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Enhanced Message Display */}
        {(message || validationErrors.length > 0) && (
          <Alert
            className={`mt-4 ${
              messageType === "success"
                ? "border-green-500 bg-green-50"
                : messageType === "error"
                ? "border-red-500 bg-red-50"
                : "border-blue-500 bg-blue-50"
            }`}
          >
            <div className="flex items-start gap-2">
              {messageType === "success" && (
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              )}
              {messageType === "error" && (
                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
              )}
              {messageType === "info" && (
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              )}
              <div className="flex-1">
                {message && (
                  <AlertDescription
                    className={`${
                      messageType === "success"
                        ? "text-green-800"
                        : messageType === "error"
                        ? "text-red-800"
                        : "text-blue-800"
                    }`}
                  >
                    {message}
                  </AlertDescription>
                )}
                {validationErrors.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {validationErrors.map((error, index) => (
                      <div
                        key={index}
                        className="text-sm text-red-700 flex items-center gap-1"
                      >
                        <XCircle className="h-3 w-3" />
                        <span className="font-medium">
                          {error.path.join(".")}:
                        </span>
                        {error.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}
      </div>
    </SideBarLayout>
  );
}
