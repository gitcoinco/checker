import { useState, useEffect } from "react";

import { useMutation } from "@tanstack/react-query";
import { Hex } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { EvaluationBody, submitEvaluation } from ".";

export const usePerformEvaluation = () => {
  const [evaluationBody, setEvaluationBody] = useState<EvaluationBody | null>(null);
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const handleSetEvaluationBody = (data: EvaluationBody) => {
    setEvaluationBody(data);
  };

  // Dummy signing function
  const dummySign = async (): Promise<Hex> => {
    if (!walletClient) {
      throw new Error("No wallet client found");
    }
    // Dummy Signature to simulate the workflow
    await walletClient.signMessage({ message: "dummy" });
    return "0xdeadbeef";
  };

  // Signing mutation
  const signingMutation = useMutation({
    mutationFn: dummySign,
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
