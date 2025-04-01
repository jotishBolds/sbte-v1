/*
  Warnings:

  - Added the required column `batchId` to the `StudentGradeCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudentGradeCard" ADD COLUMN     "batchId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "StudentGradeCard" ADD CONSTRAINT "StudentGradeCard_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
