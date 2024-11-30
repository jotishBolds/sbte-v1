/*
  Warnings:

  - You are about to drop the `NotifiedRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NotifiedRole" DROP CONSTRAINT "NotifiedRole_notificationId_fkey";

-- AlterTable
ALTER TABLE "NotifiedCollege" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "NotifiedRole";
