"use client";

import React from "react";

const GradeCard: React.FC = () => {
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

  const handleExport = async () => {
    const response = await fetch("/api/report-generation");
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "grade-card.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-5 font-sans max-w-4xl mx-auto">
      {/* Printable Section */}
      <div className="printable-section">
        <h2 className="text-center text-lg font-bold mb-2">
          INSTITUTE: CENTRE FOR COMPUTERS AND COMMUNICATION TECHNOLOGY
        </h2>
        <h3 className="text-center text-base underline mb-5">
          DIPLOMA IN COMPUTER SCIENCE AND TECHNOLOGY (AICTE APPROVED)
        </h3>
        <div className="flex justify-between mb-5">
          <div>
            <p className="text-sm">NAME: {studentData.name}</p>
            <p className="text-sm">ROLL NO: {studentData.rollNo}</p>
          </div>
          <div>
            <p className="text-sm">GRADE CARD NO: {studentData.gradeCardNo}</p>
            <p className="text-sm">SEMESTER: {studentData.semester}</p>
          </div>
        </div>
        <table className="w-full border-collapse border border-gray-800 dark:border-gray-300 text-center text-xs">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="border border-gray-800 dark:border-gray-300 p-2 font-bold w-[150px]"
              >
                SUBJECTS
              </th>
              <th
                colSpan={5}
                className="border border-gray-800 dark:border-gray-300 p-2 font-bold"
              >
                THEORY
              </th>
              <th
                colSpan={5}
                className="border border-gray-800 dark:border-gray-300 p-2 font-bold"
              >
                PRACTICAL
              </th>
            </tr>
            <tr>
              {studentData.subjects.map((subject, index) => (
                <th
                  key={index}
                  className={`border border-gray-800 dark:border-gray-300 p-2 font-bold ${
                    index === 0 || index === 5
                      ? "w-[100px]"
                      : index === 1 || index === 6
                      ? "w-[90px]"
                      : index === 2 || index === 3 || index === 7 || index === 8
                      ? "w-[70px]"
                      : "w-[80px]"
                  }`}
                >
                  {subject.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-800 dark:border-gray-300 p-2">
                CREDIT
              </td>
              {studentData.subjects.map((subject, index) => (
                <td
                  key={index}
                  className="border border-gray-800 dark:border-gray-300 p-2"
                >
                  {subject.credit}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border border-gray-800 dark:border-gray-300 p-2">
                GRADE
              </td>
              {studentData.subjects.map((subject, index) => (
                <td
                  key={index}
                  className="border border-gray-800 dark:border-gray-300 p-2"
                >
                  {subject.grade}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border border-gray-800 dark:border-gray-300 p-2">
                GRADE POINT
              </td>
              {studentData.subjects.map((subject, index) => (
                <td
                  key={index}
                  className="border border-gray-800 dark:border-gray-300 p-2"
                >
                  {subject.gradePoint}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border border-gray-800 dark:border-gray-300 p-2">
                QUALITY POINT
              </td>
              {studentData.subjects.map((subject, index) => (
                <td
                  key={index}
                  className="border border-gray-800 dark:border-gray-300 p-2"
                >
                  {subject.qualityPoint}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* Added Bottom Section to Printable Area */}
        <div className="flex justify-between mt-5 text-sm">
          <p>TOTAL GRADED CREDITS: {studentData.totalGradedCredits}</p>
          <p>TOTAL QUALITY POINTS: {studentData.totalQualityPoints}</p>
          <p>GPA: {studentData.gpa}</p>
          <p>CGPA: {studentData.cgpa}</p>
        </div>
        <p className="text-xs mt-2">
          * indicates number of additional attempts
        </p>
      </div>

      {/* Non-Printable Section (Buttons) */}
      <div className="non-printable">
        <div className="flex gap-3 mt-5 justify-center">
          <button
            onClick={handleExport}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export as PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Print Grade Card
          </button>
        </div>
      </div>

      {/* Print-Specific Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-section,
          .printable-section * {
            visibility: visible;
          }
          .printable-section {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            padding: 0;
          }
          .non-printable {
            display: none;
          }
          table,
          th,
          td {
            border-color: black !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GradeCard;
