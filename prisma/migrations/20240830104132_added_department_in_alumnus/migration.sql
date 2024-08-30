/*
  Warnings:

  - Added the required column `departmentId` to the `Alumnus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alumnus" ADD COLUMN     "departmentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Alumnus" ADD CONSTRAINT "Alumnus_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
