import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { BatchBaseExamFee } from "@/types/batch-base";

interface EditBaseExamFeeProps {
  fee: BatchBaseExamFee;
  onSuccess: () => void;
}

export function EditBaseExamFee({ fee, onSuccess }: EditBaseExamFeeProps) {
  const [baseFee, setBaseFee] = useState<string>(fee.baseFee.toString());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/batchBaseExamFee/${fee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseFee: parseFloat(baseFee) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update base exam fee");
      }

      toast({
        title: "Success",
        description: "Base exam fee updated successfully",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2">Batch: {fee.batch.name}</label>
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
        Update Base Exam Fee
      </Button>
    </form>
  );
}
