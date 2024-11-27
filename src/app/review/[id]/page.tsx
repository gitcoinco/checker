"use client";

import dynamic from "next/dynamic";
import { useAccount } from "wagmi";

const Checker = dynamic(() => import("gitcoin-ui").then(mod => mod.Checker), {
  ssr: false,
});

export default async function Review({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = (await params).id;

  const { address } = useAccount();

  const [chainId, poolId] = id.split("-");

  if (!chainId || !poolId) {
    return <div>Invalid pool ID</div>;
  }

  if (!address) {
    return <div>Connect your wallet</div>;
  }

  return (
    <Checker
      address={address}
      poolId={poolId}
      chainId={parseInt(chainId, 10)}
    />
  );
}
