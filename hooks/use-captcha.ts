import { useCallback, useEffect, useState } from "react";

interface CaptchaData {
  question: string;
  hash: string;
  expiresAt: number;
}

export function useCaptcha() {
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string>("");

  const generateCaptcha = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/captcha");
      if (!response.ok) {
        throw new Error("Failed to generate CAPTCHA");
      }

      const data = await response.json();

      setCaptcha({
        question: data.question,
        hash: data.hash,
        expiresAt: data.expiresAt,
      });
    } catch (err) {
      console.error("CAPTCHA generation error:", err);
      setError("Failed to load CAPTCHA. Please try again.");
    } finally {
      setLoading(false);
    }
    // const generateCaptcha = useCallback(async () => {
    //   try {
    //     setLoading(true);
    //     setError(null);

    //     // Try server-side CAPTCHA first
    //     const response = await fetch("/api/auth/captcha");
    //     if (response.ok) {
    //       const data = await response.json();
    //       setCaptcha(data);
    //       setCaptchaToken(data.hash);
    //     } else {
    //       // Fallback to client-side CAPTCHA
    //       const num1 = Math.floor(Math.random() * 10) + 1;
    //       const num2 = Math.floor(Math.random() * 10) + 1;
    //       const answer = (num1 + num2).toString();
    //       const token = Buffer.from(`${answer}:${Date.now()}`).toString("base64");
    //       setCaptcha({
    //         question: `${num1} + ${num2} = ?`,
    //         hash: token,
    //       });
    //       setCaptchaToken(token);
    //     }
    //   } catch (err) {
    //     // Fallback to client-side CAPTCHA on error
    //     const num1 = Math.floor(Math.random() * 10) + 1;
    //     const num2 = Math.floor(Math.random() * 10) + 1;
    //     const answer = (num1 + num2).toString();
    //     const token = Buffer.from(`${answer}:${Date.now()}`).toString("base64");
    //     setCaptcha({
    //       question: `${num1} + ${num2} = ?`,
    //       hash: token,
    //     });
    //     setCaptchaToken(token);
    //   } finally {
    //     setLoading(false);
    //   }
  }, []);

  const resetCaptcha = useCallback(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);
  const verifyCaptcha = async (answer: string): Promise<boolean> => {
    if (!captcha || !captchaToken || !answer) return false;

    try {
      const response = await fetch("/api/auth/verify-captcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answer: answer.trim(),
          hash: captcha.hash,
          expiresAt: captcha.expiresAt,
        }),
        // body: JSON.stringify({
        //   captchaToken,
        //   answer: answer.trim(),
        // }),
      });

      const result = await response.json();
      return response.ok && result.valid;
    } catch {
      return false;
    }
  };

  return {
    captcha,
    loading,
    error,
    // captchaToken,
    // regenerateCaptcha: generateCaptcha,
    resetCaptcha,
    verifyCaptcha,
  };
}
