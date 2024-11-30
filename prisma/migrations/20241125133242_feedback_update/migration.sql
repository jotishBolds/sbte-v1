/*
  Warnings:

  - You are about to drop the column `isAnonymous` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `teacherAssignedSubjectId` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `InstituteIds` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `batchSubjectId` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stars` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pdfPath` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_teacherAssignedSubjectId_fkey";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "isAnonymous",
DROP COLUMN "teacherAssignedSubjectId",
ADD COLUMN     "batchSubjectId" TEXT NOT NULL,
ADD COLUMN     "stars" INTEGER NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "InstituteIds",
DROP COLUMN "content",
ADD COLUMN     "pdfPath" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "NotifiedCollege" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotifiedCollege_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_batchSubjectId_fkey" FOREIGN KEY ("batchSubjectId") REFERENCES "BatchSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotifiedCollege" ADD CONSTRAINT "NotifiedCollege_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotifiedCollege" ADD CONSTRAINT "NotifiedCollege_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;
