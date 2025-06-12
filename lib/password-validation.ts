import * as z from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const validatePassword = (
  password: string
): { isValid: boolean; error?: string } => {
  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    return {
      isValid: false,
      error: result.error.errors[0].message,
    };
  }
  return { isValid: true };
};
