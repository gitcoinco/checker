"use client";

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
  if (!address) {
    return <div>Connect your wallet</div>;
  }

  return (
    <Checker
      address={address}
      poolId={poolId}
      chainId={chainId}
    />
  );
}
