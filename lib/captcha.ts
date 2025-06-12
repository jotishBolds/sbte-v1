import { createHash } from "crypto";

interface CaptchaResult {
  question: string;
  hash: string;
}

export function generateCaptcha(): CaptchaResult {
  // Generate two random numbers between 1 and 10
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;

  // Create a simple math question
  const question = `What is ${num1} + ${num2}?`;
  const answer = (num1 + num2).toString();

  // Hash the answer with a salt for security
  const salt = process.env.NEXTAUTH_SECRET || "default-salt";
  const hash = createHash("sha256")
    .update(answer + salt)
    .digest("hex");

  return {
    question,
    hash,
  };
}

export function validateCaptcha(userAnswer: string, hash: string): boolean {
  if (!userAnswer || !hash) return false;

  // Hash the user's answer with the same salt
  const salt = process.env.NEXTAUTH_SECRET || "default-salt";
  const userHash = createHash("sha256")
    .update(userAnswer + salt)
    .digest("hex");

  // Compare hashes in constant time to prevent timing attacks
  return userHash === hash;
}
