import { createClient, fallback, http } from "viem";
import { createConfig } from "wagmi";
import { targetNetworks } from "./chains";
import { wagmiConnectors } from "./wagmiConnectors";

export const wagmiConfig = createConfig({
  chains: targetNetworks,
  connectors: wagmiConnectors,
  ssr: true,
  client({ chain }) {
    const rpcFallbacks = [http()];

    return createClient({
      chain,
      transport: fallback(rpcFallbacks),
      pollingInterval: 30000,
    });
  },
});
