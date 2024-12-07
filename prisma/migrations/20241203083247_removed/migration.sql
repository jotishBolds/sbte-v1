/*
  Warnings:

  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isLocked` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isPhoneVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isTwoFactorEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastOtpRequestedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lockExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpAttempts` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpiration` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpSecret` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNo` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerificationAttempts` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerificationExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerificationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorSecret` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_phoneNo_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isActive",
DROP COLUMN "isLocked",
DROP COLUMN "isPhoneVerified",
DROP COLUMN "isTwoFactorEnabled",
DROP COLUMN "lastOtpRequestedAt",
DROP COLUMN "lockExpires",
DROP COLUMN "otpAttempts",
DROP COLUMN "otpExpiration",
DROP COLUMN "otpSecret",
DROP COLUMN "phoneNo",
DROP COLUMN "phoneVerificationAttempts",
DROP COLUMN "phoneVerificationExpires",
DROP COLUMN "phoneVerificationToken",
DROP COLUMN "twoFactorSecret";
