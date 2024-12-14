//File : /api/colleges/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import { authOptions } from "../auth/[...nextauth]/auth";

const prisma = new PrismaClient();

interface CollegeCreationData {
  name: string;
  address: string;
  establishedOn: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  IFSCCode?: string;
  AccountNo?: string;
  AccountHolderName?: string;
  UPIID?: string;
  logo?: string;
  abbreviation?: string;
  username?: string;
  superAdminEmail: string;
  superAdminPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user?.role !== "SBTE_ADMIN" &&
        session.user?.role !== "COLLEGE_SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data: CollegeCreationData = await request.json();

    // Validate required fields
    const missingFields = [];
    if (!data.name) missingFields.push("name");
    if (!data.address) missingFields.push("address");
    if (!data.establishedOn) missingFields.push("establishedOn");
    if (!data.username) missingFields.push("username");
    if (!data.superAdminEmail) missingFields.push("superAdminEmail");
    if (!data.superAdminPassword) missingFields.push("superAdminPassword");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate the establishedOn date
    if (isNaN(new Date(data.establishedOn).getTime())) {
      return NextResponse.json(
        { error: "Invalid date format for 'establishedOn'" },
        { status: 400 }
      );
    }

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.superAdminEmail }, { username: data.username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username or email already in use" },
        { status: 409 }
      );
    }

    // Create new college and super admin user in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create the college with all fields including banking details, logo, and abbreviation
      const newCollege = await prisma.college.create({
        data: {
          name: data.name,
          address: data.address,
          establishedOn: new Date(data.establishedOn),
          websiteUrl: data.websiteUrl,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          IFSCCode: data.IFSCCode,
          AccountNo: data.AccountNo,
          AccountHolderName: data.AccountHolderName,
          UPIID: data.UPIID,
          logo: data.logo,
          abbreviation: data.abbreviation,
        },
      });

      // Hash the password
      const hashedPassword = await bcrypt.hash(data.superAdminPassword, 10);

      // Create the super admin user
      const newUser = await prisma.user.create({
        data: {
          username: data.username,
          email: data.superAdminEmail,
          password: hashedPassword,
          role: "COLLEGE_SUPER_ADMIN",
          college: {
            connect: {
              id: newCollege.id,
            },
          },
        },
      });

      return {
        college: newCollege,
        user: { id: newUser.id, email: newUser.email, role: newUser.role },
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating college and super admin:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user?.role !== "SBTE_ADMIN" &&
        session.user.role !== "COLLEGE_SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const colleges = await prisma.college.findMany();
    return NextResponse.json(colleges);
  } catch (error) {
    console.error("Error fetching colleges:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
