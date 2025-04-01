-- CreateTable
CREATE TABLE "StudentGradeCard" (
    "id" TEXT NOT NULL,
    "cardNo" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "totalQualityPoint" DOUBLE PRECISION NOT NULL,
    "totalGradedCredit" DOUBLE PRECISION NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "cgpa" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentGradeCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectGradeDetail" (
    "id" TEXT NOT NULL,
    "studentGradeCardId" TEXT NOT NULL,
    "batchSubjectId" TEXT NOT NULL,
    "credit" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "gradePoint" DOUBLE PRECISION NOT NULL,
    "qualityPoint" DOUBLE PRECISION NOT NULL,
    "internalMarks" DOUBLE PRECISION NOT NULL,
    "externalMarks" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SubjectGradeDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentGradeCard_cardNo_key" ON "StudentGradeCard"("cardNo");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectGradeDetail_studentGradeCardId_batchSubjectId_key" ON "SubjectGradeDetail"("studentGradeCardId", "batchSubjectId");

-- AddForeignKey
ALTER TABLE "StudentGradeCard" ADD CONSTRAINT "StudentGradeCard_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGradeCard" ADD CONSTRAINT "StudentGradeCard_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectGradeDetail" ADD CONSTRAINT "SubjectGradeDetail_studentGradeCardId_fkey" FOREIGN KEY ("studentGradeCardId") REFERENCES "StudentGradeCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectGradeDetail" ADD CONSTRAINT "SubjectGradeDetail_batchSubjectId_fkey" FOREIGN KEY ("batchSubjectId") REFERENCES "BatchSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
