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
    const action = url.searchParams.get("action");
    const userId = url.searchParams.get("userId");
    const status = url.searchParams.get("status");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (action) where.action = { contains: action, mode: "insensitive" };
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      auditLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
