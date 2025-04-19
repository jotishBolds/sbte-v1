"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Subject {
  name: string;
  credit: number;
  grade: string;
  gradePoint: number;
  qualityPoint: number;
  internalMarks?: number;
  externalMarks?: number;
  classType: "THEORY" | "PRACTICAL" | "BOTH"; // Added class type
}

interface GradeCardData {
  id?: string;
  name: string;
  rollNo: string;
  gradeCardNo: string;
  semester: string;
  subjects: Subject[];
  totalGradedCredits: number;
  totalQualityPoints: number;
  gpa: number;
  cgpa: number;
  programName?: string;
  collegeName?: string;
  departmentName?: string;
}

interface GradeCardModalProps {
  studentId: string;
  studentName: string;
}

const GradeCardModal: React.FC<GradeCardModalProps> = ({
  studentId,
  studentName,
}) => {
  const [open, setOpen] = useState(false);
  const [gradeCards, setGradeCards] = useState<GradeCardData[]>([]);
  const [selectedGradeCardId, setSelectedGradeCardId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGradeCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/gradeCard/grade-card?studentId=${studentId}`
      );
      if (!response.ok) throw new Error("Failed to fetch grade cards");
      const data = await response.json();
      setGradeCards(data);

      // Select the most recent grade card by default (assuming they're returned in order)
      if (data && data.length > 0) {
        setSelectedGradeCardId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && gradeCards.length === 0) {
      fetchGradeCards();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Get the currently selected grade card
  const selectedGradeCard = gradeCards.find(
    (card) => card.id === selectedGradeCardId
  );

  // Function to filter and sort subjects by class type
  const getTheoryAndPracticalSubjects = (subjects: Subject[]) => {
    const theorySubjects = subjects.filter(
      (subject) =>
        subject.classType === "THEORY" || subject.classType === "BOTH"
    );

    const practicalSubjects = subjects.filter(
      (subject) =>
        subject.classType === "PRACTICAL" || subject.classType === "BOTH"
    );

    // If a subject is "BOTH", it appears in both arrays
    // Make sure we have subjects for rendering
    return {
      theorySubjects: theorySubjects.length > 0 ? theorySubjects : [],
      practicalSubjects: practicalSubjects.length > 0 ? practicalSubjects : [],
    };
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">View Grade Cards</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle>{studentName}&apos;s Grade Card</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && gradeCards.length === 0 && !error && (
          <Alert>
            <AlertTitle>No Grade Cards</AlertTitle>
            <AlertDescription>
              No grade cards are available for this student.
            </AlertDescription>
          </Alert>
        )}

        {gradeCards.length > 0 && !loading && (
          <div className="font-sans">
            {/* Grade Card Selection - Hidden when printing */}
            <div className="mb-4 print:hidden">
              <label className="text-sm font-medium block mb-2">
                Select Semester Grade Card:
              </label>
              <Select
                value={selectedGradeCardId}
                onValueChange={setSelectedGradeCardId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a semester" />
                </SelectTrigger>
                <SelectContent>
                  {gradeCards.map((card) => (
                    <SelectItem key={card.id} value={card.id || ""}>
                      {card.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Printable Section */}
            {selectedGradeCard && (
              <div className="printable-section">
                <h2 className="text-center text-lg font-bold mb-2">
                  INSTITUTE:{" "}
                  {selectedGradeCard.collegeName ||
                    "CENTRE FOR COMPUTERS AND COMMUNICATION TECHNOLOGY"}
                </h2>
                <h3 className="text-center text-base underline mb-5">
                  {selectedGradeCard.programName ||
                    "DIPLOMA IN COMPUTER SCIENCE AND TECHNOLOGY (AICTE APPROVED)"}
                </h3>
                <div className="flex justify-between mb-5">
                  <div>
                    <p className="text-sm">NAME: {selectedGradeCard.name}</p>
                    <p className="text-sm">
                      ROLL NO: {selectedGradeCard.rollNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      GRADE CARD NO: {selectedGradeCard.gradeCardNo}
                    </p>
                    <p className="text-sm">
                      SEMESTER: {selectedGradeCard.semester}
                    </p>
                  </div>
                </div>

                {/* Split subjects into theory and practical groups */}
                {selectedGradeCard.subjects.length > 0 &&
                  (() => {
                    const { theorySubjects, practicalSubjects } =
                      getTheoryAndPracticalSubjects(selectedGradeCard.subjects);

                    return (
                      <table className="w-full border-collapse border border-gray-800 dark:border-gray-300 text-center text-xs">
                        <thead>
                          <tr>
                            <th
                              rowSpan={2}
                              className="border border-gray-800 dark:border-gray-300  font-bold w-[150px] "
                            >
                              SUBJECTS
                            </th>
                            {theorySubjects.length > 0 && (
                              <th
                                colSpan={theorySubjects.length}
                                className="border border-gray-800 dark:border-gray-300 p-2 font-bold"
                              >
                                THEORY
                              </th>
                            )}
                            {practicalSubjects.length > 0 && (
                              <th
                                colSpan={practicalSubjects.length}
                                className="border border-gray-800 dark:border-gray-300 p-2 font-bold"
                              >
                                PRACTICAL
                              </th>
                            )}
                          </tr>
                          <tr>
                            {/* Theory Subject Headers */}
                            {theorySubjects.map((subject, index) => (
                              <th
                                key={`theory-${index}`}
                                className="border border-gray-800 dark:border-gray-300 p-2 font-bold w-[80px]"
                              >
                                {subject.name}
                              </th>
                            ))}

                            {/* Practical Subject Headers */}
                            {practicalSubjects.map((subject, index) => (
                              <th
                                key={`practical-${index}`}
                                className="border border-gray-800 dark:border-gray-300 p-2 font-bold w-[80px]"
                              >
                                {subject.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Credits Row */}
                          <tr>
                            <td className="border border-gray-800 dark:border-gray-300 p-2">
                              CREDIT
                            </td>
                            {theorySubjects.map((subject, index) => (
                              <td
                                key={`theory-credit-${index}`}
                                className="border border-gray-800 dark:border-gray-300 p-2"
                              >
                                {subject.credit}
                              </td>
                            ))}
                            {practicalSubjects.map((subject, index) => (
                              <td
                                key={`practical-credit-${index}`}
                                className="border border-gray-800 dark:border-gray-300 p-2"
                              >
                                {subject.credit}
                              </td>
                            ))}
                          </tr>

                          {/* Grade Row */}
                          <tr>
                            <td className="border border-gray-800 dark:border-gray-300 p-2">
                              GRADE
                            </td>
                            {theorySubjects.map((subject, index) => (
                              <td
                                key={`theory-grade-${index}`}
                                className="border border-gray-800 dark:border-gray-300 p-2"
                              >
                                {subject.grade}
                              </td>
                            ))}
                            {practicalSubjects.map((subject, index) => (
                              <td
                                key={`practical-grade-${index}`}
                                className="border border-gray-800 dark:border-gray-300 p-2"
                              >
                                {subject.grade}
                              </td>
                            ))}
                          </tr>

                          {/* Grade Point Row */}
                          <tr>
                            <td className="border border-gray-800 dark:border-gray-300 p-2">
                              GRADE POINT
                            </td>
                            {theorySubjects.map((subject, index) => (
                              <td
                                key={`theory-gradepoint-${index}`}
                                className="border border-gray-800 dark:border-gray-300 p-2"
                              >
                                {subject.gradePoint}
                              </td>
                            ))}
                            {practicalSubjects.map((subject, index) => (
                              <td
                                key={`practical-gradepoint-${index}`}
                                className="border border-gray-800 dark:border-gray-300 p-2"
                              >
                                {subject.gradePoint}
                              </td>
                            ))}
                          </tr>

                          {/* Quality Point Row */}
                          <tr>
                            <td className="border border-gray-800 dark:border-gray-300 p-2">
                              QUALITY POINT
                            </td>
                            {theorySubjects.map((subject, index) => (
                              <td
                                key={`theory-qualitypoint-${index}`}
                                className="border border-gray-800 dark:border-gray-300 p-2"
                              >
                                {subject.qualityPoint}
                              </td>
                            ))}
                            {practicalSubjects.map((subject, index) => (
                              <td
                                key={`practical-qualitypoint-${index}`}
                                className="border border-gray-800 dark:border-gray-300 p-2"
                              >
                                {subject.qualityPoint}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    );
                  })()}

                <table className="w-full border-collapse border border-gray-800 dark:border-gray-300 text-xs mt-0">
                  <tbody>
                    <tr>
                      <td className="border-none p-2 text-left">
                        TOTAL GRADED CREDITS:{" "}
                        {selectedGradeCard.totalGradedCredits}
                      </td>
                      <td className="border-none p-2 text-center">
                        TOTAL QUALITY POINTS:{" "}
                        {selectedGradeCard.totalQualityPoints}
                      </td>
                      <td className="border-none p-2 text-center">
                        GPA: {selectedGradeCard.gpa.toFixed(2)}
                      </td>
                      <td className="border-none p-2 text-center">
                        CGPA: {selectedGradeCard.cgpa.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-xs mt-2">
                  * indicates number of additional attempts
                </p>
              </div>
            )}

            <div className="flex justify-center mt-4 print:hidden">
              <Button onClick={handlePrint} className="mr-2">
                Print Grade Card
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Print-Specific Styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything except printable section */
          body * {
            visibility: hidden;
          }

          /* Show only the printable content */
          .printable-section,
          .printable-section * {
            visibility: visible;
          }

          /* Position the printable content */
          .printable-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }

          /* Ensure dialog content is visible */
          [role="dialog"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            overflow: visible;
            box-shadow: none;
            border: none;
            background: white;
          }

          /* Fix table borders */
          table,
          th,
          td {
            border-color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Remove unnecessary dialog styling */
          [role="dialog"] {
            transform: none !important;
            max-width: 100% !important;
            max-height: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </Dialog>
  );
};

export default GradeCardModal;
