"use client";

import useIsMounted from "@/app/hooks/useIsMounted";
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

  return (
    <Checker
      address={address}
      poolId={poolId}
      chainId={chainId}
    />
  );
}
