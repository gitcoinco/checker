import { useState, useEffect } from "react";

import { useMutation } from "@tanstack/react-query";
import { Hex } from "viem";


export const usePerformEvaluation = () => {
  const [evaluationBody, setEvaluationBody] = useState<EvaluationBody | null>(null);

  const handleSetEvaluationBody = (data: EvaluationBody) => {
    setEvaluationBody(data);
  };

  // Dummy signing function
  const dummySign = async (): Promise<Hex> => {
    return new Promise<Hex>((resolve) => {
      setTimeout(() => {
        resolve("0xdeadbeef");
      }, 3000);
    });
  };

  // Signing mutation
  const signingMutation = useMutation({
    mutationFn: dummySign,
  });

  // Evaluation mutation
  const evaluationMutation = useMutation({
    mutationFn: async (data: EvaluationBody & { signature: Hex }) => {
      return await submitEvaluation(data);
    },
  });

  // Trigger the signing mutation when evaluationBody is set
  useEffect(() => {
    if (evaluationBody) {
      signingMutation.mutate();
    }
  }, [evaluationBody]);

  // Trigger the evaluation mutation when signing is successful
  useEffect(() => {
    if (signingMutation.isSuccess && evaluationBody) {
      const signature = signingMutation.data;
      evaluationMutation.mutate({ ...evaluationBody, signature });
    }
  }, [signingMutation.isSuccess, evaluationBody]);

  return {
    setEvaluationBody: handleSetEvaluationBody,
    isSigning: signingMutation.isPending,
    isErrorSigning: signingMutation.isError,
    isEvaluating: evaluationMutation.isPending,
    isError: evaluationMutation.isError,
    isSuccess: evaluationMutation.isSuccess,
    data: evaluationMutation.data,
    error: evaluationMutation.error,
  };
};




export const CHECKER_ENDPOINT = "https://api.checker.gitcoin.co";

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

export async function submitEvaluation(
  evaluationBody: EvaluationBody,
): Promise<{ evaluationId: string }> {
  const url = `${CHECKER_ENDPOINT}/api/evaluate`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...evaluationBody, evaluatorType: "human" }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} - ${errorData.message || "Unknown error"}`);
    }

    const data = await response.json();
    return data.evaluationId;
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    throw error;
  }
}

export async function syncPool(syncPoolBody: SyncPoolBody): Promise<boolean> {
  const url = `${CHECKER_ENDPOINT}/api/pools`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...syncPoolBody,
        skipEvaluation: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} - ${errorData.message || "Unknown error"}`);
    }

    return true;
  } catch (error) {
    console.error("Error syncing pool:", error);
    throw error;
  }
}
