"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ArrowLeft,
  Trash2,
  Pencil,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import SideBarLayout from "@/components/sidebar/layout";

import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

interface SubjectGrade {
  id: string;
  batchSubject: {
    subject: {
      name: string;
    };
  };
  credit: number;
  grade: string | null;
  gradePoint: number | null;
  qualityPoint: number | null;
  internalMarks: number | null;
  externalMarks: number | null;
}

interface GradeCard {
  id: string;
  cardNo: string;
  student: {
    name: string;
    enrollmentNo: string;
  };
  semester: {
    name: string;
    numerical: number;
  };
  batch: {
    name: string;
  };
  totalQualityPoint: number | null;
  totalGradedCredit: number | null;
  gpa: number | null;
  cgpa: number | null;
  subjectGrades: SubjectGrade[];
}

interface EditableSubject {
  id: string;
  internalMarks: number | null;
  externalMarks: number | null;
}

interface ValidationErrors {
  internalMarks?: string[];
  externalMarks?: string[];
  _errors?: string[];
}

export default function GradeCardViewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [gradeCard, setGradeCard] = useState<GradeCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditableSubject | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [validationErrors, setValidationErrors] =
    useState<ValidationErrors | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [isDeletingSubject, setIsDeletingSubject] = useState(false);
  const [showExternalUpdateGuide, setShowExternalUpdateGuide] = useState(false);
  const [showGradeUpdateGuide, setShowGradeUpdateGuide] = useState(false);
  const [isLastSubject, setIsLastSubject] = useState(false);
  useEffect(() => {
    const fetchGradeCard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/gradeCard/${params.id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch grade card");
        }

        const data = await response.json();
        setGradeCard(data);
      } catch (error) {
        toast({
          title: "Error fetching grade card",
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchGradeCard();
    }
  }, [params.id, toast]);

  const downloadPDF = async () => {
    try {
      setIsPdfGenerating(true);
      toast({
        title: "Generating PDF",
        description: "Please wait while we prepare your download...",
      });

      const response = await fetch(`/api/gradeCard/${params.id}/pdf`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `GradeCard_${gradeCard?.student.enrollmentNo}_Sem${gradeCard?.semester.numerical}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Grade card PDF has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "PDF Generation Failed",
        description:
          error instanceof Error ? error.message : "Failed to download PDF",
        variant: "destructive",
      });
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const calculateTotalCredits = () => {
    return (
      gradeCard?.subjectGrades.reduce(
        (sum, subject) => sum + subject.credit,
        0
      ) || 0
    );
  };

  const handleDeleteGradeCard = async () => {
    try {
      const response = await fetch(`/api/gradeCard/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete grade card");
      }

      toast({
        title: "Success",
        description: "Grade card has been deleted successfully",
      });

      router.push("/gradecard-view");
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete grade card",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const startEditing = (subject: SubjectGrade) => {
    setEditingSubject(subject.id);
    setEditValues({
      id: subject.id,
      internalMarks: subject.internalMarks,
      externalMarks: subject.externalMarks,
    });
    setValidationErrors(null);
  };

  const cancelEditing = () => {
    setEditingSubject(null);
    setEditValues(null);
    setValidationErrors(null);
  };

  const handleInputChange = (field: keyof EditableSubject, value: string) => {
    if (!editValues) return;

    const numberValue = value === "" ? null : Number(value);
    setEditValues({
      ...editValues,
      [field]: numberValue,
    });

    // Clear validation errors when the user is typing
    if (
      validationErrors &&
      field in validationErrors &&
      validationErrors[field as keyof ValidationErrors]
    ) {
      setValidationErrors({
        ...validationErrors,
        [field]: undefined,
      });
    }
  };
  const confirmDeleteSubject = (subjectId: string) => {
    const isLastSubject = gradeCard?.subjectGrades.length === 1;
    setSubjectToDelete(subjectId);
    setIsLastSubject(isLastSubject);
  };

  const deleteSubjectGrade = async () => {
    if (!subjectToDelete) return;

    try {
      setIsDeletingSubject(true);
      const response = await fetch(
        `/api/subjectGradeDetail/${subjectToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete subject grade");
      }

      toast({
        title: "Success",
        description: "Subject grade deleted successfully",
      });

      // If this was the last subject, redirect to the grade cards list
      if (isLastSubject) {
        router.push("/gradecard-view");
        return;
      }

      // Update local state by removing the deleted subject
      if (gradeCard) {
        const updatedSubjectGrades = gradeCard.subjectGrades.filter(
          (subject) => subject.id !== subjectToDelete
        );

        setGradeCard({
          ...gradeCard,
          subjectGrades: updatedSubjectGrades,
        });
      }

      // Refresh the grade card to get updated GPA/CGPA
      const refreshResponse = await fetch(`/api/gradeCard/${params.id}`);
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setGradeCard(refreshedData);
      }
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete subject grade",
        variant: "destructive",
      });
    } finally {
      setIsDeletingSubject(false);
      setSubjectToDelete(null);
    }
  };
  // Extract error messages from validation error response
  const extractErrorMessage = (details: any): string => {
    if (!details) return "Validation failed";

    // Check for field-specific errors
    const fieldErrors = Object.entries(details)
      .filter(
        ([key, value]) =>
          key !== "_errors" &&
          Array.isArray((value as any)._errors) &&
          (value as any)._errors.length > 0
      )
      .map(([key, value]) => `${key}: ${(value as any)._errors.join(", ")}`);

    // Check for top-level errors
    const topErrors =
      details._errors && details._errors.length > 0 ? details._errors : [];

    const allErrors = [...fieldErrors, ...topErrors];
    return allErrors.length > 0 ? allErrors.join("; ") : "Validation failed";
  };

  const saveSubjectMarks = async () => {
    if (!editValues || !editingSubject) return;

    setIsUpdating(true);
    setValidationErrors(null);

    try {
      const response = await fetch(
        `/api/subjectGradeDetail/${editingSubject}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            internalMarks: editValues.internalMarks,
            externalMarks: editValues.externalMarks,
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          responseData.error === "Validation failed" &&
          responseData.details
        ) {
          // Handle validation errors
          setValidationErrors(responseData.details);
          throw new Error(extractErrorMessage(responseData.details));
        } else {
          throw new Error(responseData.error || "Failed to update marks");
        }
      }
      setShowExternalUpdateGuide(true);
      setShowGradeUpdateGuide(true);
      // Update the local state with the new values
      if (gradeCard) {
        const updatedSubjectGrades = gradeCard.subjectGrades.map((subject) =>
          subject.id === editingSubject
            ? {
                ...subject,
                internalMarks: editValues.internalMarks,
                externalMarks: editValues.externalMarks,
                // We don't update grade, gradePoint, and qualityPoint here as they're calculated server-side
              }
            : subject
        );

        setGradeCard({
          ...gradeCard,
          subjectGrades: updatedSubjectGrades,
        });
      }

      toast({
        title: "Success",
        description: "Subject marks updated successfully",
      });

      setEditingSubject(null);
      setEditValues(null);
      setValidationErrors(null);

      // Refresh the grade card to get the updated grades
      const refreshResponse = await fetch(`/api/gradeCard/${params.id}`);
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setGradeCard(refreshedData);
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "Failed to update marks",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <SideBarLayout>
        <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading grade card data...</p>
          </div>
        </div>
      </SideBarLayout>
    );
  }

  if (!gradeCard) {
    return (
      <SideBarLayout>
        <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold">Grade Card Not Found</h2>
            <p className="text-muted-foreground">
              The requested grade card could not be found.
            </p>
            <Link href="/gradecard-view">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Grade Cards
              </Button>
            </Link>
          </div>
        </div>
      </SideBarLayout>
    );
  }

  const getFieldError = (field: keyof ValidationErrors): string | null => {
    if (!validationErrors || !validationErrors[field]) return null;

    const errors = validationErrors[field];
    if (Array.isArray(errors) && errors.length > 0) {
      return errors[0];
    }

    return null;
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link href="/gradecard-view">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Grade Cards
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={downloadPDF}
              disabled={isPdfGenerating}
              className="w-full sm:w-auto"
            >
              {isPdfGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span>Grade Card Details</span>
              <Badge variant="secondary" className="text-xs">
                Card No: {gradeCard.cardNo}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Student
                </h3>
                <p className="text-base font-semibold">
                  {gradeCard.student.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Enrollment: {gradeCard.student.enrollmentNo}
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Batch
                </h3>
                <p className="text-base font-semibold">
                  {gradeCard.batch.name}
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Semester
                </h3>
                <p className="text-base font-semibold">
                  {gradeCard.semester.name} (Semester{" "}
                  {gradeCard.semester.numerical})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Total Credits
                </h3>
                <p className="text-base font-semibold">
                  {calculateTotalCredits()}
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-muted-foreground">
                  GPA
                </h3>
                <p className="text-base font-semibold">
                  {gradeCard.gpa ? gradeCard.gpa.toFixed(2) : "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-medium text-muted-foreground">
                  CGPA
                </h3>
                <p className="text-base font-semibold">
                  {gradeCard.cgpa ? gradeCard.cgpa.toFixed(2) : "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-base font-semibold mb-4">Subject Grades</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-center">Credit</TableHead>
                      <TableHead className="text-center">Internal</TableHead>
                      <TableHead className="text-center">External</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Grade Point</TableHead>
                      <TableHead className="text-center">
                        Quality Point
                      </TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradeCard.subjectGrades.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">
                                  {subject.batchSubject.subject.name}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{subject.batchSubject.subject.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-center">
                          {subject.credit}
                        </TableCell>

                        <TableCell className="text-center">
                          {editingSubject === subject.id ? (
                            <div className="space-y-1">
                              <Input
                                type="number"
                                min="0"
                                max="30"
                                value={
                                  editValues?.internalMarks === null
                                    ? ""
                                    : editValues?.internalMarks
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "internalMarks",
                                    e.target.value
                                  )
                                }
                                className={`w-20 mx-auto ${
                                  getFieldError("internalMarks")
                                    ? "border-red-500"
                                    : ""
                                }`}
                              />
                              {getFieldError("internalMarks") && (
                                <p className="text-xs text-red-500">
                                  {getFieldError("internalMarks")}
                                </p>
                              )}
                            </div>
                          ) : (
                            subject.internalMarks ?? "—"
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          {editingSubject === subject.id ? (
                            <div className="space-y-1">
                              <Input
                                type="number"
                                min="0"
                                max="70"
                                value={
                                  editValues?.externalMarks === null
                                    ? ""
                                    : editValues?.externalMarks
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "externalMarks",
                                    e.target.value
                                  )
                                }
                                className={`w-20 mx-auto ${
                                  getFieldError("externalMarks")
                                    ? "border-red-500"
                                    : ""
                                }`}
                              />
                              {getFieldError("externalMarks") && (
                                <p className="text-xs text-red-500">
                                  {getFieldError("externalMarks")}
                                </p>
                              )}
                            </div>
                          ) : (
                            subject.externalMarks ?? "—"
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          {subject.grade ? (
                            <Badge variant="outline" className="mx-auto">
                              {subject.grade}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {subject.gradePoint ?? "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {subject.qualityPoint ?? "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {editingSubject === subject.id ? (
                            <div className="flex space-x-1 justify-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={saveSubjectMarks}
                                      disabled={isUpdating}
                                    >
                                      {isUpdating ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                      ) : (
                                        <Save className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Save changes</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={cancelEditing}
                                      disabled={isUpdating}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Cancel</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ) : (
                            <div className="flex space-x-1 justify-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => startEditing(subject)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit marks</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() =>
                                        confirmDeleteSubject(subject.id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete subject</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
        {(showExternalUpdateGuide || showGradeUpdateGuide) && (
          <div className="mt-8 space-y-4 border p-4 rounded-md bg-muted/30">
            <h3 className="text-base font-semibold">Important Update Notes:</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {showExternalUpdateGuide && (
                <div className="space-y-2">
                  <p className="text-sm">
                    You&apos;ve updated mark values. To ensure these are
                    properly reflected in the system:
                  </p>
                  <Link href="/post-external-marks">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Update External Marks
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will ensure all external marks are properly stored and
                    validated.
                  </p>
                </div>
              )}

              {showGradeUpdateGuide && (
                <div className="space-y-2">
                  <p className="text-sm">
                    To recalculate grades, grade points, quality points, GPA and
                    CGPA based on your updates:
                  </p>
                  <Link href="/post-grade-details">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Recalculate Grades & GPA
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will update all calculated values based on your new
                    mark entries.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowExternalUpdateGuide(false);
                  setShowGradeUpdateGuide(false);
                }}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </div>
      <AlertDialog
        open={!!subjectToDelete}
        onOpenChange={(open) => !open && setSubjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject Grade</AlertDialogTitle>
            <AlertDialogDescription>
              {isLastSubject ? (
                <>
                  This is the <strong>last subject</strong> in this grade card.
                  Deleting it will also delete the entire grade card. This
                  action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to delete this subject grade? This
                  action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteSubjectGrade}
              disabled={isDeletingSubject}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingSubject ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject Grade</AlertDialogTitle>
            <AlertDialogDescription>
              {isLastSubject ? (
                <>
                  This is the <strong>last subject</strong> in this grade card.
                  Deleting it will also delete the entire grade card. This
                  action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to delete this subject grade? This
                  action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteSubjectGrade}
              disabled={isDeletingSubject}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingSubject ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SideBarLayout>
  );
}
