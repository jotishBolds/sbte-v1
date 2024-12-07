-- AlterTable
ALTER TABLE "StudentBatchExamFee" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "paymentStatus" "PaymentStatus" DEFAULT 'PENDING';
