-- CreateTable
CREATE TABLE "StudentBatchExamFee" (
    "id" TEXT NOT NULL,
    "studentBatchId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "examFee" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "StudentBatchExamFee_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudentBatchExamFee" ADD CONSTRAINT "StudentBatchExamFee_studentBatchId_fkey" FOREIGN KEY ("studentBatchId") REFERENCES "StudentBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBatchExamFee" ADD CONSTRAINT "StudentBatchExamFee_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBatchExamFee" ADD CONSTRAINT "StudentBatchExamFee_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
