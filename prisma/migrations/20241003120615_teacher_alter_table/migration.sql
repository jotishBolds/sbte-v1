-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_designationId_fkey";

-- AlterTable
ALTER TABLE "Teacher" ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "experience" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "phoneNo" DROP NOT NULL,
ALTER COLUMN "qualification" DROP NOT NULL,
ALTER COLUMN "categoryId" DROP NOT NULL,
ALTER COLUMN "designationId" DROP NOT NULL,
ALTER COLUMN "hasResigned" DROP NOT NULL,
ALTER COLUMN "isDifferentlyAbled" DROP NOT NULL,
ALTER COLUMN "isLocalResident" DROP NOT NULL,
ALTER COLUMN "maritalStatus" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "Designation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
