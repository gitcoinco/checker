import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import type { Application, Round } from "@allo-team/kit";
import { ReviewSchema } from "~/routes/review/review.schemas";

export async function evaluateWithLLM(round: Round, application: Application) {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini-2024-07-18"),
    system: createSystemPrompt(round),
    prompt: createReviewPrompt(application),
    schema: ReviewSchema,
  });
  return object;
}

function createSystemPrompt(round: Round) {
  return ` As an AI acting as a Gitcoin project evaluator, assess whether a project should be included 
in the "${round.name}" Gitcoin round.

The "${round.name}" round has an overarching set of evaluation criteria of:
${round.eligibility.description}

Specific eligibility criteria are:
${JSON.stringify(round.eligibility.requirements, null, 2)}

Provide evaluations strictly in a JSON format, with each criteria scored between 0 and 10 
and include a brief reason for each score.  Any notes for any of the bits of criteria should be 
added to the "reason" field in the json.  It is very important that an array of json objects is 
returned with no other text.`;
}

function createReviewPrompt(application: Application) {
  return `Evaluate the project "${application.name}" for Gitcoin round eligibility. 
Assess each of the following criteria, providing a score and a brief reasoning:

The project details are:
${application.description}

The project application answers are:
${JSON.stringify(application.answers, null, 2)}
`;
}
