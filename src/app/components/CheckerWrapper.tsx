"use client";

import { Checker } from "gitcoin-ui";

export default function CheckerWrapper() {
  return (
    <Checker
      address="0x0000000000000000000000000000000000000000"
      poolId="609"
      chainId={42161}
    />
  );
}
