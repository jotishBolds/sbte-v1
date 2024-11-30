/*
  Warnings:

  - Made the column `achievedMarks` on table `ExamMark` required. This step will fail if there are existing NULL values in that column.
  - Made the column `wasAbsent` on table `ExamMark` required. This step will fail if there are existing NULL values in that column.
  - Made the column `debarred` on table `ExamMark` required. This step will fail if there are existing NULL values in that column.
  - Made the column `malpractice` on table `ExamMark` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ExamMark" ALTER COLUMN "achievedMarks" SET NOT NULL,
ALTER COLUMN "wasAbsent" SET NOT NULL,
ALTER COLUMN "debarred" SET NOT NULL,
ALTER COLUMN "malpractice" SET NOT NULL;
