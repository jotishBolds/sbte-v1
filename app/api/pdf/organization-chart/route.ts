import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET(request: NextRequest) {
  try {
    // Read the PDF file from the public directory
    const pdfPath = join(process.cwd(), "public", "Organization-Chart.pdf");
    const pdfBuffer = readFileSync(pdfPath);

    // Return the PDF with proper headers
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=Organization-Chart.pdf",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error serving PDF:", error);
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }
}
