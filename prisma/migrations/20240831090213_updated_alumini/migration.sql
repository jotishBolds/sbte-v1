/*
  Warnings:

  - Added the required column `departmentId` to the `Alumnus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Alumnus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alumnus" ADD COLUMN     "achievements" TEXT,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "currentEmployer" TEXT,
ADD COLUMN     "currentPosition" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "departmentId" TEXT NOT NULL,
ADD COLUMN     "gpa" DOUBLE PRECISION,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "linkedInProfile" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phoneNo" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Alumnus" ADD CONSTRAINT "Alumnus_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
