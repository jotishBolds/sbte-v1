import { Buffer } from "buffer";

// Magic numbers/file signatures for common file types
const FILE_SIGNATURES = {
  PDF: [0x25, 0x50, 0x44, 0x46], // %PDF
  JPEG: [0xff, 0xd8, 0xff],
  PNG: [0x89, 0x50, 0x4e, 0x47],
  GIF: [0x47, 0x49, 0x46, 0x38], // GIF8
  DOC: [0xd0, 0xcf, 0x11, 0xe0],
  DOCX: [0x50, 0x4b, 0x03, 0x04],
} as const;

// Allowed MIME types and their corresponding extensions
export const ALLOWED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
} as const;

// Function to check file magic numbers
export async function validateFileSignature(
  file: File,
  expectedType: keyof typeof FILE_SIGNATURES
): Promise<boolean> {
  const buffer = Buffer.from(await file.slice(0, 4).arrayBuffer());
  const signature = Array.from(buffer);
  const expectedSignature = FILE_SIGNATURES[expectedType];

  return expectedSignature.every((byte, index) => byte === signature[index]);
}

// Function to validate file extension
export function validateFileExtension(
  filename: string,
  mimeType: string
): boolean {
  const extension = filename.toLowerCase().split(".").pop();
  const allowedExtensions =
    ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];

  return allowedExtensions?.some(
    (ext) => ext.toLowerCase() === `.${extension}`
  );
}

// Function to validate MIME type
export function validateMimeType(mimeType: string): boolean {
  return mimeType in ALLOWED_FILE_TYPES;
}

// Enhanced CDR implementation for PDF and image files
export async function performCDR(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  // PDF-specific sanitization
  if (file.type === "application/pdf") {
    // First, verify it's a valid PDF by checking the header
    const isPDF = buffer.slice(0, 4).toString("hex") === "25504446";
    if (!isPDF) {
      throw new Error("Invalid PDF format");
    }

    // Convert to string for pattern matching, but maintain original structure
    const content = buffer.toString("binary"); // Look for potentially malicious patterns
    const maliciousPatterns = [
      /\/JS\s*\w*>>/g, // JavaScript actions
      /\/JavaScript/g, // JavaScript code
      /\/Launch/g, // Launch actions
      /\/SubmitForm/g, // Form submissions
      /\/RichMedia/g, // Rich media that might contain malicious content
      /\/ObjStm[^\0]*?endobj/g, // Compressed object streams that might hide malicious content
      /\/OpenAction[^\0]*?R/g, // Auto-execute actions
      /\/AA\s*<<[^\0]*?>>/g, // Additional actions
    ]; // Check for proper PDF structure
    if (!content.includes("%%EOF")) {
      throw new Error("Invalid PDF structure: Missing EOF marker");
    }

    // Only remove identified malicious content
    let sanitizedContent = content;
    let hasRemovedContent = false;

    for (const pattern of maliciousPatterns) {
      if (pattern.test(sanitizedContent)) {
        hasRemovedContent = true;
        // Replace malicious pattern with a benign PDF comment
        sanitizedContent = sanitizedContent.replace(pattern, "%SafeRemoved ");
      }
    }

    // Additional PDF structure validation
    if (hasRemovedContent) {
      // Ensure we haven't broken the PDF structure
      const basicPdfChecks = [
        content.includes("%PDF-"), // Has PDF header
        content.includes("%%EOF"), // Has EOF marker
        sanitizedContent.match(/\/Type\s*\/Page/g), // Has at least one page
        sanitizedContent.match(/\/Root\s+\d+\s+\d+\s+R/), // Has root object
      ];

      if (!basicPdfChecks.every((check) => check)) {
        // If we've broken the PDF structure, return the original buffer
        // but log a warning
        console.warn(
          "PDF sanitization resulted in invalid structure, using original content"
        );
        return buffer;
      }
    }

    // Preserve PDF structure by maintaining original byte content
    return Buffer.from(sanitizedContent, "binary");
  }

  // Image-specific sanitization
  if (file.type.startsWith("image/")) {
    // Validate image header
    const signature = buffer.slice(0, 8);

    // Check for valid image signatures
    const isJPEG = signature[0] === 0xff && signature[1] === 0xd8;
    const isPNG =
      signature[0] === 0x89 &&
      signature[1] === 0x50 &&
      signature[2] === 0x4e &&
      signature[3] === 0x47;
    const isGIF =
      signature[0] === 0x47 && signature[1] === 0x49 && signature[2] === 0x46;

    if (!isJPEG && !isPNG && !isGIF) {
      throw new Error("Invalid image format");
    }

    // For images, we'll strip metadata and any embedded content
    // This is a simplified example - in production, you might want to use
    // image processing libraries for more thorough sanitization
    if (isJPEG) {
      // Remove EXIF data (simplified)
      const app1Marker = Buffer.from([0xff, 0xe1]);
      let pos = 2;
      while (pos < buffer.length - 1) {
        if (buffer[pos] === 0xff && buffer[pos + 1] === 0xe1) {
          const length = buffer.readUInt16BE(pos + 2);
          buffer.fill(0, pos, pos + 2 + length);
          pos += 2 + length;
        } else {
          pos++;
        }
      }
    }

    return buffer;
  }

  // For other file types, implement specific sanitization as needed
  return buffer;
}

// Main file validation and sanitization function
export async function validateAndSanitizeFile(
  file: File,
  options: {
    maxSizeBytes?: number;
    allowedTypes?: Array<keyof typeof ALLOWED_FILE_TYPES>;
  } = {}
): Promise<{ isValid: boolean; sanitizedBuffer?: Buffer; error?: string }> {
  try {
    const {
      maxSizeBytes = 10 * 1024 * 1024,
      allowedTypes = ["application/pdf"],
    } = options;

    // Check file size
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size must be less than ${maxSizeBytes / (1024 * 1024)}MB`,
      };
    }

    // Validate MIME type
    if (
      !validateMimeType(file.type) ||
      !allowedTypes.includes(file.type as any)
    ) {
      return { isValid: false, error: "Invalid file type" };
    }

    // Validate file extension
    if (!validateFileExtension(file.name, file.type)) {
      return {
        isValid: false,
        error: "File extension does not match the content type",
      };
    }

    // Validate file signature
    const fileType =
      file.type === "application/pdf"
        ? "PDF"
        : file.type === "image/jpeg"
        ? "JPEG"
        : file.type === "image/png"
        ? "PNG"
        : file.type === "application/msword"
        ? "DOC"
        : "DOCX";

    const isValidSignature = await validateFileSignature(file, fileType);
    if (!isValidSignature) {
      return {
        isValid: false,
        error: "File content does not match the expected format",
      };
    }

    // Perform CDR
    const sanitizedBuffer = await performCDR(file);

    return { isValid: true, sanitizedBuffer };
  } catch (error) {
    return { isValid: false, error: "File validation failed" };
  }
}
