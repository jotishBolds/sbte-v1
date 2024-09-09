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
        // Check if a Teacher already exists for the given userId
        const existingTeacher = await prisma.teacher.findUnique({
          where: { userId: user.id },
        });

        if (existingTeacher) {
          return NextResponse.json(
            { message: "A Teacher already exists for this user" },
            { status: 400 }
          );
        }

        await prisma.teacher.create({
          data: {
            userId: user.id,
            name: username,
            phoneNo: "",
            address: "",
            qualification: "",
            designation: "",
            experience: "",
          },
        });
        break;
      case "FINANCE_MANAGER":
        // Check if a Finance Manager already exists for the given userId
        const existingFinanceManager = await prisma.financeManager.findUnique({
          where: { userId: user.id },
        });

        if (existingFinanceManager) {
          return NextResponse.json(
            { message: "A Finance Manager already exists for this user" },
            { status: 400 }
          );
        }

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
        // Check if a Student already exists for the given userId
        const existingStudent = await prisma.student.findUnique({
          where: { userId: user.id },
        });

        if (existingStudent) {
          return NextResponse.json(
            { message: "A Student already exists for this user" },
            { status: 400 }
          );
        }

        await prisma.student.create({
          data: {
            userId: user.id,
            enrollmentNo: "", // This should be generated or provided
            admissionYear: new Date(),
            name: username,
            phoneNo: "",
            address: "",
            father_name: "",
            mother_name: "",
            dob: new Date(), // This should be collected separately
            collegeId: session.user.collegeId,
            departmentId: departmentId,
          },
        });
        break;
      case "ALUMNUS":
        // Check if an Alumnus already exists for the given userId
        const existingAlumnus = await prisma.alumnus.findUnique({
          where: { userId: user.id },
        });

        if (existingAlumnus) {
          return NextResponse.json(
            { message: "An Alumnus already exists for this user" },
            { status: 400 }
          );
        }

        await prisma.alumnus.create({
          data: {
            userId: user.id,
            name: username,
            departmentId: departmentId,
            batchYear: new Date().getFullYear(),
            graduationYear: new Date().getFullYear(),
            jobStatus: "",
            phoneNo: "",
            dateOfBirth: null,
            address: "",
            gpa: null,
            currentEmployer: null,
            currentPosition: null,
            industry: null,
            linkedInProfile: null,
            achievements: null,
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
