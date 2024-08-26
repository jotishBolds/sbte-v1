/*
  Warnings:

  - You are about to drop the column `date` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `isPresent` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `collegeId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `Student` table. All the data in the column will be lost.
  - Added the required column `batchYear` to the `Alumnus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `percentage` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `certificateTypeId` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentStatus` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `establishedOn` to the `College` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `FinanceManager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `FinanceManager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNo` to the `FinanceManager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `InstituteIds` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissionYear` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dob` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `father_name` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mother_name` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNo` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `designation` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experience` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNo` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qualification` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_collegeId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_departmentId_fkey";

-- AlterTable
ALTER TABLE "Alumnus" ADD COLUMN     "batchYear" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "date",
DROP COLUMN "isPresent",
ADD COLUMN     "percentage" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "type",
ADD COLUMN     "certificateTypeId" TEXT NOT NULL,
ADD COLUMN     "paymentStatus" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "College" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "establishedOn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "websiteUrl" TEXT;

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "subjectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FinanceManager" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phoneNo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "InstituteIds" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "collegeId",
DROP COLUMN "departmentId",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "admissionYear" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "father_name" TEXT NOT NULL,
ADD COLUMN     "mother_name" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phoneNo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "designation" TEXT NOT NULL,
ADD COLUMN     "experience" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phoneNo" TEXT NOT NULL,
ADD COLUMN     "qualification" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT;

-- DropEnum
DROP TYPE "CertificateType";

-- CreateTable
CREATE TABLE "HeadOfDepartment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeadOfDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CertificateType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HeadOfDepartment_userId_key" ON "HeadOfDepartment"("userId");

-- AddForeignKey
ALTER TABLE "HeadOfDepartment" ADD CONSTRAINT "HeadOfDepartment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_certificateTypeId_fkey" FOREIGN KEY ("certificateTypeId") REFERENCES "CertificateType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
