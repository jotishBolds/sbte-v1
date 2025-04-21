"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Calculator,
  Info,
  AlertCircle,
  CheckCircle2,
  CornerDownLeft,
} from "lucide-react";
import SideBarLayout from "@/components/sidebar/layout";
import { zodResolver } from "@hookform/resolvers/zod";

interface Batch {
  id: string;
  name: string;
}

interface ErrorDetails {
  message?: string;
  errors?: string[];
  details?: string;
}

const formSchema = z.object({
  batchId: z.string().min(1, "Batch is required"),
});

export default function ExternalMarksCalculator() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchId: "",
    },
  });

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch("/api/batch");
        if (!response.ok) throw new Error("Failed to fetch batches");
        const data = await response.json();

        if (Array.isArray(data)) {
          setBatches(data);
        } else {
          console.error("Expected array but got:", data);
          setBatches([]);
          toast({
            title: "Error",
            description: "Invalid batch data format received",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
        setBatches([]);
        toast({
          title: "Error",
          description: "Failed to load batches",
          variant: "destructive",
        });
      }
    };

    fetchBatches();
  }, [toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session?.user?.collegeId) {
      toast({
        title: "Error",
        description: "No college ID found in session",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      setSuccess(false);
      setProgress(20);

      const response = await fetch("/api/gradeCard/calculateExternal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ batchId: values.batchId }),
      });

      setProgress(80);
      const data = await response.json();
      setProgress(100);

      if (!response.ok) {
        const errorInfo: ErrorDetails = {
          message: data.message || "An error occurred during calculation",
          errors: data.errors || [],
          details: data.details || "",
        };

        setErrorDetails(errorInfo);
        setShowErrorDialog(true);
        setProcessing(false);
        return;
      }

      toast({
        title: "Success",
        description:
          data.message || "External marks calculated and updated successfully",
        variant: "default",
      });

      setSuccess(true);
      setProcessing(false);

      // Redirect after 5 seconds
      setTimeout(() => {
        router.push("/gradecard-view");
      }, 5000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      const errorInfo: ErrorDetails = {
        message: "Error calculating external marks",
        errors: [errorMessage],
      };

      setErrorDetails(errorInfo);
      setShowErrorDialog(true);
      setProcessing(false);
      setProgress(0);
    }
  };

  const renderErrorDetails = () => {
    if (!errorDetails) return null;

    return (
      <div className="space-y-4">
        {errorDetails.message && (
          <p className="font-medium text-red-600">{errorDetails.message}</p>
        )}

        {errorDetails.errors && errorDetails.errors.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold">Errors:</p>
            {errorDetails.errors.map((error, index) => (
              <Alert key={`error-${index}`} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {errorDetails.details && (
          <p className="text-xs text-gray-500 mt-2">
            Details: {errorDetails.details}
          </p>
        )}
      </div>
    );
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              Calculate External Marks
            </CardTitle>
            <CardDescription>
              Calculate external marks based on semester exam results (70% of
              semester exam marks)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="batchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a batch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(batches) ? (
                            batches.map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading">
                              Loading batches...
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the batch for which you want to calculate
                        external marks
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {progress > 0 && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground text-center">
                      {progress === 100 && success
                        ? "Calculation complete"
                        : "Processing..."}
                    </p>
                  </div>
                )}

                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Success</AlertTitle>
                    <AlertDescription className="text-green-700">
                      External marks calculated successfully. Redirecting to
                      grade cards in 5 seconds...
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-grow"
                    onClick={() => router.push("/gradecard-view")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    Back to Grade Cards
                  </Button>

                  <Button
                    type="submit"
                    className="flex-grow"
                    disabled={processing || !form.formState.isValid}
                  >
                    {processing ? (
                      <>
                        <Calculator className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Calculator className="mr-2 h-4 w-4" />
                        Calculate External Marks
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Pre-requisites</AlertTitle>
              <AlertDescription>
                Before calculating external marks, ensure that:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    All semester exam marks have been uploaded for all students
                    in the batch
                  </li>
                  <li>
                    Internal marks have been uploaded for all students in the
                    batch
                  </li>
                  <li>
                    Grade cards have been created for all students in the batch
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardFooter>
        </Card>

        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Calculation Errors</AlertDialogTitle>
              <AlertDialogDescription>
                {renderErrorDetails()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Acknowledge</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SideBarLayout>
  );
}
