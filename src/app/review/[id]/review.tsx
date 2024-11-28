"use client";

import useIsMounted from "@/app/hooks/useIsMounted";
import { usePerformEvaluation } from "@/app/hooks/usePerformEvaluation";
import { usePerformOnChainReview } from "@/app/hooks/usePerformOnChainReview";
import dynamic from "next/dynamic";
import { useAccount } from "wagmi";

const Checker = dynamic(() => import("gitcoin-ui").then(mod => mod.Checker), {
  ssr: false,
});

export default function Review({
  chainId,
  poolId,
}: {
  chainId: number;
  poolId: string;
}){

  const { address } = useAccount();
    const isMounted = useIsMounted();

  if (!isMounted) {
    return <div>Loading...</div>;
  }
  if (!address) {
    return <div>Connect your wallet</div>;
  }
  const { setEvaluationBody, isSigning, isSuccess, isEvaluating, isError, isErrorSigning } =
  usePerformEvaluation();
const { steps, setReviewBody, isReviewing } = usePerformOnChainReview();

  return (
    <Checker
      address={address}
      poolId={poolId}
      chainId={chainId}
      setEvaluationBody={setEvaluationBody}
      isSigning={isSigning}
      isSuccess={isSuccess}
      isEvaluating={isEvaluating}
      isError={isError}
      isErrorSigning={isErrorSigning}
      steps={steps}
      setReviewBody={setReviewBody}
      isReviewing={isReviewing}
      
    />
  );
}
