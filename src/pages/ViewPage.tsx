import { ApplicationView } from "@gitcoin/ui/checker";
import { useParams } from "react-router";

export const ViewPage = () => {
  const { chainId, poolId, applicationId } = useParams();

  if (!chainId || !poolId || !applicationId) {
    return <div>Invalid application ID</div>;
  }

  return (
    <ApplicationView
      applicationId={applicationId}
      chainId={parseInt(chainId, 10)}
      poolId={poolId}
    />
  );
};
