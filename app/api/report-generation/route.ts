import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET() {
  // Create a new jsPDF instance
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Student Data (matching the component)
  const studentData = {
    name: "John Doe",
    rollNo: "C22JD-CS002",
    gradeCardNo: "GC22CS3 002",
    semester: "Third",
    subjects: [
      {
        name: "Applied Mathematics & Graph Theory",
        credit: 4,
        grade: "D",
        gradePoint: 6,
        qualityPoint: 24,
      },
      {
        name: "Advance DC Programming",
        credit: 3,
        grade: "D*",
        gradePoint: 6,
        qualityPoint: 18,
      },
      {
        name: "Soft Core-I",
        credit: 3,
        grade: "D",
        gradePoint: 6,
        qualityPoint: 18,
      },
      {
        name: "Digital Circuits",
        credit: 3,
        grade: "D",
        gradePoint: 6,
        qualityPoint: 18,
      },
      {
        name: "Data Structure & Algorithm",
        credit: 4,
        grade: "E",
        gradePoint: 5,
        qualityPoint: 20,
      },
      {
        name: "Computer Organization",
        credit: 3,
        grade: "S",
        gradePoint: 10,
        qualityPoint: 30,
      },
      {
        name: "Advance DC Programming",
        credit: 2,
        grade: "A",
        gradePoint: 9,
        qualityPoint: 18,
      },
      {
        name: "Digital Circuits ES-II",
        credit: 2,
        grade: "A",
        gradePoint: 9,
        qualityPoint: 18,
      },
      {
        name: "Data Structure & Algorithm ES-II",
        credit: 2,
        grade: "S",
        gradePoint: 10,
        qualityPoint: 20,
      },
      {
        name: "Professional Practice",
        credit: 1,
        grade: "S",
        gradePoint: 10,
        qualityPoint: 10,
      },
    ],
    totalGradedCredits: 27,
    totalQualityPoints: 194,
    gpa: 7.19,
    cgpa: 7.05,
  };

  // Set font
  doc.setFont("helvetica");

  // Add Institute Details
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(
    "INSTITUTE: CENTRE FOR COMPUTERS AND COMMUNICATION TECHNOLOGY",
    doc.internal.pageSize.width / 2,
    15,
    { align: "center" }
  );

  // Subtitle
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const subtitle =
    "DIPLOMA IN COMPUTER SCIENCE AND TECHNOLOGY (AICTE APPROVED)";
  doc.text(subtitle, doc.internal.pageSize.width / 2, 25, { align: "center" });

  // Underline subtitle
  const subtitleWidth = doc.getTextWidth(subtitle);
  const subtitleX = (doc.internal.pageSize.width - subtitleWidth) / 2;
  doc.setLineWidth(0.5);
  doc.line(subtitleX, 27, subtitleX + subtitleWidth, 27);

  // Student Info
  doc.setFontSize(10);
  doc.text(`NAME: ${studentData.name}`, 15, 40);
  doc.text(`ROLL NO: ${studentData.rollNo}`, 15, 47);
  doc.text(`GRADE CARD NO: ${studentData.gradeCardNo}`, 160, 40);
  doc.text(`SEMESTER: ${studentData.semester}`, 160, 47);

  // Prepare table data
  const tableColumns = [
    { header: "SUBJECTS", dataKey: "name" },
    { header: "CREDIT", dataKey: "credit" },
    { header: "GRADE", dataKey: "grade" },
    { header: "GRADE POINT", dataKey: "gradePoint" },
    { header: "QUALITY POINT", dataKey: "qualityPoint" },
  ];

  const tableRows = studentData.subjects.map((subject) => ({
    name: subject.name,
    credit: subject.credit,
    grade: subject.grade,
    gradePoint: subject.gradePoint,
    qualityPoint: subject.qualityPoint,
  }));

  // Add table using autoTable method
  autoTable(doc, {
    startY: 55,
    head: [tableColumns.map((col) => col.header)],
    body: tableRows.map((row) =>
      tableColumns.map((col) => row[col.dataKey as keyof typeof row])
    ),
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      valign: "middle",
      halign: "center",
    },
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: 0,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: "auto" }, // Allow first column (subjects) to wrap
    },
  });

  // Add summary section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(
    `TOTAL GRADED CREDITS: ${studentData.totalGradedCredits}`,
    15,
    finalY
  );
  doc.text(
    `TOTAL QUALITY POINTS: ${studentData.totalQualityPoints}`,
    80,
    finalY
  );
  doc.text(`GPA: ${studentData.gpa}`, 150, finalY);
  doc.text(`CGPA: ${studentData.cgpa}`, 200, finalY);

  // Add note about additional attempts
  doc.setFontSize(8);
  doc.text("* indicates number of additional attempts", 15, finalY + 10);

  // Generate the PDF buffer
  const pdfBuffer = doc.output("arraybuffer");

  // Return the PDF as a response
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Disposition": "attachment; filename=grade-card.pdf",
      "Content-Type": "application/pdf",
    },
  });
}
