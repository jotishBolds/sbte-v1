//File : /api/razorpay/studentPrefillData/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

// GET Student Details for Razorpay Prefill
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Fetch the student details based on the ID
  try {
    const student = await prisma.student.findUnique({
      where: { userId: userId },
      include: {
        user: true, // To fetch email
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Return the details needed for Razorpay prefill
    const prefillDetails = {
      name: student.name,
      email: student.user.email,
      contact: student.phoneNo,
    };

    return NextResponse.json(
      {
        success: true,
        name: student.name,
        email: student.user.email,
        contact: student.phoneNo,
      },
      { status: 200 }
    );

    // return NextResponse.json(prefillDetails, {status: 200 });
  } catch (error) {
    console.error("Error fetching student for Razorpay prefill:", error);
    return NextResponse.json(
      {
        message: "Error fetching student details",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
