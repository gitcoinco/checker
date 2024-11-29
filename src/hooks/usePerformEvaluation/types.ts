import { Hex } from "viem";

interface EvaluationAnswerInput {
  questionIndex: number;
  answerEnum: number;
}

export interface EvaluationSummaryInput {
  questions: EvaluationAnswerInput[];
  summary: string;
}

export enum EVALUATION_STATUS {
  APPROVED = "approved",
  REJECTED = "rejected",
  UNCERTAIN = "uncertain",
}

export interface EvaluationBody {
  chainId: number;
  alloPoolId: string;
  alloApplicationId: string;
  cid: string;
  evaluator: string;
  summaryInput: EvaluationSummaryInput;
  evaluationStatus: EVALUATION_STATUS;
  signature: Hex;
}

export interface SyncPoolBody {
  chainId: number;
  alloPoolId: string;
}
