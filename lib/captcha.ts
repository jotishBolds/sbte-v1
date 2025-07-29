import { createHash } from "crypto";

interface CaptchaResult {
  question: string;
  hash: string;
  expiresAt: number;
}

export function generateCaptcha(): CaptchaResult {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operators = ["+", "-", "×"] as const;
  const operator = operators[Math.floor(Math.random() * operators.length)];

  let answer: number;

  switch (operator) {
    case "+":
      answer = num1 + num2;
      break;
    case "-":
      answer = num1 - num2;
      break;
    case "×":
      answer = num1 * num2;
      break;
    default:
      throw new Error("Unsupported operator");
  }

  const question = `What is ${num1} ${operator} ${num2}?`;

  const expiresAt = Date.now() + 4 * 60 * 1000; // expires in 3 mins
  const salt = process.env.NEXTAUTH_SECRET || "default-salt";

  const hash = createHash("sha256")
    .update(answer.toString() + salt + expiresAt)
    .digest("hex");

  return {
    question,
    hash,
    expiresAt,
  };
}

export function validateCaptcha(
  userAnswer: string,
  hash: string,
  expiresAt: number
): boolean {
  if (!userAnswer || !hash || !expiresAt) return false;
  if (Date.now() > expiresAt) return false; // Expired

  const salt = process.env.NEXTAUTH_SECRET || "default-salt";
  const userHash = createHash("sha256")
    .update(userAnswer + salt + expiresAt)
    .digest("hex");

  return userHash === hash;
}

// export function generateCaptcha(): CaptchaResult {
//   // Generate two random numbers between 1 and 10
//   const num1 = Math.floor(Math.random() * 10) + 1;
//   const num2 = Math.floor(Math.random() * 10) + 1;

//   // Create a simple math question
//   const question = `What is ${num1} + ${num2}?`;
//   const answer = (num1 + num2).toString();

//   // Hash the answer with a salt for security
//   const salt = process.env.NEXTAUTH_SECRET || "default-salt";
//   const hash = createHash("sha256")
//     .update(answer + salt)
//     .digest("hex");

//   return {
//     question,
//     hash,
//   };
// }

// export function validateCaptcha(userAnswer: string, hash: string): boolean {
//   if (!userAnswer || !hash) return false;

//   // Hash the user's answer with the same salt
//   const salt = process.env.NEXTAUTH_SECRET || "default-salt";
//   const userHash = createHash("sha256")
//     .update(userAnswer + salt)
//     .digest("hex");

//   // Compare hashes in constant time to prevent timing attacks
//   return userHash === hash;
// }
