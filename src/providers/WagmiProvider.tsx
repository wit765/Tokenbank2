import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, sepolia } from 'wagmi/chains'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'demo-project-id' // 临时ID，生产环境需要从WalletConnect Cloud获取

// 2. Create wagmiConfig
const metadata = {
  name: 'NFT Market',
  description: 'NFT Market with ERC20 Payment Support',
  url: 'https://nft-market.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, arbitrum, sepolia]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains })

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
} 