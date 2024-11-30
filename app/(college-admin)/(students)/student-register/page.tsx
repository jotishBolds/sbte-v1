"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import SideBarLayout from "@/components/sidebar/layout";
import StudentProfilePictureUpload from "@/components/student/StudentProfilePictureUpload";

// Types for reference data
interface ReferenceData {
  id: string;
  name: string;
  year?: string;
}

// Form schema matching the API's studentSchema
const studentFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  dob: z.string(),
  enrollmentNo: z.string().optional(),
  personalEmail: z.string().email("Invalid personal email"),
  phoneNo: z.string().min(10, "Phone number must be at least 10 digits"),
  studentAvatar: z.string().optional(),
  abcId: z.string().optional(),
  lastCollegeAttended: z.string().optional(),
  batchYearId: z.string().min(1, "Batch year is required"),
  admissionYearId: z.string().min(1, "Admission year is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  termId: z.string().min(1, "Term is required"),
  gender: z.string(),
  isLocalStudent: z.boolean().default(false),
  isDifferentlyAbled: z.boolean().default(false),
  motherName: z.string().min(1, "Mother's name is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  bloodGroup: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().optional(),
  caste: z.string().optional(),
  admissionCategory: z.string().optional(),
  resident: z.string().optional(),
  admissionDate: z.string(),
  graduateDate: z.string().optional(),
  permanentAddress: z.string().min(1, "Permanent address is required"),
  permanentCountry: z.string().min(1, "Country is required"),
  permanentState: z.string().min(1, "State is required"),
  permanentCity: z.string().min(1, "City is required"),
  permanentPincode: z.string().min(6, "Pincode must be at least 6 digits"),
  guardianName: z.string().optional(),
  guardianGender: z.string().optional(),
  guardianEmail: z.string().email().optional(),
  guardianMobileNo: z.string().optional(),
  guardianRelation: z.string().optional(),
  programId: z.string().min(1, "Program ID is required"),
  departmentId: z.string().min(1, "Department ID is required"),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

export default function StudentForm() {
  // State for reference data
  const [batchYears, setBatchYears] = useState<ReferenceData[]>([]);
  const [admissionYears, setAdmissionYears] = useState<ReferenceData[]>([]);
  const [academicYears, setAcademicYears] = useState<ReferenceData[]>([]);
  const [terms, setTerms] = useState<ReferenceData[]>([]);
  const [programs, setPrograms] = useState<ReferenceData[]>([]);
  const [departments, setDepartments] = useState<ReferenceData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      isLocalStudent: false,
      isDifferentlyAbled: false,
    },
  });

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [
          batchYearsRes,
          admissionYearsRes,
          academicYearsRes,
          termsRes,
          programsRes,
          departmentsRes,
        ] = await Promise.all([
          fetch("/api/batchYear"),
          fetch("/api/admissionYear"),
          fetch("/api/academicYear"),
          fetch("/api/semesters"),
          fetch("/api/programs"),
          fetch("/api/departments"),
        ]);

        const batchYears = await batchYearsRes.json();
        const admissionYears = await admissionYearsRes.json();
        const academicYears = await academicYearsRes.json();
        const terms = await termsRes.json();
        const programs = await programsRes.json();
        const departments = await departmentsRes.json();

        setBatchYears(batchYears);
        setAdmissionYears(admissionYears);
        setAcademicYears(academicYears);
        setTerms(terms);
        setPrograms(programs);
        setDepartments(departments);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load reference data",
          variant: "destructive",
        });
      }
    };

    fetchReferenceData();
  }, []);

  const onSubmit = async (data: StudentFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create student");
      }

      toast({
        title: "Success",
        description: "Student created successfully",
      });

      form.reset({
        username: "",
        email: "",
        password: "",
        name: "",
        dob: "",
        enrollmentNo: "",
        personalEmail: "",
        phoneNo: "",
        studentAvatar: "",
        abcId: "",
        lastCollegeAttended: "",
        batchYearId: "",
        admissionYearId: "",
        academicYearId: "",
        termId: "",
        gender: "",
        isLocalStudent: false,
        isDifferentlyAbled: false,
        motherName: "",
        fatherName: "",
        bloodGroup: "",
        religion: "",
        nationality: "",
        caste: "",
        admissionCategory: "",
        resident: "",
        admissionDate: "",
        graduateDate: "",
        permanentAddress: "",
        permanentCountry: "",
        permanentState: "",
        permanentCity: "",
        permanentPincode: "",
        guardianName: "",
        guardianGender: "",
        guardianEmail: "",
        guardianMobileNo: "",
        guardianRelation: "",
        programId: "",
        departmentId: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create student",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SideBarLayout>
      <ScrollArea className="h-[calc(100vh-4rem)] px-4">
        <Card className="max-w-7xl mx-auto my-8">
          <CardHeader>
            <CardTitle>Student Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full h-full grid-cols-2 lg:grid-cols-4 mb-8">
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="academic">Academic Info</TabsTrigger>
                    <TabsTrigger value="address">Address</TabsTrigger>
                    <TabsTrigger value="guardian">Guardian Info</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 flex justify-center">
                        <FormField
                          control={form.control}
                          name="studentAvatar"
                          render={({ field }) => (
                            <FormItem className="">
                              <FormLabel className="text-center block">
                                Profile Picture
                              </FormLabel>
                              <FormControl>
                                <StudentProfilePictureUpload
                                  studentId={null}
                                  currentProfilePic={field.value}
                                  onUploadSuccess={(profilePic) => {
                                    form.setValue("studentAvatar", profilePic);
                                  }}
                                  isSubmitting={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input type="email" {...field} />
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
                              <Input type="password" {...field} />
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
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="FEMALE">Female</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="personalEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Personal Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
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
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="abcId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ABC ID</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="enrollmentNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Entrollment No</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isDifferentlyAbled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Differently Abled
                              </FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isLocalStudent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Local Student
                              </FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastCollegeAttended"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last College Attended</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="motherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother&apos;s Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fatherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father&apos;s Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bloodGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blood Group</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Additional personal fields... */}
                    </div>
                  </TabsContent>

                  <TabsContent value="academic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="departmentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select program" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {programs.map((program) => (
                                  <SelectItem
                                    key={program.id}
                                    value={program.id}
                                  >
                                    {program.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select batch year">
                                    {
                                      batchYears.find(
                                        (year) => year.id === field.value
                                      )?.name
                                    }
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {batchYears.map((year) => (
                                  <SelectItem key={year.id} value={year.id}>
                                    {year.year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select admission year" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {admissionYears.map((year) => (
                                  <SelectItem key={year.id} value={year.id}>
                                    {year.year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="academicYearId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Academic Year</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select academic year" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {academicYears.map((year) => (
                                  <SelectItem key={year.id} value={year.id}>
                                    {year.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="termId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Term</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select term" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {terms.map((term) => (
                                  <SelectItem key={term.id} value={term.id}>
                                    {term.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="religion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Religion</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationality</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="caste"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Caste</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="admissionCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admission Category</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="resident"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resident</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="admissionDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admission Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="graduateDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Graduate Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="address" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="permanentAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Permanent Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="permanentCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="permanentState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="permanentCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="permanentPincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="guardian" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="guardianName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guardian Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guardianGender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guardian Gender</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="FEMALE">Female</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guardianEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guardian Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guardianMobileNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guardian Mobile Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="guardianRelation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guardian Relation</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                  >
                    Reset
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </ScrollArea>
    </SideBarLayout>
  );
}
