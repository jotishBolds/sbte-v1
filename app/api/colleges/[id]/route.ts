// app/api/colleges/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/auth";

// Create a new PrismaClient instance
const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Ensure only SBTE_ADMIN can perform this operation
    if (!session || session.user?.role !== "SBTE_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;

    // Get all departments associated with this college
    const departments = await prisma.department.findMany({
      where: { collegeId: id },
      select: { id: true },
    });

    const departmentIds = departments.map((dept) => dept.id);

    // Break the operations into smaller transactions to prevent transaction timeout

    // 1. Handle Feedback records
    await prisma.feedback.deleteMany({
      where: {
        batchSubject: {
          batch: {
            program: {
              department: {
                collegeId: id,
              },
            },
          },
        },
      },
    });

    // 2. Delete MonthlyBatchSubjectAttendance
    await prisma.monthlyBatchSubjectAttendance.deleteMany({
      where: {
        monthlyBatchSubjectClasses: {
          batchSubject: {
            batch: {
              program: {
                department: {
                  collegeId: id,
                },
              },
            },
          },
        },
      },
    });

    // 3. Delete MonthlyBatchSubjectClasses
    await prisma.monthlyBatchSubjectClasses.deleteMany({
      where: {
        batchSubject: {
          batch: {
            program: {
              department: {
                collegeId: id,
              },
            },
          },
        },
      },
    });

    // 4. Delete ExamMarks
    await prisma.examMark.deleteMany({
      where: {
        batchSubject: {
          batch: {
            program: {
              department: {
                collegeId: id,
              },
            },
          },
        },
      },
    });

    // 5. Delete TeacherAssignedSubject
    await prisma.teacherAssignedSubject.deleteMany({
      where: {
        batchSubject: {
          batch: {
            program: {
              department: {
                collegeId: id,
              },
            },
          },
        },
      },
    });

    // 6. Delete BatchSubjects
    await prisma.batchSubject.deleteMany({
      where: {
        batch: {
          program: {
            department: {
              collegeId: id,
            },
          },
        },
      },
    });

    // 7. Delete StudentBatchExamFee
    // First, get all StudentBatchExamFee IDs
    const examFeeIds = await prisma.studentBatchExamFee.findMany({
      where: {
        studentBatch: {
          batch: {
            program: {
              department: {
                collegeId: id,
              },
            },
          },
        },
      },
      select: { id: true },
    });

    if (examFeeIds.length > 0) {
      const examFeeIdsList = examFeeIds.map((fee) => fee.id);
      // Delete the fee records
      await prisma.studentBatchExamFee.deleteMany({
        where: { id: { in: examFeeIdsList } },
      });
    }

    // 8. Delete BatchBaseExamFee
    await prisma.batchBaseExamFee.deleteMany({
      where: {
        batch: {
          program: {
            department: {
              collegeId: id,
            },
          },
        },
      },
    });

    // 9. Delete StudentBatch
    await prisma.studentBatch.deleteMany({
      where: {
        batch: {
          program: {
            department: {
              collegeId: id,
            },
          },
        },
      },
    });

    // 10. Delete Batches
    await prisma.batch.deleteMany({
      where: {
        program: {
          department: {
            collegeId: id,
          },
        },
      },
    });

    // 11. Delete FeePayments and Certificates for Students
    await prisma.feePayment.deleteMany({
      where: { student: { collegeId: id } },
    });

    await prisma.certificate.deleteMany({
      where: { student: { collegeId: id } },
    });

    // 12. Delete SemesterProgram
    await prisma.semesterProgram.deleteMany({
      where: {
        program: {
          department: {
            collegeId: id,
          },
        },
      },
    });

    // 13. Delete Programs
    await prisma.program.deleteMany({
      where: {
        department: {
          collegeId: id,
        },
      },
    });

    // 14. Delete HeadOfDepartment
    await prisma.headOfDepartment.deleteMany({
      where: { departmentId: { in: departmentIds } },
    });

    // 15. Delete Students
    await prisma.student.deleteMany({
      where: { collegeId: id },
    });

    // 16. Delete Teachers
    // First get teacher IDs
    const teachers = await prisma.teacher.findMany({
      where: {
        user: {
          collegeId: id,
        },
      },
      select: { id: true, userId: true },
    });

    // Delete teachers
    if (teachers.length > 0) {
      await prisma.teacher.deleteMany({
        where: { id: { in: teachers.map((t) => t.id) } },
      });
    }

    // 17. Delete FinanceManagers
    await prisma.financeManager.deleteMany({
      where: { collegeId: id },
    });

    // 18. Delete Alumnus related to this college's departments
    await prisma.alumnus.deleteMany({
      where: { departmentId: { in: departmentIds } },
    });

    // 19. Clean up Users associated with college
    await prisma.user.deleteMany({
      where: { collegeId: id },
    });

    // 20. Delete Departments
    await prisma.department.deleteMany({
      where: { collegeId: id },
    });

    // 21. Delete NotifiedCollege entries
    await prisma.notifiedCollege.deleteMany({
      where: { collegeId: id },
    });

    // 22. Delete other college-specific records - split into multiple operations
    await prisma.infrastructures.deleteMany({ where: { collegeId: id } });
    await prisma.eligibility.deleteMany({ where: { collegeId: id } });
    await prisma.schedules.deleteMany({ where: { collegeId: id } });
    await prisma.loadBalancingPdf.deleteMany({ where: { collegeId: id } });
    await prisma.examType.deleteMany({ where: { collegeId: id } });
    await prisma.subject.deleteMany({ where: { collegeId: id } });
    await prisma.subjectType.deleteMany({ where: { collegeId: id } });
    await prisma.certificateType.deleteMany({ where: { collegeId: id } });
    await prisma.programType.deleteMany({ where: { collegeId: id } });
    await prisma.academicYear.deleteMany({ where: { collegeId: id } });
    await prisma.admissionYear.deleteMany({ where: { collegeId: id } });
    await prisma.batchYear.deleteMany({ where: { collegeId: id } });
    await prisma.batchType.deleteMany({ where: { collegeId: id } });
    await prisma.semester.deleteMany({ where: { collegeId: id } });
    await prisma.designation.deleteMany({ where: { collegeId: id } });
    await prisma.category.deleteMany({ where: { collegeId: id } });

    // 23. Finally, delete the college
    const deletedCollege = await prisma.college.delete({
      where: { id },
    });

    // Success response
    return NextResponse.json({
      message: "College and all associated data deleted successfully",
      college: deletedCollege,
    });
  } catch (error) {
    console.error("Error deleting college and related data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  } finally {
    // Ensure the Prisma connection is properly disconnected to prevent connection leaks
    await prisma.$disconnect();
  }
}

// Keep the PUT method as is
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SBTE_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const data = await request.json();

    // Remove fields that shouldn't be updated
    const { id: _id, createdAt, updatedAt, ...updateData } = data;

    // Convert establishedOn to proper DateTime format
    if (updateData.establishedOn) {
      updateData.establishedOn = new Date(
        updateData.establishedOn
      ).toISOString();
    }

    const updatedCollege = await prisma.college.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedCollege);
  } catch (error) {
    console.error("Error updating college:", error);
    return NextResponse.json(
      { error: "Failed to update college" },
      { status: 500 }
    );
  } finally {
    // Ensure the Prisma connection is properly disconnected
    await prisma.$disconnect();
  }
}
