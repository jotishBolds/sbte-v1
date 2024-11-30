import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

// Type Definitions
interface Student {
  id: string;
  name: string;
}

interface CertificateType {
  id: string;
  name: string;
}

type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

interface SingleCertificateFormData {
  studentId: string;
  certificateTypeId: string;
  issueDate: Date | null;
  paymentStatus: PaymentStatus;
}

interface MultipleCertificateFormData {
  studentIds: string[];
  certificateTypeId: string;
}

interface CertificateFormProps {
  students: Student[];
  certificateTypes: CertificateType[];
  initialData?: SingleCertificateFormData;
  onSubmit: (
    data: SingleCertificateFormData | MultipleCertificateFormData,
    isMultiple: boolean
  ) => void;
}

// Zod Schemas
const singleStudentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  certificateTypeId: z.string().min(1, "Certificate type is required"),
  issueDate: z.date().nullable(),
  paymentStatus: z.enum(["PENDING", "COMPLETED", "FAILED"]),
});

const multipleStudentSchema = z.object({
  studentId: z.string().optional(),
  studentIds: z.array(z.string()).min(1, "At least one student is required"),
  certificateTypeId: z.string().min(1, "Certificate type is required"),
});

type SingleFormSchema = z.infer<typeof singleStudentSchema>;
type MultipleFormSchema = z.infer<typeof multipleStudentSchema>;

export const CertificateForm: React.FC<CertificateFormProps> = ({
  students,
  certificateTypes,
  initialData,
  onSubmit,
}) => {
  const [isMultipleMode, setIsMultipleMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

  const form = useForm<SingleFormSchema | MultipleFormSchema>({
    resolver: zodResolver(
      isMultipleMode ? multipleStudentSchema : singleStudentSchema
    ),
    defaultValues: initialData || {
      studentId: "",
      studentIds: [],
      certificateTypeId: "",
      issueDate: null,
      paymentStatus: "PENDING" as PaymentStatus,
    },
  });

  const handleSubmit = (data: SingleFormSchema | MultipleFormSchema) => {
    if (isMultipleMode) {
      const multipleData = {
        studentIds: selectedStudents.map((s) => s.id),
        certificateTypeId: data.certificateTypeId,
      };
      onSubmit(multipleData, true);
    } else {
      onSubmit(data as SingleCertificateFormData, false);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student && !selectedStudents.find((s) => s.id === studentId)) {
      setSelectedStudents([...selectedStudents, student]);
      // Update the form's studentIds field
      form.setValue("studentIds", [
        ...selectedStudents.map((s) => s.id),
        student.id,
      ]);
    }
    form.setValue("studentId", "");
  };

  const removeStudent = (studentId: string) => {
    setSelectedStudents(selectedStudents.filter((s) => s.id !== studentId));
    // Update the form's studentIds field
    form.setValue(
      "studentIds",
      selectedStudents.filter((s) => s.id !== studentId).map((s) => s.id)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormItem className="flex items-center justify-between">
          <FormLabel>Multiple Students Mode</FormLabel>
          <Switch
            checked={isMultipleMode}
            onCheckedChange={setIsMultipleMode}
            disabled={!!initialData}
          />
        </FormItem>

        {isMultipleMode ? (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Students</FormLabel>
                  <Select
                    onValueChange={handleStudentSelect}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select students" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students
                        .filter(
                          (s) =>
                            !selectedStudents.find(
                              (selected) => selected.id === s.id
                            )
                        )
                        .map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <Card>
              <CardContent className="pt-4">
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {selectedStudents.map((student) => (
                      <Badge
                        key={student.id}
                        variant="secondary"
                        className="flex items-center justify-between p-2 w-full"
                      >
                        {student.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStudent(student.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!!initialData}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="certificateTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certificate Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!!initialData}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a certificate type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {certificateTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isMultipleMode && (
          <>
            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Date</FormLabel>
                  <FormControl>
                    <input
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["PENDING", "COMPLETED", "FAILED"].map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" className="w-full">
          {initialData
            ? "Update Certificate"
            : isMultipleMode
            ? "Issue Certificates"
            : "Issue Certificate"}
        </Button>
      </form>
    </Form>
  );
};
