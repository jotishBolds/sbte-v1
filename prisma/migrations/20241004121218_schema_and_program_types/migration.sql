/*
  Warnings:

  - You are about to drop the column `batchYear` on the `Alumnus` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mark` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `admissionYearId` to the `Alumnus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batchYearId` to the `Alumnus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programId` to the `Alumnus` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `paymentStatus` on the `Certificate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `teacherAssignedSubjectId` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `collegeId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_departmentId_fkey";

-- AlterTable
ALTER TABLE "Alumnus" DROP COLUMN "batchYear",
ADD COLUMN     "admissionYearId" TEXT NOT NULL,
ADD COLUMN     "batchYearId" TEXT NOT NULL,
ADD COLUMN     "programId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "paymentStatus",
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "subjectId",
ADD COLUMN     "teacherAssignedSubjectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "departmentId",
ADD COLUMN     "collegeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Attendance";

-- DropTable
DROP TABLE "Mark";

-- CreateTable
CREATE TABLE "ExamType" (
    "id" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "totalMarks" DECIMAL(65,30) NOT NULL,
    "collegeId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ExamType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamMark" (
    "id" TEXT NOT NULL,
    "examTypeId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "batchSubjectId" TEXT NOT NULL,
    "achievedMarks" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "wasAbsent" BOOLEAN NOT NULL DEFAULT false,
    "debarred" BOOLEAN NOT NULL DEFAULT false,
    "malpractice" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ExamMark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamMark_examTypeId_studentId_batchSubjectId_key" ON "ExamMark"("examTypeId", "studentId", "batchSubjectId");

-- AddForeignKey
ALTER TABLE "ExamType" ADD CONSTRAINT "ExamType_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamMark" ADD CONSTRAINT "ExamMark_examTypeId_fkey" FOREIGN KEY ("examTypeId") REFERENCES "ExamType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamMark" ADD CONSTRAINT "ExamMark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamMark" ADD CONSTRAINT "ExamMark_batchSubjectId_fkey" FOREIGN KEY ("batchSubjectId") REFERENCES "BatchSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alumnus" ADD CONSTRAINT "Alumnus_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alumnus" ADD CONSTRAINT "Alumnus_batchYearId_fkey" FOREIGN KEY ("batchYearId") REFERENCES "BatchYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alumnus" ADD CONSTRAINT "Alumnus_admissionYearId_fkey" FOREIGN KEY ("admissionYearId") REFERENCES "AdmissionYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_teacherAssignedSubjectId_fkey" FOREIGN KEY ("teacherAssignedSubjectId") REFERENCES "TeacherAssignedSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
