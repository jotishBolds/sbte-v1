import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/src/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: "SBTE_ADMIN",
        email: "admin@sbte.gov.in",
      },
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          message: "Admin already exists",
          user: { email: existingAdmin.email, role: existingAdmin.role },
        },
        { status: 200 }
      );
    }

    // Create default SBTE admin
    const defaultPassword = "SBTE@Admin123!";
    const hashedPassword = await hash(defaultPassword, 12);

    const newAdmin = await prisma.user.create({
      data: {
        id: nanoid(),
        username: "SBTE Admin",
        email: "admin@sbte.gov.in",
        password: hashedPassword,
        role: "SBTE_ADMIN",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create password history entry
    await prisma.passwordHistory.create({
      data: {
        userId: newAdmin.id,
        hashedPassword,
        createdAt: new Date(),
      },
    });

    const { password: _, ...adminWithoutPassword } = newAdmin;

    return NextResponse.json(
      {
        message: "Default SBTE admin created successfully",
        user: adminWithoutPassword,
        credentials: {
          email: "admin@sbte.gov.in",
          password: defaultPassword,
          note: "Please change this password after first login",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating default admin:", error);
    return NextResponse.json(
      { error: "Failed to create default admin" },
      { status: 500 }
    );
  }
}
