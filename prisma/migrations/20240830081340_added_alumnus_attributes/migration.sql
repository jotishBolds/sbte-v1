/*
  Warnings:

  - Added the required column `name` to the `Alumnus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alumnus" ADD COLUMN     "address" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phoneNo" TEXT;
