-- CreateTable
CREATE TABLE "Infrastructures" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pdfPath" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Infrastructures_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Infrastructures" ADD CONSTRAINT "Infrastructures_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
