"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  School,
  Users,
  Book,
  DollarSign,
  Building,
  Wallet,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SideBarLayout from "@/components/sidebar/layout";
import { Separator } from "@/components/ui/separator";
import CollegeDashboardSkeleton from "./skeleton";

interface College {
  id: string;
  name: string;
  address: string;
  establishedOn: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  IFSCCode?: string;
  AccountNo?: string;
  AccountHolderName?: string;
  UPIID?: string;
  departments: { id: string; name: string }[];
  students: { id: string }[];
  financeManagers: { id: string }[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
}

interface FormFieldProps {
  label: string;
  id: string;
  name: keyof College;
  value?: string;
  icon: LucideIcon;
}

interface SessionUser {
  role: string;
  collegeId?: string;
}

interface SessionData {
  user?: SessionUser;
}

export default function CollegeDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [college, setCollege] = useState<College | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<College>>({});
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "financial">(
    "general"
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      status === "authenticated" &&
      (session?.user as SessionUser)?.role === "COLLEGE_SUPER_ADMIN" &&
      (session?.user as SessionUser)?.collegeId
    ) {
      fetchCollegeDetails();
    } else if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      status === "authenticated" &&
      !(session?.user as SessionUser)?.collegeId
    ) {
      setError("College ID is missing from the session");
    }
    setIsLoading(false);
  }, [status, session, router]);

  const fetchCollegeDetails = async () => {
    try {
      const collegeId = (session?.user as SessionUser)?.collegeId;
      if (!collegeId) {
        throw new Error("College ID is undefined");
      }
      const response = await fetch(`/api/college-csa/college/${collegeId}`);
      if (!response.ok) throw new Error("Failed to fetch college details");
      const data: College = await response.json();
      setCollege(data);
      setEditForm(data);
      setError(null);
    } catch (err) {
      setError("Error fetching college details");
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      if (!college?.id) {
        throw new Error("College ID is undefined");
      }
      const response = await fetch(`/api/college-csa/college/${college.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) throw new Error("Failed to update college details");
      const updatedCollege: College = await response.json();
      setCollege(updatedCollege);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Error updating college details");
      console.error(err);
    }
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon }) => (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-xl md:text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  const FormField: React.FC<FormFieldProps> = ({
    label,
    id,
    name,
    value,
    icon: Icon,
  }) => (
    <div className="grid gap-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        value={
          isEditing ? (editForm[name] as string) || "" : (value as string) || ""
        }
        onChange={handleInputChange}
        disabled={!isEditing}
        className="w-full"
      />
    </div>
  );

  if (isLoading) {
    return <CollegeDashboardSkeleton />;
  }

  if (!college) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No College Data Available</h2>
          <p className="text-gray-600">
            Please check your permissions or try again later.
          </p>
        </div> */}
      </div>
    );
  }

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">College Dashboard</h1>
          <div className="flex flex-wrap gap-2 md:gap-4">
            {isEditing ? (
              <>
                <Button
                  onClick={handleUpdate}
                  className="gap-2 text-sm md:text-base"
                >
                  <DollarSign className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="gap-2 text-sm md:text-base"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="gap-2 text-sm md:text-base"
              >
                <Building className="h-4 w-4" />
                Edit Details
              </Button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Departments"
            value={college?.departments?.length || 0}
            icon={Book}
          />
          <StatCard
            title="Total Students"
            value={college.students?.length || 0}
            icon={Users}
          />
          <StatCard
            title="Finance Managers"
            value={college.financeManagers?.length || 0}
            icon={DollarSign}
          />
          <StatCard
            title="Established"
            value={new Date(college.establishedOn).getFullYear()}
            icon={School}
          />
        </div>

        <div className="flex flex-wrap gap-2 md:space-x-4">
          <Button
            variant={activeTab === "general" ? "default" : "outline"}
            onClick={() => setActiveTab("general")}
            className="gap-2 text-sm md:text-base w-full sm:w-auto"
          >
            <Building className="h-4 w-4" />
            General Information
          </Button>
          <Button
            variant={activeTab === "financial" ? "default" : "outline"}
            onClick={() => setActiveTab("financial")}
            className="gap-2 text-sm md:text-base w-full sm:w-auto"
          >
            <Wallet className="h-4 w-4" />
            Financial Information
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              {activeTab === "general"
                ? "College Details"
                : "Financial Details"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {activeTab === "general" ? (
                <>
                  <FormField
                    label="College Name"
                    id="name"
                    name="name"
                    value={college.name}
                    icon={Building}
                  />
                  <FormField
                    label="Address"
                    id="address"
                    name="address"
                    value={college.address}
                    icon={Building}
                  />
                  <FormField
                    label="Website"
                    id="websiteUrl"
                    name="websiteUrl"
                    value={college.websiteUrl}
                    icon={Globe}
                  />
                  <FormField
                    label="Contact Email"
                    id="contactEmail"
                    name="contactEmail"
                    value={college.contactEmail}
                    icon={Mail}
                  />
                  <FormField
                    label="Contact Phone"
                    id="contactPhone"
                    name="contactPhone"
                    value={college.contactPhone}
                    icon={Phone}
                  />
                </>
              ) : (
                <>
                  <FormField
                    label="Account Holder Name"
                    id="AccountHolderName"
                    name="AccountHolderName"
                    value={college.AccountHolderName}
                    icon={Users}
                  />
                  <FormField
                    label="Account Number"
                    id="AccountNo"
                    name="AccountNo"
                    value={college.AccountNo}
                    icon={DollarSign}
                  />
                  <FormField
                    label="IFSC Code"
                    id="IFSCCode"
                    name="IFSCCode"
                    value={college.IFSCCode}
                    icon={Building}
                  />
                  <FormField
                    label="UPI ID"
                    id="UPIID"
                    name="UPIID"
                    value={college.UPIID}
                    icon={Wallet}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {activeTab === "general" && (
          <Card className="w-full overflow-x-auto">
            <CardHeader>
              <CardTitle>Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {college.departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>{dept.name}</TableCell>
                      <TableCell>{dept.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </SideBarLayout>
  );
}
