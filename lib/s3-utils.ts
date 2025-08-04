import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Validate environment variables
function validateEnvVariables() {
  const requiredVars = [
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_BUCKET_NAME",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}

// Configure AWS S3 client
export const createS3Client = () => {
  try {
    validateEnvVariables();

    return new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  } catch (error) {
    console.error("S3 Client Configuration Error:", error);
    throw error;
  }
};

// Generate a signed URL for file upload (valid for 1 hour)
export async function generateSignedUploadUrl(
  key: string,
  contentType: string
) {
  const s3Client = createS3Client();
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

// Generate a signed URL for file download (valid for 1 hour)
export async function generateSignedDownloadUrl(key: string) {
  const s3Client = createS3Client();
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

// Delete a file from S3
export async function deleteFileFromS3(key: string) {
  const s3Client = createS3Client();
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  });
  await s3Client.send(command);
}

// Upload a file to S3 and return the key (SECURE - Private by default)
export async function uploadFileToS3(
  file: Buffer,
  key: string,
  contentType: string
) {
  const s3Client = createS3Client();
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType,
    // SECURITY FIX: Removed ACL to make files private by default
    // Files will be accessed via signed URLs only
  });
  await s3Client.send(command);
  return key;
}

// Extract S3 key from URL
export function extractS3KeyFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Decode the pathname to handle URL-encoded characters like %20 (spaces)
    return decodeURIComponent(urlObj.pathname.substring(1)); // Remove leading slash and decode
  } catch (error) {
    // If URL parsing fails, assume the value is already a key
    return url;
  }
}
