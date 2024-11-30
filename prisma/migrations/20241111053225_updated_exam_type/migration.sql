/*
  Warnings:

  - Added the required column `updatedAt` to the `ExamType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExamType" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "passingMarks" DECIMAL(65,30),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
