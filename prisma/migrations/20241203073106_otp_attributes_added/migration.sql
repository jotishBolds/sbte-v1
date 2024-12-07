/*
  Warnings:

  - A unique constraint covering the columns `[phoneNo]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastOtpRequestedAt" TIMESTAMP(3),
ADD COLUMN     "lockExpires" TIMESTAMP(3),
ADD COLUMN     "otpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otpExpiration" TIMESTAMP(3),
ADD COLUMN     "otpSecret" TEXT,
ADD COLUMN     "phoneNo" TEXT,
ADD COLUMN     "phoneVerificationAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phoneVerificationExpires" TIMESTAMP(3),
ADD COLUMN     "phoneVerificationToken" TEXT,
ADD COLUMN     "twoFactorSecret" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNo_key" ON "User"("phoneNo");
