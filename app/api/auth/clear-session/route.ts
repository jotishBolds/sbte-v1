import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clear user session token
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        sessionToken: null,
        sessionCreatedAt: null,
        sessionExpiresAt: null,
        sessionIpAddress: null,
        sessionUserAgent: null,
      },
    });

    return NextResponse.json({
      message: "Sessions cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
