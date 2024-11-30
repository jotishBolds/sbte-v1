import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Batch } from "@/types/batch-base";

interface BatchSelectProps {
  onBatchSelect: (batchId: string) => void;
  selectedBatchId?: string;
}

export function BatchSelect({
  onBatchSelect,
  selectedBatchId,
}: BatchSelectProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBatches() {
      try {
        const response = await fetch("/api/batch");
        if (!response.ok) throw new Error("Failed to fetch batches");
        const data = await response.json();
        setBatches(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching batches:", error);
        setIsLoading(false);
      }
    }
    fetchBatches();
  }, []);

  if (isLoading) return <div>Loading batches...</div>;

  return (
    <Select value={selectedBatchId} onValueChange={onBatchSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Select Batch" />
      </SelectTrigger>
      <SelectContent>
        {batches.map((batch) => (
          <SelectItem key={batch.id} value={batch.id}>
            {batch.name} | {batch.program.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
