/*
  Warnings:

  - You are about to drop the column `address` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `admissionYear` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `father_name` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `mother_name` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `designation` on the `Teacher` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[personalEmail]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `collegeId` to the `CertificateType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academicYearId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissionDate` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissionYearId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batchYearId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guardianGender` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guardianMobileNo` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guardianName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guardianRelation` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permanentAddress` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permanentCity` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permanentCountry` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permanentPincode` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permanentState` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalEmail` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `designationId` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maritalStatus` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClassType" AS ENUM ('PRACTICAL', 'THEORY', 'BOTH');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('PROMOTED', 'IN_PROGRESS', 'RESIT');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('MARRIED', 'WIDOWED', 'SEPARATED', 'DIVORCED', 'SINGLE');

-- CreateEnum
CREATE TYPE "Caste" AS ENUM ('GENERAL', 'OBC', 'ST', 'SC');

-- CreateEnum
CREATE TYPE "Month" AS ENUM ('JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER');

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_teacherId_fkey";

-- AlterTable
ALTER TABLE "CertificateType" ADD COLUMN     "collegeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "address",
DROP COLUMN "admissionYear",
DROP COLUMN "father_name",
DROP COLUMN "mother_name",
ADD COLUMN     "abcId" TEXT,
ADD COLUMN     "academicYearId" TEXT NOT NULL,
ADD COLUMN     "admissionCategory" TEXT,
ADD COLUMN     "admissionDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "admissionYearId" TEXT NOT NULL,
ADD COLUMN     "batchYearId" TEXT NOT NULL,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "caste" TEXT,
ADD COLUMN     "fatherName" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "graduateDate" TIMESTAMP(3),
ADD COLUMN     "guardianEmail" TEXT,
ADD COLUMN     "guardianGender" TEXT NOT NULL,
ADD COLUMN     "guardianMobileNo" TEXT NOT NULL,
ADD COLUMN     "guardianName" TEXT NOT NULL,
ADD COLUMN     "guardianRelation" TEXT NOT NULL,
ADD COLUMN     "isDifferentlyAbled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLocalStudent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastCollegeAttended" TEXT,
ADD COLUMN     "motherName" TEXT NOT NULL,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "permanentAddress" TEXT NOT NULL,
ADD COLUMN     "permanentCity" TEXT NOT NULL,
ADD COLUMN     "permanentCountry" TEXT NOT NULL,
ADD COLUMN     "permanentPincode" TEXT NOT NULL,
ADD COLUMN     "permanentState" TEXT NOT NULL,
ADD COLUMN     "personalEmail" TEXT NOT NULL,
ADD COLUMN     "programId" TEXT NOT NULL,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "resident" TEXT,
ADD COLUMN     "studentAvatar" TEXT,
ADD COLUMN     "termId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "semester",
DROP COLUMN "teacherId",
ADD COLUMN     "alias" TEXT,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "designation",
ADD COLUMN     "caste" "Caste",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "designationId" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "hasResigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDifferentlyAbled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLocalResident" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joiningDate" TIMESTAMP(3),
ADD COLUMN     "maritalStatus" "MaritalStatus" NOT NULL,
ADD COLUMN     "religion" TEXT;

-- CreateTable
CREATE TABLE "ProgramType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,

    CONSTRAINT "ProgramType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "programTypeId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemesterProgram" (
    "id" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "SemesterProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL,
    "collegeId" TEXT NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionYear" (
    "id" TEXT NOT NULL,
    "year" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL,
    "collegeId" TEXT NOT NULL,

    CONSTRAINT "AdmissionYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchYear" (
    "id" TEXT NOT NULL,
    "year" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL,
    "collegeId" TEXT NOT NULL,

    CONSTRAINT "BatchYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,

    CONSTRAINT "BatchType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "batchTypeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectType" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "SubjectType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchSubject" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subjectTypeId" TEXT NOT NULL,
    "classType" "ClassType" NOT NULL,

    CONSTRAINT "BatchSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyBatchSubjectClasses" (
    "id" TEXT NOT NULL,
    "batchSubjectId" TEXT NOT NULL,
    "month" "Month" NOT NULL,
    "totalTheoryClasses" INTEGER NOT NULL,
    "totalPracticalClasses" INTEGER NOT NULL,
    "completedTheoryClasses" INTEGER NOT NULL,
    "completedPracticalClasses" INTEGER NOT NULL,

    CONSTRAINT "MonthlyBatchSubjectClasses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyBatchSubjectAttendance" (
    "id" TEXT NOT NULL,
    "monthlyBatchSubjectClassesId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "attendedTheoryClasses" INTEGER NOT NULL,
    "attendedPracticalClasses" INTEGER NOT NULL,

    CONSTRAINT "MonthlyBatchSubjectAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentBatch" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "batchStatus" "BatchStatus" NOT NULL,

    CONSTRAINT "StudentBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAssignedSubject" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "batchSubjectId" TEXT NOT NULL,

    CONSTRAINT "TeacherAssignedSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "description" TEXT,
    "collegeId" TEXT NOT NULL,

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "description" TEXT,
    "collegeId" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Program_code_key" ON "Program"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyBatchSubjectClasses_batchSubjectId_month_key" ON "MonthlyBatchSubjectClasses"("batchSubjectId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyBatchSubjectAttendance_monthlyBatchSubjectClassesId__key" ON "MonthlyBatchSubjectAttendance"("monthlyBatchSubjectClassesId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_personalEmail_key" ON "Student"("personalEmail");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_batchYearId_fkey" FOREIGN KEY ("batchYearId") REFERENCES "BatchYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_admissionYearId_fkey" FOREIGN KEY ("admissionYearId") REFERENCES "AdmissionYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramType" ADD CONSTRAINT "ProgramType_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_programTypeId_fkey" FOREIGN KEY ("programTypeId") REFERENCES "ProgramType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterProgram" ADD CONSTRAINT "SemesterProgram_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemesterProgram" ADD CONSTRAINT "SemesterProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionYear" ADD CONSTRAINT "AdmissionYear_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchYear" ADD CONSTRAINT "BatchYear_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchType" ADD CONSTRAINT "BatchType_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_batchTypeId_fkey" FOREIGN KEY ("batchTypeId") REFERENCES "BatchType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectType" ADD CONSTRAINT "SubjectType_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchSubject" ADD CONSTRAINT "BatchSubject_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchSubject" ADD CONSTRAINT "BatchSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchSubject" ADD CONSTRAINT "BatchSubject_subjectTypeId_fkey" FOREIGN KEY ("subjectTypeId") REFERENCES "SubjectType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyBatchSubjectClasses" ADD CONSTRAINT "MonthlyBatchSubjectClasses_batchSubjectId_fkey" FOREIGN KEY ("batchSubjectId") REFERENCES "BatchSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyBatchSubjectAttendance" ADD CONSTRAINT "MonthlyBatchSubjectAttendance_monthlyBatchSubjectClassesId_fkey" FOREIGN KEY ("monthlyBatchSubjectClassesId") REFERENCES "MonthlyBatchSubjectClasses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyBatchSubjectAttendance" ADD CONSTRAINT "MonthlyBatchSubjectAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBatch" ADD CONSTRAINT "StudentBatch_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBatch" ADD CONSTRAINT "StudentBatch_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "Designation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignedSubject" ADD CONSTRAINT "TeacherAssignedSubject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignedSubject" ADD CONSTRAINT "TeacherAssignedSubject_batchSubjectId_fkey" FOREIGN KEY ("batchSubjectId") REFERENCES "BatchSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Designation" ADD CONSTRAINT "Designation_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateType" ADD CONSTRAINT "CertificateType_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
