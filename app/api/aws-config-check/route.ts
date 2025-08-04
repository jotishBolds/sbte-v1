import { NextResponse } from "next/server";

export async function GET() {
  // Check AWS configuration
  const awsConfig = {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ? "✓ Set" : "✗ Missing",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? "✓ Set" : "✗ Missing",
    bucketName: process.env.AWS_BUCKET_NAME ? "✓ Set" : "✗ Missing",
  };

  const isConfigComplete =
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_BUCKET_NAME;

  return NextResponse.json({
    status: isConfigComplete
      ? "✅ AWS Configuration Complete"
      : "❌ AWS Configuration Incomplete",
    config: awsConfig,
    message: isConfigComplete
      ? "All AWS credentials are properly configured. PDF uploads to S3 should work."
      : "AWS credentials are missing. Please set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_BUCKET_NAME in your .env file.",
  });
}
