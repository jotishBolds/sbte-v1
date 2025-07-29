import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.role ||
      !["SBTE_ADMIN", "EDUCATION_DEPARTMENT"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const eventType = url.searchParams.get("eventType");
    const severity = url.searchParams.get("severity");
    const userId = url.searchParams.get("userId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (eventType)
      where.eventType = { contains: eventType, mode: "insensitive" };
    if (severity) where.severity = severity;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [securityEvents, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
      }),
      prisma.securityEvent.count({ where }),
    ]);

    return NextResponse.json({
      securityEvents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching security events:", error);
    return NextResponse.json(
      { error: "Failed to fetch security events" },
      { status: 500 }
    );
  }
}
