"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Loader2, FileSpreadsheet, X, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface AutoBaseExamFeeInsertionProps {
  batchId: string | null;
  onSuccessfulInsertion?: () => void;
}

export function AutoBaseExamFeeInsertion({
  batchId,
  onSuccessfulInsertion,
}: AutoBaseExamFeeInsertionProps) {
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState<string>(() => {
    // Default to 30 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    return defaultDate.toISOString().split("T")[0];
  });
  const [insertionResult, setInsertionResult] = useState<{
    updatedStudents: string[];
    createdStudents: string[];
  } | null>(null);

  const resetState = () => {
    setLoading(false);
    setInsertionResult(null);
    // Reset due date to 30 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setDueDate(defaultDate.toISOString().split("T")[0]);
  };

  const handleAutoInsertion = async () => {
    if (!batchId) {
      toast({
        title: "Error",
        description: "Please select a batch first",
        variant: "destructive",
      });
      return;
    }

    // Validate due date
    if (!dueDate) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setInsertionResult(null);

    try {
      const response = await fetch(
        "/api/studentBatchExamFee/autoBaseExamFeeInsertion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            batchId,
            dueDate: new Date(dueDate).toISOString(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to insert base exam fees");
      }

      setInsertionResult({
        updatedStudents: data.updatedStudents,
        createdStudents: data.createdStudents,
      });

      toast({
        title: "Success",
        description: "Base exam fees inserted successfully",
      });

      onSuccessfulInsertion?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={resetState}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={!batchId}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Auto Insert Base Exam Fees
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95%] max-w-[500px] rounded-lg">
        <DialogHeader className="relative">
          <DialogTitle className="text-lg font-semibold">
            Auto Insert Base Exam Fees
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            This will automatically create or update exam fees for all students
            in the selected batch based on the batch&apos;s base exam fee.
          </DialogDescription>
          <DialogClose
            className="absolute top-0 right-0 p-2 hover:bg-secondary rounded-full"
            aria-label="Close"
          ></DialogClose>
        </DialogHeader>

        <div className="space-y-4">
          {/* Due Date Input */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full"
              min={new Date().toISOString().split("T")[0]} // Prevent past dates
            />
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-muted-foreground">Processing...</span>
            </div>
          )}

          {insertionResult && (
            <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
              <h3 className="text-base font-semibold">Insertion Summary</h3>
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="font-medium mr-2">Updated Students:</span>
                  <span className="text-muted-foreground">
                    {insertionResult.updatedStudents.length > 0
                      ? insertionResult.updatedStudents.join(", ")
                      : "None"}
                  </span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium mr-2">Created Students:</span>
                  <span className="text-muted-foreground">
                    {insertionResult.createdStudents.length > 0
                      ? insertionResult.createdStudents.join(", ")
                      : "None"}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          {insertionResult ? (
            <DialogClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DialogClose>
          ) : (
            <Button
              onClick={handleAutoInsertion}
              disabled={loading || !batchId}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Auto Insert"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
