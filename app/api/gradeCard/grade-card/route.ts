import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const gradeCards = await prisma.studentGradeCard.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" }, // Most recent first
      include: {
        student: {
          include: {
            user: true,
            program: true,
            department: true,
            college: true,
          },
        },
        semester: true,
        subjectGrades: {
          include: {
            batchSubject: {
              include: {
                subject: true,
                subjectType: true,
              },
            },
          },
        },
      },
    });

    if (!gradeCards || gradeCards.length === 0) {
      return NextResponse.json(
        { error: "No grade cards found for this student" },
        { status: 404 }
      );
    }

    // Transform the data to match frontend structure
    const transformedData = gradeCards.map((gradeCard) => ({
      id: gradeCard.id,
      name: gradeCard.student.name,
      rollNo: gradeCard.student.enrollmentNo || "",
      gradeCardNo: gradeCard.cardNo,
      semester: gradeCard.semester.name,
      subjects: gradeCard.subjectGrades.map((subjectGrade) => ({
        name: subjectGrade.batchSubject.subject.name,
        credit: subjectGrade.credit,
        grade: subjectGrade.grade || "",
        gradePoint: subjectGrade.gradePoint || 0,
        qualityPoint: subjectGrade.qualityPoint || 0,
        internalMarks: subjectGrade.internalMarks || 0,
        externalMarks: subjectGrade.externalMarks || 0,
        classType: subjectGrade.batchSubject.classType, // Include class type from batchSubject
      })),
      totalGradedCredits: gradeCard.totalGradedCredit || 0,
      totalQualityPoints: gradeCard.totalQualityPoint || 0,
      gpa: gradeCard.gpa || 0,
      cgpa: gradeCard.cgpa || 0,
      programName: gradeCard.student.program.name,
      collegeName: gradeCard.student.college.name,
      departmentName: gradeCard.student.department.name,
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching grade cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch grade cards" },
      { status: 500 }
    );
  }
}
