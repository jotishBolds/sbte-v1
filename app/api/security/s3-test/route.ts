// File: app/api/security/s3-test/route.ts
// API endpoint to test S3 security configuration

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { runS3SecurityTests } from "@/lib/s3-security-test";

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.role ||
      !["SBTE_ADMIN", "EDUCATION_DEPARTMENT"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Run S3 security tests
    const testResults = await runS3SecurityTests();

    // Calculate summary
    const passedCount = testResults.filter((r) => r.passed).length;
    const totalCount = testResults.length;
    const allPassed = passedCount === totalCount;

    return NextResponse.json({
      success: true,
      summary: {
        total: totalCount,
        passed: passedCount,
        failed: totalCount - passedCount,
        allPassed,
        securityStatus: allPassed ? "SECURE" : "NEEDS_ATTENTION",
      },
      tests: testResults,
      timestamp: new Date().toISOString(),
      recommendations: allPassed
        ? ["✅ S3 bucket is properly secured"]
        : [
            "❌ Please review failed tests",
            "🔒 Ensure bucket blocks public access",
            "🔑 Use signed URLs for file access",
            "📋 Review bucket policies and ACLs",
          ],
    });
  } catch (error) {
    console.error("S3 security test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to run S3 security tests",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed. Use GET to run tests." },
    { status: 405 }
  );
}
