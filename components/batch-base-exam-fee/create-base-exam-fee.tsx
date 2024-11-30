"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { BatchSelect } from "./batch-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CreateBaseExamFee() {
  const [batchId, setBatchId] = useState<string>("");
  const [baseFee, setBaseFee] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/batchBaseExamFee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId,
          baseFee: parseFloat(baseFee),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create base exam fee");
      }

      toast({
        title: "Success",
        description: "Base exam fee created successfully",
      });

      router.push("/batch-base-exam-fees");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Create Base Exam Fee</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Select Batch</label>
            <BatchSelect onBatchSelect={setBatchId} />
          </div>
          <div>
            <label className="block mb-2">Base Fee</label>
            <Input
              type="number"
              value={baseFee}
              onChange={(e) => setBaseFee(e.target.value)}
              placeholder="Enter base fee"
              required
              min="0"
              step="0.01"
            />
          </div>
          <Button type="submit" className="w-full">
            Create Base Exam Fee
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
