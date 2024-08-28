"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, School, Users, Book, DollarSign } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SideBarLayout from "@/components/sidebar/layout";

interface College {
  id: string;
  name: string;
  address: string;
  establishedOn: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  departments: { id: string; name: string }[];
  students: { id: string }[];
  financeManagers: { id: string }[];
}

export default function CollegeDashboard() {
  const { data: session, status } = useSession();
  console.log(session);
  const router = useRouter();
  const [college, setCollege] = useState<College | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<College>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.role === "COLLEGE_SUPER_ADMIN" &&
      session?.user?.collegeId
    ) {
      fetchCollegeDetails();
    } else if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && !session?.user?.collegeId) {
      setError("College ID is missing from the session");
    }
  }, [status, session, router]);

  const fetchCollegeDetails = async () => {
    try {
      if (!session?.user?.collegeId) {
        throw new Error("College ID is undefined");
      }
      const response = await fetch(
        `/api/college-csa/college/${session.user.collegeId}`
      );
      if (!response.ok) throw new Error("Failed to fetch college details");
      const data = await response.json();
      setCollege(data);
      setEditForm(data);
    } catch (err) {
      setError("Error fetching college details");
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      if (!college?.id) {
        throw new Error("College ID is undefined");
      }
      const response = await fetch("/api/college-csa/college/" + college.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) throw new Error("Failed to update college details");
      const updatedCollege = await response.json();
      setCollege(updatedCollege);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Error updating college details");
      console.error(err);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!college) {
    return <div>No college data available</div>;
  }

  return (
    <SideBarLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">College Dashboard</h1>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Departments
              </CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {college?.departments?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {college.students?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Finance Managers
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {college.financeManagers?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Established</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(college.establishedOn).getFullYear()}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>College Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">College Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={isEditing ? editForm.name : college.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={isEditing ? editForm.address : college.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="websiteUrl">Website</Label>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    value={
                      isEditing ? editForm.websiteUrl : college.websiteUrl || ""
                    }
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    value={
                      isEditing
                        ? editForm.contactEmail
                        : college.contactEmail || ""
                    }
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={
                      isEditing
                        ? editForm.contactPhone
                        : college.contactPhone || ""
                    }
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                {isEditing ? (
                  <>
                    <Button onClick={handleUpdate} className="mr-2">
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Details
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
}
