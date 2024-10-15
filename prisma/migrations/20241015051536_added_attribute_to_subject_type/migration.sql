/*
  Warnings:

  - You are about to drop the column `type` on the `SubjectType` table. All the data in the column will be lost.
  - Added the required column `alias` to the `SubjectType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `SubjectType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubjectType" DROP COLUMN "type",
ADD COLUMN     "alias" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
