-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastOtpRequestAt" TIMESTAMP(3),
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3);
