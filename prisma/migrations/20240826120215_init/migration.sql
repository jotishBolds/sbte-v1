/*
  Warnings:

  - A unique constraint covering the columns `[departmentId]` on the table `HeadOfDepartment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `collegeId` to the `FinanceManager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `HeadOfDepartment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `collegeId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FinanceManager" ADD COLUMN     "collegeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "HeadOfDepartment" ADD COLUMN     "departmentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "collegeId" TEXT NOT NULL,
ADD COLUMN     "departmentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "HeadOfDepartment_departmentId_key" ON "HeadOfDepartment"("departmentId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeadOfDepartment" ADD CONSTRAINT "HeadOfDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceManager" ADD CONSTRAINT "FinanceManager_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
