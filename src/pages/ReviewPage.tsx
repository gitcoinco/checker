import { Checker } from "gitcoin-ui/checker";
import { usePerformOnChainReview, usePerformEvaluation } from "@/hooks";
import { Button } from "gitcoin-ui";
import { useParams } from "react-router";
import { useAccount, useWalletClient } from "wagmi";

export const ReviewPage = () => {
  const { chainId, poolId } = useParams();
  const { address, chainId: connectedChainId } = useAccount();
  const { data: walletClient } = useWalletClient();

  const { setEvaluationBody, isSigning, isSuccess, isEvaluating, isError, isErrorSigning } =
    usePerformEvaluation();
  const { steps, setReviewBody, isReviewing } = usePerformOnChainReview();

  if (!chainId || !poolId) {
    return <div>Invalid pool ID</div>;
  }
  if (!address || !walletClient) {
    return <div>Connect your wallet</div>;
  }

  if (Number(chainId) !== connectedChainId) {
    return (
      <div className="mt-[30%] flex flex-col items-center">
        <Button
          onClick={async () => {
            await walletClient.switchChain({
              id: Number(chainId),
            });
          }}
          value="Switch chain"
        />
      </div>
    );
  }

  return (
    <Checker
      address={address}
      poolId={poolId}
      chainId={parseInt(chainId, 10)}
      setEvaluationBody={setEvaluationBody}
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
