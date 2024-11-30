import * as z from "zod";

export const LoadBalancingPdfSchema = z.object({
  title: z.string().min(1, "Title is required"),
  pdfFile: z
    .instanceof(File)
    .refine(
      (file) => file.type === "application/pdf",
      "Only PDF files are allowed"
    ),
});
