import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gradeCardId = params.id;

    const gradeCard = await prisma.studentGradeCard.findUnique({
      where: { id: gradeCardId },
      include: {
        student: true,
        semester: true,
        batch: true,
        subjectGrades: {
          include: {
            batchSubject: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!gradeCard) {
      return NextResponse.json(
        { error: "Grade card not found" },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateGradeCardPDF(gradeCard);

    // Create a response with the PDF data
    const response = new NextResponse(pdfBuffer);

    // Set appropriate headers
    response.headers.set("Content-Type", "application/pdf");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="GradeCard_${gradeCard.student.enrollmentNo}_Sem${gradeCard.semester.numerical}.pdf"`
    );

    return response;
  } catch (error) {
    console.error("Error generating grade card PDF:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred while generating the PDF.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function generateGradeCardPDF(gradeCard: any) {
  // Create a new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add university/institution logo or header
  // doc.addImage("path/to/logo.png", "PNG", 15, 10, 30, 30); // Uncomment and adjust if you have a logo

  // Add title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT GRADE CARD", pageWidth / 2, 20, { align: "center" });

  // Add institution name
  doc.setFontSize(14);

  // Add card details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Card No: ${gradeCard.cardNo}`, pageWidth - 30, 40, {
    align: "right",
  });
  doc.text(`Date: ${format(new Date(), "dd/MM/yyyy")}`, pageWidth - 30, 45, {
    align: "right",
  });

  // Add student details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Student Details", 15, 55);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${gradeCard.student.name}`, 15, 65);
  doc.text(`Enrollment No: ${gradeCard.student.enrollmentNo}`, 15, 70);
  doc.text(`Batch: ${gradeCard.batch.name}`, 15, 75);
  doc.text(
    `Semester: ${gradeCard.semester.name} (Sem ${gradeCard.semester.numerical})`,
    15,
    80
  );

  // Add grade summary
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Grade Summary", 15, 95);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Calculate total credits
  const totalCredits = gradeCard.subjectGrades.reduce(
    (sum: number, subject: any) => sum + subject.credit,
    0
  );

  doc.text(`Total Credits: ${totalCredits}`, 15, 105);
  doc.text(
    `GPA: ${gradeCard.gpa ? gradeCard.gpa.toFixed(2) : "N/A"}`,
    100,
    105
  );
  doc.text(
    `CGPA: ${gradeCard.cgpa ? gradeCard.cgpa.toFixed(2) : "N/A"}`,
    170,
    105
  );

  // Add subject grades table
  autoTable(doc, {
    startY: 115,
    head: [
      [
        "Subject",
        "Credit",
        "Internal Marks",
        "External Marks",
        "Grade",
        "Grade Point",
        "Quality Point",
      ],
    ],
    body: gradeCard.subjectGrades.map((subject: any) => [
      subject.batchSubject.subject.name,
      subject.credit,
      subject.internalMarks ?? "N/A",
      subject.externalMarks ?? "N/A",
      subject.grade ?? "N/A",
      subject.gradePoint ?? "N/A",
      subject.qualityPoint ?? "N/A",
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
  });

  // Add footer
  const finalY = (doc as any).lastAutoTable.finalY || 200;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "This document is electronically generated and does not require signature.",
    15,
    finalY + 20
  );

  // Add space for signatures if needed
  doc.setFontSize(10);
  doc.text("Academic Coordinator", 40, finalY + 40, { align: "center" });
  doc.text("Principal", pageWidth - 40, finalY + 40, { align: "center" });

  // Convert the PDF document to a buffer
  return Buffer.from(doc.output("arraybuffer"));
}
