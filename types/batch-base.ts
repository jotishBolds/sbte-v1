export interface Batch {
  id: string;
  name: string;
  program: { name: string };
  academicYear: { name: string };
  term: { name: string };
}

export interface BatchBaseExamFee {
  id: string;
  batchId: string;
  baseFee: number;
  batch: Batch;
}
