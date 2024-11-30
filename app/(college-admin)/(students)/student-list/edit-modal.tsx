import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import StudentProfilePictureUpload from "@/components/student/StudentProfilePictureUpload";

const formSchema = z.object({
  // User Details
  username: z.string().min(1, "Username is required").optional(),
  email: z.string().email("Invalid email").optional(),
  password: z.string().optional(),

  // Personal Details
  name: z.string().min(1, "Name is required"),
  dob: z.string(),
  enrollmentNo: z.string().optional(),
  personalEmail: z.string().email("Invalid personal email"),
  phoneNo: z.string().min(10, "Phone number must be at least 10 digits"),
  studentAvatar: z.string().optional(),
  gender: z.string(),
  isLocalStudent: z.boolean(),
  isDifferentlyAbled: z.boolean(),

  // Academic Details
  programId: z.string(),
  departmentId: z.string(),
  batchYearId: z.string(),
  admissionYearId: z.string(),
  academicYearId: z.string(),
  termId: z.string(),
  abcId: z.string().optional(),
  lastCollegeAttended: z.string().optional(),
  admissionDate: z.string(),
  graduateDate: z.string().optional(),
  admissionCategory: z.string().optional(),

  // Family Details
  motherName: z.string(),
  fatherName: z.string(),
  guardianName: z.string().optional(),
  guardianGender: z.string().optional(),
  guardianEmail: z.string().email().optional(),
  guardianMobileNo: z.string().optional(),
  guardianRelation: z.string().optional(),

  // Additional Details
  bloodGroup: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().optional(),
  caste: z.string().optional(),
  resident: z.string().optional(),

  // Address
  permanentAddress: z.string(),
  permanentCountry: z.string(),
  permanentState: z.string(),
  permanentCity: z.string(),
  permanentPincode: z.string().min(6, "Pincode must be at least 6 digits"),
});

interface User {
  id: string;
  username: string;
  email: string;
}

interface Program {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface StudentDetails {
  id: string;
  userId: string;
  username?: string;
  email?: string;
  name: string;
  dob: string;
  enrollmentNo?: string;
  personalEmail?: string;
  phoneNo?: string;
  studentAvatar?: string;
  program: Program;
  department: Department;
  user?: User;

  // Academic Details
  batchYearId: string;
  admissionYearId: string;
  academicYearId: string;
  termId: string;
  abcId?: string;
  lastCollegeAttended?: string;
  admissionDate: string;
  graduateDate?: string;
  admissionCategory?: string;

  // Personal Details
  gender: string;
  isLocalStudent: boolean;
  isDifferentlyAbled: boolean;
  motherName: string;
  fatherName: string;
  bloodGroup?: string;
  religion?: string;
  nationality?: string;
  caste?: string;
  resident?: string;

  // Guardian Details
  guardianName?: string;
  guardianGender?: string;
  guardianEmail?: string;
  guardianMobileNo?: string;
  guardianRelation?: string;

  // Address Details
  permanentAddress: string;
  permanentCountry: string;
  permanentState: string;
  permanentCity: string;
  permanentPincode: string;
}

interface EditStudentModalProps {
  student: StudentDetails;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}
type StudentFormValues = z.infer<typeof formSchema>;
export function EditStudentModal({
  student,
  isOpen,
  onClose,
  onUpdate,
}: EditStudentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [batchYears, setBatchYears] = useState<any[]>([]);
  const [admissionYears, setAdmissionYears] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: student.user?.username || "",
      email: student.user?.email || "",
      password: "",
      name: student.name,
      dob: student.dob ? new Date(student.dob).toISOString().split("T")[0] : "",
      enrollmentNo: student.enrollmentNo || "",
      personalEmail: student.personalEmail || "",
      phoneNo: student.phoneNo || "",
      studentAvatar: student.studentAvatar || "",
      gender: student.gender ? student.gender.toUpperCase() : "",
      isLocalStudent: student.isLocalStudent,
      isDifferentlyAbled: student.isDifferentlyAbled,
      programId: student.program.id,
      departmentId: student.department.id,
      batchYearId: student.batchYearId,

      admissionYearId: student.admissionYearId,
      academicYearId: student.academicYearId,
      termId: student.termId,
      abcId: student.abcId || "",
      lastCollegeAttended: student.lastCollegeAttended || "",
      admissionDate: student.admissionDate
        ? new Date(student.admissionDate).toISOString().split("T")[0]
        : "",
      graduateDate: student.graduateDate
        ? new Date(student.graduateDate).toISOString().split("T")[0]
        : "",
      admissionCategory: student.admissionCategory || "",
      motherName: student.motherName,
      fatherName: student.fatherName,
      guardianName: student.guardianName || "",
      guardianGender: student.guardianGender
        ? student.guardianGender.toUpperCase()
        : "",
      guardianEmail: student.guardianEmail || "",
      guardianMobileNo: student.guardianMobileNo || "",
      guardianRelation: student.guardianRelation || "",
      bloodGroup: student.bloodGroup || "",
      religion: student.religion || "",
      nationality: student.nationality || "",
      caste: student.caste || "",
      resident: student.resident || "",
      permanentAddress: student.permanentAddress,
      permanentCountry: student.permanentCountry,
      permanentState: student.permanentState,
      permanentCity: student.permanentCity,
      permanentPincode: student.permanentPincode,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          departmentsRes,
          programsRes,
          batchYearsRes,
          admissionYearsRes,
          academicYearsRes,
          termsRes,
        ] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/programs"),
          fetch("/api/batchYear"),
          fetch("/api/admissionYear"),
          fetch("/api/academicYear"),
          fetch("/api/semesters"),
        ]);

        const departments = await departmentsRes.json();
        const programs = await programsRes.json();
        const batchYears = await batchYearsRes.json();
        const admissionYears = await admissionYearsRes.json();
        const academicYears = await academicYearsRes.json();
        const terms = await termsRes.json();

        setDepartments(departments);
        setPrograms(programs);
        setBatchYears(batchYears);
        setAdmissionYears(admissionYears);
        setAcademicYears(academicYears);
        setTerms(terms);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/student/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          studentAvatar: values.studentAvatar || student.studentAvatar,
        }),
      });

      if (!response.ok) throw new Error("Failed to update student");

      toast({
        title: "Success",
        description: "Student information updated successfully",
      });
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Student Information</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-4"
            >
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="family">Family</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-4 ">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={true}
                              value={student.user?.username || ""}
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
                              {...field}
                              type="email"
                              disabled={true}
                              value={student.user?.email || ""}
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
                              {...field}
                              type="password"
                              placeholder="Leave blank to keep current password"
                            />
                          </FormControl>
                          <FormDescription>
                            Only fill this if you want to change the password
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 flex justify-center">
                      <StudentProfilePictureUpload
                        studentId={student.id}
                        currentProfilePic={student.studentAvatar}
                        onUploadSuccess={(profilePic) => {
                          form.setValue("studentAvatar", profilePic);
                        }}
                        isSubmitting={isSubmitting}
                      />
                    </div>
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
                      name="personalEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Personal Email</FormLabel>
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
                              {[
                                "A+",
                                "A-",
                                "B+",
                                "B-",
                                "AB+",
                                "AB-",
                                "O+",
                                "O-",
                              ].map((group) => (
                                <SelectItem key={group} value={group}>
                                  {group}
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
                      name="resident"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resident Type</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="isLocalStudent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Local Student</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isDifferentlyAbled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Differently Abled</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="family" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      name="guardianName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guardian&apos;s Name</FormLabel>
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
                          <FormLabel>Guardian&apos;s Gender</FormLabel>
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
                          <FormLabel>Guardian&apos;s Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Guardian&apos;s Mobile Number</FormLabel>
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
                          <FormLabel>Relation with Guardian</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <SelectItem key={program.id} value={program.id}>
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
                                <SelectValue placeholder="Select batch year" />
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
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((department) => (
                                <SelectItem
                                  key={department.id}
                                  value={department.id}
                                >
                                  {department.name}
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
                      name="enrollmentNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enrollment Number</FormLabel>
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

                    {/* Academic Year, Batch Year, Term, etc. */}
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
                  </div>
                </TabsContent>

                <TabsContent value="address" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="permanentAddress"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
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
              </Tabs>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
