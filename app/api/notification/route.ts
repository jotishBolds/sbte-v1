//File : /api/notification/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { z } from "zod";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// GET API to retrieve notifications for SBTE_ADMIN or COLLEGE_SUPER_ADMIN
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user?.role;
    const userCollegeId = session.user?.collegeId;

    // Check if the role is valid
    if (userRole !== "SBTE_ADMIN" && userRole !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch notifications based on the role
    let notifications;
    if (userRole === "SBTE_ADMIN") {
      // SBTE Admin can view all notifications
      notifications = await prisma.notification.findMany({
        include: { notifiedColleges: true },
      });
    } else if (userRole === "COLLEGE_SUPER_ADMIN") {
      // College Super Admin can view notifications for their college
      notifications = await prisma.notification.findMany({
        where: {
          notifiedColleges: {
            some: {
              collegeId: userCollegeId,
            },
          },
        },
        include: { notifiedColleges: true },
      });
    }

    // Return a message if no notifications are found
    if (!notifications || notifications.length === 0) {
      return NextResponse.json(
        { message: "No notifications found." },
        { status: 200 }
      );
    }
    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
