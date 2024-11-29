import { useState, useEffect } from "react";

import { useMutation } from "@tanstack/react-query";
import { Hex } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { submitEvaluation } from "./utils";
import { EvaluationBody } from "gitcoin-ui/checker";
import { deterministicKeccakHash } from "@/utils/utils";

export const usePerformEvaluation = () => {
  const [evaluationBody, setEvaluationBody] = useState<EvaluationBody | null>(null);
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const handleSetEvaluationBody = (data: EvaluationBody) => {
    setEvaluationBody(data);
  };

  // Dummy signing function
  const signEvaluationBody = async (): Promise<Hex> => {
    if (!walletClient) {
      throw new Error("No wallet client found");
    }

    if (!evaluationBody) {
      throw new Error("No evaluation body found");
    }

    const hash = await deterministicKeccakHash({
      chainId: evaluationBody.chainId,
      alloPoolId: evaluationBody.alloPoolId,
      alloApplicationId: evaluationBody.alloApplicationId,
      cid: evaluationBody.cid,
      evaluator: address,
      summaryInput: evaluationBody.summaryInput,
      evaluationStatus: evaluationBody.evaluationStatus,
    });

    const signature = await walletClient.signMessage({ message: hash });

    return signature;
  };

  // Signing mutation
  const signingMutation = useMutation({
    mutationFn: signEvaluationBody,
  });

  // Evaluation mutation
  const evaluationMutation = useMutation({
    mutationFn: async (data: EvaluationBody & { signature: Hex }) => {
      if (!address) {
        throw new Error("No address found");
      }
      return await submitEvaluation({ ...data, evaluator: address });
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
