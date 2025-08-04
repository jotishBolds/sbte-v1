import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user?.role;
    const userCollegeId = session.user?.collegeId;

    if (userRole !== "SBTE_ADMIN" && userRole !== "COLLEGE_SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let notifications;
    if (userRole === "SBTE_ADMIN") {
      notifications = await prisma.notification.findMany({
        include: { notifiedColleges: true },
      });
    } else if (userRole === "COLLEGE_SUPER_ADMIN" && userCollegeId) {
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

    if (!notifications || notifications.length === 0) {
      // Return an empty array instead of a message object
      return NextResponse.json([], { status: 200 });
    }

    // Transform response to hide S3 URLs for security
    const safeNotifications = notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      notifiedColleges: notification.notifiedColleges,
      // pdfPath is intentionally omitted for security - use download API instead
    }));

    return NextResponse.json(safeNotifications, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
