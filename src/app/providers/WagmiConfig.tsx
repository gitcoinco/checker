import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
    appName: 'Checker - Gitcoin',
    projectId: 'YOUR_PROJECT_ID',
    chains: [mainnet, sepolia],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
    ssr: true,
})