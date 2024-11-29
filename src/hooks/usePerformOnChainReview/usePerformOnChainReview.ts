import { useState, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useWalletClient } from "wagmi";
import { Abi, createPublicClient, encodeFunctionData, http } from "viem";

import {
  // Types
  ProgressStatus,
  ReviewBody,
  // Utils
  waitUntilIndexerSynced,
  applicationStatusToNumber,
  buildUpdatedRowsOfApplicationStatuses,
  getStrategyInstance,
  getOnchainEvaluationProgressSteps,
} from ".";

export const usePerformOnChainReview = () => {
  const [reviewBody, setReviewBody] = useState<ReviewBody | null>(null);
  const [contractUpdatingStatus, setContractUpdatingStatus] = useState<ProgressStatus>(
    ProgressStatus.NOT_STARTED,
  );
  const [indexingStatus, setIndexingStatus] = useState<ProgressStatus>(ProgressStatus.NOT_STARTED);
  const [finishingStatus, setFinishingStatus] = useState<ProgressStatus>(
    ProgressStatus.NOT_STARTED,
  );

  const { data: walletClient } = useWalletClient();

  const handleSetReviewBody = (reviewBody: ReviewBody | null) => {
    setReviewBody(reviewBody);
  };

  const evaluationMutation = useMutation({
    mutationFn: async (data: ReviewBody) => {
      if (!walletClient) {
        throw new Error("WalletClient is undefined");
      }

      try {
        // Reset statuses before starting
        setContractUpdatingStatus(ProgressStatus.IN_PROGRESS);

        // Prepare the strategy instance based on the strategy type.
        const { strategyInstance, strategyInstanceAbi } = getStrategyInstance(
          data.strategyAddress,
          walletClient.chain.id,
          data.roundId,
          data.strategy,
        );

        // Try to get total applications
        let totalApplications = BigInt(0);
        try {
          totalApplications = await strategyInstance.recipientsCounter();
        } catch (error) {
          totalApplications = BigInt(data.currentApplications.length + 1);
        }

        // Build updated rows of application statuses
        const rows = buildUpdatedRowsOfApplicationStatuses({
          applicationsToUpdate: data.applicationsToUpdate,
          currentApplications: data.currentApplications,
          statusToNumber: applicationStatusToNumber,
          bitsPerStatus: 4,
        });

        // Send transaction
        const account = walletClient.account;
        if (!account) {
          throw new Error("WalletClient account is undefined");
        }

        const publicClient = createPublicClient({
          chain: walletClient.chain,
          transport: http(),
        });

        let txHash;
        let receipt;
        try {
          txHash = await walletClient.sendTransaction({
            account: account,
            to: data.strategyAddress,
            data: encodeFunctionData({
              abi: strategyInstanceAbi as Abi,
              functionName: "reviewRecipients",
              args: [rows, totalApplications],
            }),
          });

          receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
            confirmations: 2,
          });
        } catch (sendError) {
          setContractUpdatingStatus(ProgressStatus.IS_ERROR);
          throw sendError;
        }

        if (!receipt.status) {
          setContractUpdatingStatus(ProgressStatus.IS_ERROR);
          throw new Error("Failed to update application status");
        }

        // Transaction sent successfully
        setContractUpdatingStatus(ProgressStatus.IS_SUCCESS);
        setIndexingStatus(ProgressStatus.IN_PROGRESS);

        // Wait until indexer is synced
        try {
          await waitUntilIndexerSynced({
            chainId: walletClient.chain.id,
            blockNumber: receipt.blockNumber,
          });
        } catch (e) {
          setIndexingStatus(ProgressStatus.IS_ERROR);
        }

        setIndexingStatus(ProgressStatus.IS_SUCCESS);

        // Finishing up
        setFinishingStatus(ProgressStatus.IN_PROGRESS);
        // Any finishing steps can be added here
        setFinishingStatus(ProgressStatus.IS_SUCCESS);
      } catch (error) {
        throw error;
      }
    },
  });

  useEffect(() => {
    if (reviewBody) {
      evaluationMutation.mutate(reviewBody);
    }
  }, [reviewBody]);

  useEffect(() => {
    if (evaluationMutation.isSuccess) {
      evaluationMutation.reset();
    }
  }, [evaluationMutation.isSuccess]);

  const steps = useMemo(() => {
    return getOnchainEvaluationProgressSteps({
      contractUpdatingStatus,
      indexingStatus,
      finishingStatus,
    });
  }, [contractUpdatingStatus, indexingStatus, finishingStatus]);

  return {
    setReviewBody: handleSetReviewBody,
    steps,
    isReviewing: evaluationMutation.isPending,
    isError: evaluationMutation.isError,
    isSuccess: evaluationMutation.isSuccess,
    error: evaluationMutation.error,
  };
};