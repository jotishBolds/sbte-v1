-- CreateTable
CREATE TABLE "LoadBalancingPdf" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pdfPath" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoadBalancingPdf_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LoadBalancingPdf" ADD CONSTRAINT "LoadBalancingPdf_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
