import { z } from "zod";

export const ReviewSchema = z.object({
  comment: z.string().describe("Summary of evaluation"),
  evaluations: z.array(
    z.object({
      requirement: z.string(),
      reason: z.string(),
      score: z.number().min(0).max(10),
      references: z
        .string()
        .describe(
          "Include quotes from the application and answers to support reasoning and score",
        ),
    }),
  ),
});
