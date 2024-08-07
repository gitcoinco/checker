import { initContract } from "@ts-rest/core";

import { z } from "zod";
import { ReviewSchema } from "./review.schemas";
import type { Evaluation, Review } from "@prisma/client";

const c = initContract();

export type ReviewWithEvaluations = Review & { evaluations: Evaluation[] };

/*

This file describes the API and an OpenAPI definition is generated (see api/open-api)

The handlers for these API endpoints can be found in api/[...ts-rest]
*/
export const reviewContract = c.router({
  queryReviews: {
    method: "GET",
    path: "/reviews",
    query: z.object({
      chainId: z.coerce.string().optional(),
      roundId: z.coerce.string().optional(),
      applicationId: z.coerce.string().optional(),
    }),
    summary: "Query Reviews",
    description: "Reviews can be queried for chains, rounds, and applications",
    responses: {
      // Use the Prisma type declaration as return type
      201: c.type<ReviewWithEvaluations[]>(),
    },
  },
  reviewApplication: {
    method: "POST",
    path: "/reviews/:chainId/:roundId/:applicationId",
    responses: {
      201: c.type<ReviewWithEvaluations>(),
      404: c.type<{ message: string }>(),
    },
    body: ReviewSchema.nullish(),
    pathParams: z.object({
      chainId: z.string(),
      roundId: z.string(),
      applicationId: z.string(),
    }),
    summary: "Review an Application",
  },
});
