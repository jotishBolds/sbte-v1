import { z } from "zod";

// Comprehensive input validation schemas and utilities

// Common validation patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[0-9+\-\s()]{10,15}$/;
const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9\s]+$/;
const NAME_REGEX = /^[a-zA-Z\s\.'-]{1,100}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/;

// Input length restrictions
export const INPUT_LIMITS = {
  USERNAME: { min: 3, max: 50 },
  EMAIL: { min: 5, max: 100 },
  NAME: { min: 1, max: 100 },
  PHONE: { min: 10, max: 15 },
  ADDRESS: { min: 10, max: 500 },
  DESCRIPTION: { min: 1, max: 1000 },
  TITLE: { min: 1, max: 200 },
  PASSWORD: { min: 8, max: 128 },
  OTP: { min: 4, max: 8 },
  SEARCH_QUERY: { min: 1, max: 100 },
  COMMENT: { min: 1, max: 500 },
  URL: { min: 10, max: 2000 },
  FILE_NAME: { min: 1, max: 255 },
};

// Base validation schemas
export const baseSchemas = {
  email: z
    .string()
    .min(INPUT_LIMITS.EMAIL.min, "Email is too short")
    .max(INPUT_LIMITS.EMAIL.max, "Email is too long")
    .regex(EMAIL_REGEX, "Invalid email format")
    .trim()
    .toLowerCase(),

  username: z
    .string()
    .min(INPUT_LIMITS.USERNAME.min, "Username is too short")
    .max(INPUT_LIMITS.USERNAME.max, "Username is too long")
    .regex(
      ALPHANUMERIC_REGEX,
      "Username can only contain letters, numbers, and spaces"
    )
    .trim(),

  name: z
    .string()
    .min(INPUT_LIMITS.NAME.min, "Name is required")
    .max(INPUT_LIMITS.NAME.max, "Name is too long")
    .regex(NAME_REGEX, "Name contains invalid characters")
    .trim(),

  phone: z
    .string()
    .min(INPUT_LIMITS.PHONE.min, "Phone number is too short")
    .max(INPUT_LIMITS.PHONE.max, "Phone number is too long")
    .regex(PHONE_REGEX, "Invalid phone number format")
    .trim(),

  password: z
    .string()
    .min(INPUT_LIMITS.PASSWORD.min, "Password must be at least 8 characters")
    .max(INPUT_LIMITS.PASSWORD.max, "Password is too long")
    .regex(
      PASSWORD_REGEX,
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
    ),

  address: z
    .string()
    .min(INPUT_LIMITS.ADDRESS.min, "Address is too short")
    .max(INPUT_LIMITS.ADDRESS.max, "Address is too long")
    .trim(),

  description: z
    .string()
    .min(INPUT_LIMITS.DESCRIPTION.min, "Description is required")
    .max(INPUT_LIMITS.DESCRIPTION.max, "Description is too long")
    .trim(),

  title: z
    .string()
    .min(INPUT_LIMITS.TITLE.min, "Title is required")
    .max(INPUT_LIMITS.TITLE.max, "Title is too long")
    .trim(),

  otp: z
    .string()
    .min(INPUT_LIMITS.OTP.min, "OTP is too short")
    .max(INPUT_LIMITS.OTP.max, "OTP is too long")
    .regex(/^\d+$/, "OTP must contain only numbers"),

  searchQuery: z
    .string()
    .min(INPUT_LIMITS.SEARCH_QUERY.min, "Search query is too short")
    .max(INPUT_LIMITS.SEARCH_QUERY.max, "Search query is too long")
    .trim(),

  url: z
    .string()
    .min(INPUT_LIMITS.URL.min, "URL is too short")
    .max(INPUT_LIMITS.URL.max, "URL is too long")
    .url("Invalid URL format")
    .trim(),

  fileName: z
    .string()
    .min(INPUT_LIMITS.FILE_NAME.min, "File name is required")
    .max(INPUT_LIMITS.FILE_NAME.max, "File name is too long")
    .regex(/^[a-zA-Z0-9._-]+$/, "File name contains invalid characters")
    .trim(),
};

// Sanitization functions
export const sanitizers = {
  // Remove HTML tags and dangerous characters
  sanitizeHtml: (input: string): string => {
    return input
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/[<>&"']/g, (char) => {
        const entities: { [key: string]: string } = {
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          '"': "&quot;",
          "'": "&#x27;",
        };
        return entities[char] || char;
      })
      .trim();
  },

  // Remove SQL injection attempts
  sanitizeSql: (input: string): string => {
    const sqlKeywords = [
      "SELECT",
      "INSERT",
      "UPDATE",
      "DELETE",
      "DROP",
      "CREATE",
      "ALTER",
      "TRUNCATE",
      "EXEC",
      "EXECUTE",
      "UNION",
      "SCRIPT",
      "JAVASCRIPT",
    ];

    let sanitized = input;
    sqlKeywords.forEach((keyword) => {
      const regex = new RegExp(keyword, "gi");
      sanitized = sanitized.replace(regex, "");
    });

    return sanitized.replace(/[;'"\\]/g, "").trim();
  },

  // Remove script tags and javascript
  sanitizeScript: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  },

  // General purpose sanitization
  sanitizeGeneral: (input: string): string => {
    let sanitized = input;
    sanitized = sanitizers.sanitizeHtml(sanitized);
    sanitized = sanitizers.sanitizeSql(sanitized);
    sanitized = sanitizers.sanitizeScript(sanitized);
    return sanitized;
  },
};

// Rate limiting helpers
export const rateLimiters = new Map<
  string,
  { count: number; resetTime: number }
>();

export const checkRateLimit = (
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; resetTime: number } => {
  const now = Date.now();
  const existing = rateLimiters.get(identifier);

  if (!existing || now > existing.resetTime) {
    // Reset the counter
    rateLimiters.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, resetTime: now + windowMs };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, resetTime: existing.resetTime };
  }

  existing.count++;
  return { allowed: true, resetTime: existing.resetTime };
};

// Input validation middleware function
export const validateInput = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  sanitize: boolean = true
): { success: boolean; data?: T; errors?: string[] } => {
  try {
    let processedData = data;

    // Apply sanitization if requested
    if (sanitize && typeof data === "object" && data !== null) {
      processedData = sanitizeObject(data);
    }

    const result = schema.safeParse(processedData);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return {
        success: false,
        errors: result.error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        ),
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: ["Validation failed due to an unexpected error"],
    };
  }
};

// Recursively sanitize object properties
const sanitizeObject = (obj: any): any => {
  if (typeof obj === "string") {
    return sanitizers.sanitizeGeneral(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === "object" && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

// File upload validation
export const fileValidation = {
  allowedImageTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  allowedDocumentTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  allowedSpreadsheetTypes: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],

  maxFileSize: {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
    spreadsheet: 25 * 1024 * 1024, // 25MB
  },

  validateFile: (
    file: { type: string; size: number; name: string },
    category: "image" | "document" | "spreadsheet"
  ) => {
    const errors: string[] = [];

    // Check file type
    let allowedTypes: string[] = [];
    switch (category) {
      case "image":
        allowedTypes = fileValidation.allowedImageTypes;
        break;
      case "document":
        allowedTypes = fileValidation.allowedDocumentTypes;
        break;
      case "spreadsheet":
        allowedTypes = fileValidation.allowedSpreadsheetTypes;
        break;
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(
        `File type ${file.type} is not allowed for ${category} files`
      );
    }

    // Check file size
    const maxSize = fileValidation.maxFileSize[category];
    if (file.size > maxSize) {
      errors.push(
        `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`
      );
    }

    // Check file name
    const fileNameValidation = baseSchemas.fileName.safeParse(file.name);
    if (!fileNameValidation.success) {
      errors.push("Invalid file name");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

export default {
  baseSchemas,
  sanitizers,
  validateInput,
  checkRateLimit,
  fileValidation,
  INPUT_LIMITS,
};
