### User Stories

- As a User I can connect my wallet so I can see Rounds or Applications relevant to my address
- As a Round Manager I can list Rounds I have access to
- As a Round Manager I can navigate to Round Details Page
- As a Round Manager I can see details about the Round and its eligibility criteria
- As a Round Manager I can see a list of Applications for the Round (project name, on-chain approval status, review count)
- As a Round Manager I can navigate to Application Details Page
- As a Round Manager I can trigger an automatic review of the Application (LLM/GPT)
- As a Round Manager I can manually review the Application
- As a Project owner I can see the progress and status for my Applications
- As a Developer I can see an OpenAPI spec of the Checker API so that it's easy for me to build on

### Models

```prisma
model Review {
    id            String @id @default(cuid())
    chainId       String
    roundId       String
    projectId     String
    applicationId String

    reviewer    String // Wallet address
    model       String? // For example: gpt-4o - only on automatic reviews
    comment     String
    evaluations Evaluation[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

model Evaluation {
    id String @id @default(cuid())

    reason      String
    score       Int // 1-10 (better granularity than simply true/false)
    requirement String?
    references  String?

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    reviewId String
    review   Review @relation(fields: [reviewId], references: [id])
}

```

```ts
// POST api/review/:chainId/:roundId/:applicationId
// Body is optional with manual review - if empty it calls LLM for review
async function reviewApplication({ body, params }) {
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
  await saveReview({
    ...params,
    ...review,
    projectId: application.projectId,
    // TODO: Get configured model (or as param in request)
    model: body ? null : "gpt-4o",
    // TODO: Add reviewer address from JWT token
    reviewer: "0x...",
  });
  return { status: 201, body: review };
}

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

export async function evaluateWithLLM({
  round,
  application,
  model = "gpt-4o-mini-2024-07-18",
}: {
  round: Round;
  application: Application;
  model?: OpenAIChatModelId;
}) {
  const { object } = await generateObject({
    model: openai(model),
    system: createSystemPrompt(round),
    prompt: createReviewPrompt(application),
    schema: ReviewSchema,
  });
  return object;
}

async function saveReview({ evaluations, ...data }: SaveReview) {
  return db.review.create({
    data: { ...data, evaluations: { createMany: { data: evaluations } } },
    include: { evaluations: true },
  });
}
```
