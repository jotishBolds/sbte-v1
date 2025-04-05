import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user?.collegeId;
    if (!collegeId) {
      return NextResponse.json(
        { error: "No college ID in session" },
        { status: 400 }
      );
    }

    const { batchId } = await req.json();
    if (!batchId) {
      return NextResponse.json(
        { error: "Batch ID is required" },
        { status: 400 }
      );
    }

    const gradeCards = await prisma.studentGradeCard.findMany({
      where: {
        batchId,
        student: {
          collegeId,
        },
      },
      include: {
        subjectGrades: {
          include: {
            batchSubject: {
              include: {
                subject: true,
              },
            },
          },
        },
        student: {
          include: {
            gradeCards: {
              include: {
                subjectGrades: true,
                semester: true,
              },
            },
          },
        },
        semester: true,
      },
    });

    if (!gradeCards.length) {
      return NextResponse.json(
        { error: "No student grade cards found for this batch." },
        { status: 404 }
      );
    }

    const errorMessages: string[] = [];

    for (const card of gradeCards) {
      let totalGradedCredit = 0;
      let totalQualityPoint = 0;

      for (const gradeDetail of card.subjectGrades) {
        const { id, internalMarks, externalMarks, batchSubject } = gradeDetail;
        const credit = gradeDetail.credit;
        const classType = batchSubject.classType;

        if (internalMarks == null || externalMarks == null) {
          errorMessages.push(
            `Missing internal or external marks for student ${card.student.name}-${card.student.enrollmentNo} in subject ${batchSubject.subject.name}-${batchSubject.subject.code}`
          );
          continue;
        }

        const total = internalMarks + externalMarks;

        let grade = "F";
        let point = 0;

        if (classType === "THEORY") {
          if (total >= 90) {
            grade = "S";
            point = 10;
          } else if (total >= 80) {
            grade = "A";
            point = 9;
          } else if (total >= 70) {
            grade = "B";
            point = 8;
          } else if (total >= 60) {
            grade = "C";
            point = 7;
          } else if (total >= 50) {
            grade = "D";
            point = 6;
          } else if (total >= 40) {
            grade = "E";
            point = 5;
          }
        } else if (classType === "PRACTICAL") {
          if (total >= 90) {
            grade = "S";
            point = 10;
          } else if (total >= 80) {
            grade = "A";
            point = 9;
          } else if (total >= 70) {
            grade = "B";
            point = 8;
          } else if (total >= 60) {
            grade = "C";
            point = 7;
          } else if (total >= 55) {
            grade = "D";
            point = 6;
          } else if (total >= 50) {
            grade = "E";
            point = 5;
          }
        }

        const qualityPoint = credit * point;

        totalGradedCredit += credit;
        totalQualityPoint += qualityPoint;

        gradeDetail.grade = grade;
        gradeDetail.gradePoint = point;
        gradeDetail.qualityPoint = qualityPoint;
      }

      card.totalGradedCredit = totalGradedCredit;
      card.totalQualityPoint = totalQualityPoint;
      card.gpa =
        totalGradedCredit > 0 ? parseFloat((totalQualityPoint / totalGradedCredit).toFixed(2)) : 0;

      const semesterNumber = card.semester?.numerical;
      if (semesterNumber && semesterNumber > 1) {
        console.log("Student GCards",card.student.gradeCards);
        const pastCards = card.student.gradeCards.filter(
          (gc) =>
            gc.id !== card.id &&
            gc.semester?.numerical &&
            gc.semester.numerical < semesterNumber &&
            gc.totalGradedCredit !== null &&
            gc.totalQualityPoint !== null
        );
        console.log("Past Cards ",pastCards);

        const pastCredits = pastCards.reduce(
          (acc, gc) => acc + (gc.totalGradedCredit || 0),
          0
        );
        const pastQuality = pastCards.reduce(
          (acc, gc) => acc + (gc.totalQualityPoint || 0),
          0
        );

        const totalCredits = totalGradedCredit + pastCredits;
        const totalQuality = totalQualityPoint + pastQuality;
        console.log("Total ",totalCredits, totalQuality);
        card.cgpa = totalCredits > 0 ? parseFloat((totalQuality / totalCredits).toFixed(2)) : 0;
      }
    }

    if (errorMessages.length > 0) {
      return NextResponse.json({ errors: errorMessages }, { status: 400 });
    }

    // Proceed with DB updates only if no errors
    for (const card of gradeCards) {
      await prisma.studentGradeCard.update({
        where: { id: card.id },
        data: {
          totalGradedCredit: card.totalGradedCredit,
          totalQualityPoint: card.totalQualityPoint,
          gpa: card.gpa,
          cgpa: card.cgpa ?? undefined,
        },
      });

      for (const detail of card.subjectGrades) {
        await prisma.subjectGradeDetail.update({
          where: { id: detail.id },
          data: {
            grade: detail.grade,
            gradePoint: detail.gradePoint,
            qualityPoint: detail.qualityPoint,
          },
        });
      }
    }

    return NextResponse.json(
      { message: "Grade calculations and updates successful." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error calculating grades:", error);
    return NextResponse.json(
      {
        error: "Failed to calculate grade details",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
