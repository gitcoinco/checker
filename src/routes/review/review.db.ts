import { type z } from "zod";

import { db } from "~/server/db";

import type { Review } from "prisma/prisma-client";
import { type ReviewSchema } from "~/routes/review/review.schemas";

type SaveReview = Omit<Review, "id" | "createdAt" | "updatedAt"> &
  z.infer<typeof ReviewSchema>;

export async function saveReview({ evaluations, ...data }: SaveReview) {
  return db.review.create({
    data: { ...data, evaluations: { createMany: { data: evaluations } } },
    include: { evaluations: true },
  });
}
