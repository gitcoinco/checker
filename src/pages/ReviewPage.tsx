import { Checker } from "gitcoin-ui/checker";
import { useParams } from "react-router";
import { useAccount } from "wagmi";

export const ReviewPage = () => {
  const { chainId, poolId } = useParams();

  if (!chainId || !poolId) {
    return <div>Invalid pool ID</div>;
  }
  const { address } = useAccount();

  if (!address) {
    return <div>Connect your wallet</div>;
  }

  return (
    <Checker
      address={address}
      chainId={parseInt(chainId, 10)}
      poolId={poolId}
      setEvaluationBody={() => {}}
      isSigning={false}
      isSuccess={false}
      isEvaluating={false}
      isError={false}
      isErrorSigning={false}
      steps={[]}
      setReviewBody={() => {}}
      isReviewing={false}
    />
  );
};
