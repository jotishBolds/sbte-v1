import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { hash } from "bcrypt";
import prisma from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      (session.user.role !== "COLLEGE_SUPER_ADMIN" &&
        session.user.role !== "ADM")
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.collegeId) {
      return NextResponse.json(
        { message: "College not associated with admin" },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        role: {
          in: [
            "HOD",
            "TEACHER",
            "FINANCE_MANAGER",
            "STUDENT",
            "ALUMNUS",
            "ADM",
          ],
        },
        collegeId: session.user.collegeId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user ||
    (session.user.role !== "COLLEGE_SUPER_ADMIN" && session.user.role !== "ADM")
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.collegeId) {
    return NextResponse.json(
      { message: "College not associated with admin" },
      { status: 400 }
    );
  }

  try {
    const { username, email, password, role, departmentId } =
      await request.json();

    const hashedPassword = await hash(password, 10);

    let userData: any = {
      username,
      email,
      password: hashedPassword,
      role,
      collegeId: session.user.collegeId,
    };

    if (departmentId) {
      userData.departmentId = departmentId;
    }

    const user = await prisma.user.create({
      data: userData,
    });

    // Create role-specific records
    switch (role) {
      case "HOD":
        // Check if a HeadOfDepartment already exists for the given departmentId
        const existingHOD = await prisma.headOfDepartment.findUnique({
          where: { departmentId: departmentId },
        });

        if (existingHOD) {
          await prisma.user.delete({ where: { id: user.id } });
          return NextResponse.json(
            {
              message:
                "A Head of Department already exists for this department",
            },
            { status: 400 }
          );
        }

        await prisma.headOfDepartment.create({
          data: {
            userId: user.id,
            departmentId: departmentId,
            name: username,
            phoneNo: "",
            address: "",
            qualification: "",
            experience: "",
          },
        });
        break;

      case "TEACHER":
        await prisma.teacher.create({
          data: {
            userId: user.id,
            name: username,
            phoneNo: null,
            address: null,
            qualification: null,
            experience: null,
            hasResigned: false,
            maritalStatus: null,
            joiningDate: null,
            gender: null,
            religion: null,
            caste: null,
            isLocalResident: false,
            isDifferentlyAbled: false,
          },
        });
        break;

      case "FINANCE_MANAGER":
        await prisma.financeManager.create({
          data: {
            userId: user.id,
            name: username,
            phoneNo: "",
            address: "",
            collegeId: session.user.collegeId,
          },
        });
        break;

      case "STUDENT":
        // Get the latest academic year, batch year, and admission year
        const academicYear = await prisma.academicYear.findFirst({
          where: { collegeId: session.user.collegeId },
          orderBy: { startDate: "desc" },
        });

        const batchYear = await prisma.batchYear.findFirst({
          where: { collegeId: session.user.collegeId },
          orderBy: { year: "desc" },
        });

        const admissionYear = await prisma.admissionYear.findFirst({
          where: { collegeId: session.user.collegeId },
          orderBy: { year: "desc" },
        });

        const semester = await prisma.semester.findFirst({
          where: { collegeId: session.user.collegeId },
        });

        // Find a program for the department
        const program = await prisma.program.findFirst({
          where: { departmentId: departmentId },
        });

        if (
          !academicYear ||
          !batchYear ||
          !admissionYear ||
          !semester ||
          !program
        ) {
          await prisma.user.delete({ where: { id: user.id } });
          return NextResponse.json(
            { message: "Required academic data not found" },
            { status: 400 }
          );
        }

        await prisma.student.create({
          data: {
            userId: user.id,
            enrollmentNo: `ENR${Math.floor(Math.random() * 10000)}`, // Generate a random enrollment number
            name: username,
            dob: new Date(), // This should be collected from the form
            personalEmail: email,
            phoneNo: "",
            studentAvatar: null,
            abcId: null,
            lastCollegeAttended: null,
            batchYearId: batchYear.id,
            admissionYearId: admissionYear.id,
            academicYearId: academicYear.id,
            termId: semester.id,
            gender: "NOT_SPECIFIED", // This should be collected from the form
            isLocalStudent: false,
            isDifferentlyAbled: false,
            motherName: "",
            fatherName: "",
            bloodGroup: null,
            religion: null,
            nationality: null,
            caste: null,
            admissionCategory: null,
            resident: null,
            admissionDate: new Date(),
            graduateDate: null,
            permanentAddress: "",
            permanentCountry: "",
            permanentState: "",
            permanentCity: "",
            permanentPincode: "",
            guardianName: "",
            guardianGender: "",
            guardianEmail: null,
            guardianMobileNo: "",
            guardianRelation: "",
            programId: program.id,
            collegeId: session.user.collegeId,
            departmentId: departmentId,
          },
        });
        break;

      case "ALUMNUS":
        // Get the batch year and admission year for alumnus
        const alumnusBatchYear = await prisma.batchYear.findFirst({
          where: { collegeId: session.user.collegeId },
          orderBy: { year: "desc" },
        });

        const alumnusAdmissionYear = await prisma.admissionYear.findFirst({
          where: { collegeId: session.user.collegeId },
          orderBy: { year: "desc" },
        });

        const alumnusProgram = await prisma.program.findFirst({
          where: { departmentId: departmentId },
        });

        if (!alumnusBatchYear || !alumnusAdmissionYear || !alumnusProgram) {
          await prisma.user.delete({ where: { id: user.id } });
          return NextResponse.json(
            { message: "Required academic data not found for alumnus" },
            { status: 400 }
          );
        }

        await prisma.alumnus.create({
          data: {
            userId: user.id,
            name: username,
            phoneNo: null,
            dateOfBirth: null,
            address: null,
            departmentId: departmentId,
            programId: alumnusProgram.id,
            batchYearId: alumnusBatchYear.id,
            admissionYearId: alumnusAdmissionYear.id,
            graduationYear: new Date().getFullYear(),
            gpa: null,
            jobStatus: null,
            currentEmployer: null,
            currentPosition: null,
            industry: null,
            linkedInProfile: null,
            achievements: null,
            verified: false,
          },
        });
        break;
    }

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user", error: (error as Error).message },
      { status: 500 }
    );
  }
}
