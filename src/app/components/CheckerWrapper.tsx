"use client";

import dynamic from "next/dynamic";

const Checker = dynamic(() => import("gitcoin-ui").then(mod => mod.Checker), {
  ssr: false,
});

export default function CheckerWrapper() {
  return (
    <Checker
      address="0x0000000000000000000000000000000000000000"
      poolId="609"
      chainId={42161}
    />
  );
}
