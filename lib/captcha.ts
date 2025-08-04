import { createHash } from "crypto";

interface CaptchaResult {
  question: string;
  hash: string;
  expiresAt: number;
}

export function generateCaptcha(): CaptchaResult {
  // Use crypto for better randomness and prevent any build-time caching
  const crypto = require("crypto");

  // Generate random numbers with better entropy using current timestamp as additional entropy
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(8); // Get more random bytes

  // Use random bytes to generate truly random numbers
  const num1 = (randomBytes[0] % 10) + 1; // 1-10
  const num2 = (randomBytes[1] % 10) + 1; // 1-10

  const operators = ["+", "-", "×"] as const;
  const operatorIndex = randomBytes[2] % operators.length;
  const operator = operators[operatorIndex];

  let answer: number;

  switch (operator) {
    case "+":
      answer = num1 + num2;
      break;
    case "-":
      // Ensure positive results for subtraction
      answer = Math.max(num1, num2) - Math.min(num1, num2);
      break;
    case "×":
      answer = num1 * num2;
      break;
    default:
      throw new Error("Unsupported operator");
  }

  const question =
    operator === "-"
      ? `What is ${Math.max(num1, num2)} ${operator} ${Math.min(num1, num2)}?`
      : `What is ${num1} ${operator} ${num2}?`;

  const expiresAt = Date.now() + 5 * 60 * 1000; // expires in 5 mins
  const salt = process.env.NEXTAUTH_SECRET || "default-salt";

  // Create hash without nonce to keep validation working
  // But use timestamp to ensure uniqueness at generation time
  const hash = createHash("sha256")
    .update(answer.toString() + salt + expiresAt.toString())
    .digest("hex");

  console.log("Generated CAPTCHA:", {
    question,
    answer,
    expiresAt,
    timestamp,
    randomSeed: randomBytes.toString("hex").substring(0, 8),
  });

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
  if (!userAnswer || !hash || !expiresAt) {
    console.log("CAPTCHA validation failed: Missing parameters", {
      userAnswer: !!userAnswer,
      hash: !!hash,
      expiresAt,
    });
    return false;
  }

  if (Date.now() > expiresAt) {
    console.log("CAPTCHA validation failed: Expired", {
      now: Date.now(),
      expiresAt,
    });
    return false;
  }

  const salt = process.env.NEXTAUTH_SECRET || "default-salt";

  // Normalize the user answer
  const normalizedAnswer = userAnswer.trim();

  // Generate the hash using the same method as generation
  const expectedHash = createHash("sha256")
    .update(normalizedAnswer + salt + expiresAt.toString())
    .digest("hex");

  const isValid = expectedHash === hash;

  console.log("CAPTCHA validation:", {
    userAnswer: normalizedAnswer,
    isValid,
    providedHash: hash.substring(0, 10) + "...",
    expectedHash: expectedHash.substring(0, 10) + "...",
    expiresAt,
  });

  return isValid;
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
