-- CreateTable
CREATE TABLE "BatchBaseExamFee" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "baseFee" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BatchBaseExamFee_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BatchBaseExamFee" ADD CONSTRAINT "BatchBaseExamFee_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
