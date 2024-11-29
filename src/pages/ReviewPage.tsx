import { Checker, EvaluationBody } from "gitcoin-ui/checker";
import { usePerformOnChainReview, usePerformEvaluation } from "@/hooks";
import { useParams } from "react-router";
import { useAccount, useWalletClient } from "wagmi";
import { MessagePage } from "@/components/Message";

export const ReviewPage = () => {
  const { chainId, poolId } = useParams();
  const { address, chainId: connectedChainId } = useAccount();
  const { data: walletClient } = useWalletClient();

  const { setEvaluationBody, isSigning, isSuccess, isEvaluating, isError, isErrorSigning } =
    usePerformEvaluation();
  const { steps, setReviewBody, isReviewing } = usePerformOnChainReview();

  if (!chainId || !poolId) {
    return (
      <MessagePage
        title="Pool Not Found"
        message="The pool you're looking for doesn't exist. Please check the URL."
      />
    );
  }

  if (!address || !walletClient) {
    return (
      <MessagePage
        title="Wallet Not Connected"
        message="Please connect your wallet to access this feature. Connecting your wallet is required to interact with the application."
      />
    );
  }

  if (Number(chainId) !== connectedChainId) {
    return (
      <MessagePage
        title="Wrong Network"
        message={`Please switch to the correct chain (${chainId}) to review applications`}
        action={{
          label: "Switch chain",
          onClick: async () => {
            await walletClient.switchChain({
              id: Number(chainId),
            });
          },
        }}
      />
    );
  }

  return (
    <Checker
      address={address}
      poolId={poolId}
      chainId={parseInt(chainId, 10)}
      setEvaluationBody={(body: EvaluationBody) => setEvaluationBody(body)}
      isSigning={isSigning}
      isSuccess={isSuccess}
      isEvaluating={isEvaluating}
      isError={isError}
      isErrorSigning={isErrorSigning}
      steps={steps}
      setReviewBody={setReviewBody as any}
      isReviewing={isReviewing}
    />
  );
};
