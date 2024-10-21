/*
  Warnings:

  - Added the required column `creditScore` to the `BatchSubject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BatchSubject" ADD COLUMN     "creditScore" DOUBLE PRECISION NOT NULL;
