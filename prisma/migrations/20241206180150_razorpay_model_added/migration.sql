-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "razorpayPaymentId" TEXT,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PaymentToExamFee" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PaymentToExamFee_AB_unique" ON "_PaymentToExamFee"("A", "B");

-- CreateIndex
CREATE INDEX "_PaymentToExamFee_B_index" ON "_PaymentToExamFee"("B");

-- AddForeignKey
ALTER TABLE "_PaymentToExamFee" ADD CONSTRAINT "_PaymentToExamFee_A_fkey" FOREIGN KEY ("A") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentToExamFee" ADD CONSTRAINT "_PaymentToExamFee_B_fkey" FOREIGN KEY ("B") REFERENCES "StudentBatchExamFee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
