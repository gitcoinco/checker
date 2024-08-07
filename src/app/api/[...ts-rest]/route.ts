import { indexer } from "@allo-team/kit";
import { createNextHandler, TsRestHttpError } from "@ts-rest/serverless/next";

import { db } from "~/server/db";
import { evaluateWithLLM } from "~/utils/llm";

import { contract } from "~/routes/contract";
import { saveReview } from "~/routes/review/review.db";

/*

Handlers for API endpoints

*/
const handler = createNextHandler(
  contract,
  {
    reviews: {
      queryReviews: async ({ query }) => {
        const reviews = await db.review.findMany({
          where: query,
          include: { evaluations: true },
        });

        return { status: 200, body: reviews };
      },

      reviewApplication: async ({ body, params }) => {
        const { applicationId, chainId, roundId } = params;

        // Fetch Round and Application data from Indexer to feed into LLM for evaluation
        const [round, application] = await Promise.all([
          indexer.roundById(roundId, { chainId }),
          indexer.applicationById(applicationId, { chainId, roundId }),
        ]);

        // Verify they exist
        if (!round || !application) {
          throw new TsRestHttpError(404, { message: "Not found" });
        }

        const review = body ? body : await evaluateWithLLM(round, application);

        // Store the review in database
        const entry = await saveReview({
          ...params,
          ...review,
          projectId: application.projectId,
          // TODO: Get configured model (or as param in request)
          model: body ? null : "gpt-4o",
          // TODO: Add reviewer address from JWT token
          reviewer: "0x...",
        });
        return { status: 201, body: entry };
      },
    },
  },
  {
    basePath: "/api/",
    jsonQuery: true,
    responseValidation: true,
    handlerType: "app-router",
  },
);

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
