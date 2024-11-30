"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Star, AlertCircle, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StarRating } from "./star";
import SideBarLayout from "@/components/sidebar/layout";

// Interfaces (can be moved to a separate type file)
interface Batch {
  id: string;
  name: string;
}

interface BatchSubject {
  id: string;
  subject: {
    id: string;
    name: string;
  };
}

interface Feedback {
  id: string;
  content?: string;
  stars: number;
  createdAt: string;
  student?: {
    id: string;
    name: string;
    enrollmentNo: string;
  } | null;
  batchSubject?: {
    id: string;
    subject?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

// Zod Schema for Feedback Validation
const feedbackSchema = z.object({
  batchId: z.string({ required_error: "Batch selection is required" }),
  batchSubjectId: z.string({ required_error: "Subject selection is required" }),
  content: z.string().optional(),
  stars: z.coerce.number().min(1, "Minimum 1 star").max(5, "Maximum 5 stars"),
});

export default function FeedbackForm() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchSubjects, setBatchSubjects] = useState<BatchSubject[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();
  const defaultValues = {
    batchId: "",
    batchSubjectId: "",
    content: "",
    stars: 1,
  };

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues,
  });

  // Fetch batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/batch");
        if (!response.ok) throw new Error("Failed to fetch batches");
        const data = await response.json();

        setBatches(data);
      } catch (error) {
        setError("Unable to load batches. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []);

  // Fetch batch subjects when batch is selected
  useEffect(() => {
    const batchId = form.watch("batchId");
    if (!batchId) return;

    const fetchBatchSubjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/batch/${batchId}/subject`);
        if (!response.ok) throw new Error("Failed to fetch batch subjects");
        const data = await response.json();
        setBatchSubjects(data.error ? [] : data);
      } catch (error) {
        setError("Unable to load subjects. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatchSubjects();
  }, [form.watch("batchId")]);

  // Fetch user's feedbacks
  useEffect(() => {
    const fetchUserFeedbacks = async () => {
      try {
        const response = await fetch("/api/feedback");
        if (!response.ok) throw new Error("Failed to fetch feedbacks");
        const data = await response.json();
        // Add a check to ensure data is an array
        setFeedbacks(Array.isArray(data) ? data : []);
      } catch (error) {
        setError("Unable to load previous feedbacks.");
        setFeedbacks([]); // Ensure feedbacks is an empty array on error
      }
    };

    fetchUserFeedbacks();
  }, []);

  const onSubmit = async (data: z.infer<typeof feedbackSchema>) => {
    setError(null);
    setSuccessMessage(null);

    try {
      setIsLoading(true);
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchSubjectId: data.batchSubjectId,
          content: data.content,
          stars: data.stars,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to submit feedback");
      }

      setSuccessMessage("Feedback submitted successfully!");
      if (responseData && responseData.id) {
        setFeedbacks((prevFeedbacks) => [responseData, ...prevFeedbacks]);
      }

      // Reset form to initial values
      form.reset(defaultValues);

      // If you're using controlled components for Select, you might need to manually reset them
      form.setValue("batchId", "");
      form.setValue("batchSubjectId", "");
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Student Feedback Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert variant="default" className="mb-4">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                key={successMessage}
              >
                <FormField
                  control={form.control}
                  name="batchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Batch</FormLabel>
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
                          {batches.map((batch) => (
                            <SelectItem key={batch.id} value={batch.id}>
                              {batch.name}
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
                  name="batchSubjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Subject</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {batchSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.subject.name}
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
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your feedback"
                          {...field}
                          className="resize-y"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stars"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <StarRating
                            rating={field.value}
                            onRatingChange={(newRating) =>
                              field.onChange(newRating)
                            }
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Rate your experience from 1 to 5 stars
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Previous Feedbacks Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Previous Feedbacks</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {feedbacks.length === 0 ? (
                <p className="text-center text-gray-500">
                  No previous feedbacks found
                </p>
              ) : (
                <div className="space-y-3">
                  {feedbacks.map((fb) => (
                    <Card key={fb.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">
                            {fb.batchSubject?.subject?.name ||
                              "Unknown Subject"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {fb.content || "No additional comments"}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <StarRating
                            rating={fb.stars}
                            onRatingChange={() => {}}
                            disabled={true}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
}
