/*
  Warnings:

  - Added the required column `creditScore` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADM';

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "creditScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "semester" TEXT NOT NULL;
