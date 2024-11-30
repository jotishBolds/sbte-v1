-- AlterTable
ALTER TABLE "MonthlyBatchSubjectClasses" ALTER COLUMN "totalTheoryClasses" DROP NOT NULL,
ALTER COLUMN "totalPracticalClasses" DROP NOT NULL,
ALTER COLUMN "completedTheoryClasses" DROP NOT NULL,
ALTER COLUMN "completedPracticalClasses" DROP NOT NULL;
