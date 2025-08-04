import * as z from "zod";
import { hash, compare } from "bcryptjs";

// Password strength validation schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

// Enhanced password strength validation
export const passwordStrength = {
  // Minimum length requirement
  minLength: 8,

  // Password validation function
  validate: (password: string): { isValid: boolean; errors: string[] } => {
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      return {
        isValid: false,
        errors: result.error.errors.map((err) => err.message),
      };
    }
    return { isValid: true, errors: [] };
  },

  // Check for common weak passwords
  checkCommonPasswords: (password: string): boolean => {
    const commonPasswords = [
      "password",
      "123456",
      "password123",
      "admin",
      "qwerty",
      "12345678",
      "123456789",
      "password1",
      "abc123",
      "Password1",
    ];
    return commonPasswords.includes(password.toLowerCase());
  },

  // Generate strong password
  generateStrong: (): string => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let password = "";
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    const allChars = upper + lower + numbers + symbols;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
  },
};

// Password hashing utilities
export const passwordUtils = {
  hash: async (password: string): Promise<string> => {
    return await hash(password, 12); // Strong salt rounds
  },

  verify: async (
    password: string,
    hashedPassword: string
  ): Promise<boolean> => {
    return await compare(password, hashedPassword);
  },
};

// Authentication validation schemas
export const authSchemas = {
  email: z.string().email("Invalid email format").max(100, "Email too long"),

  password: passwordSchema,

  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),

  captcha: z.string().min(1, "CAPTCHA is required"),

  loginForm: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
    captchaAnswer: z.string().min(1, "CAPTCHA is required"),
    captchaExpected: z.string(),
    captchaExpiresAt: z.string(),
  }),
};

// Account security utilities
export const accountSecurity = {
  // Check if account should be locked based on failed attempts
  shouldLockAccount: (failedAttempts: number): boolean => {
    return failedAttempts >= 5;
  },

  // Calculate lockout duration (exponential backoff)
  getLockoutDuration: (lockoutCount: number): number => {
    const baseDuration = 30 * 60 * 1000; // 30 minutes
    return Math.min(
      baseDuration * Math.pow(2, lockoutCount - 1),
      24 * 60 * 60 * 1000
    ); // Max 24 hours
  },

  // Generate secure token
  generateSecureToken: (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  },
};

export default {
  passwordStrength,
  passwordUtils,
  authSchemas,
  accountSecurity,
};
