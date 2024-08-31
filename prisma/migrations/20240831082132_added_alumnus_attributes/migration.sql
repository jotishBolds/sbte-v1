-- AlterTable
ALTER TABLE "Alumnus" ADD COLUMN     "achievements" TEXT,
ADD COLUMN     "currentEmployer" TEXT,
ADD COLUMN     "currentPosition" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "gpa" DOUBLE PRECISION,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "linkedInProfile" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
