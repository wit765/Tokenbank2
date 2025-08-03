import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { useAccount, useNetwork } from 'wagmi'
import { getContractAddresses } from '@/config/contracts'
import { parseEther, formatEther } from 'viem'

// NFTMarket ABI
const NFT_MARKET_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "nftContract",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "paymentToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "listingTime",
        "type": "uint256"
      }
    ],
    "name": "NFTListed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "nftContract",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "paymentToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "saleTime",
        "type": "uint256"
      }
    ],
    "name": "NFTSold",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "nftContract",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "buyNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "nftContract",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "delist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "nftContract",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getListing",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "seller",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "nftContract",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "paymentToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "listingTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct NFTMarket.Listing",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "nftContract",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "paymentToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "list",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

// SimpleNFT ABI
const SIMPLE_NFT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "mint",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// ERC20 ABI
const ERC20_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export function useNFTMarket() {
  const { chain } = useNetwork()
  const chainId = chain?.id || 11155111
  const addresses = getContractAddresses(chainId)
  
  return {
    address: addresses.NFTMarket as `0x${string}`,
    abi: NFT_MARKET_ABI,
  }
}

export function useSimpleNFT() {
  const { chain } = useNetwork()
  const chainId = chain?.id || 11155111
  const addresses = getContractAddresses(chainId)
  
  return {
    address: addresses.SimpleNFT as `0x${string}`,
    abi: SIMPLE_NFT_ABI,
  }
}

export function useERC20(tokenAddress: string) {
  return {
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
  }
}

// 获取NFT列表
export function useGetListing(nftContract: string, tokenId: bigint) {
  const nftMarket = useNFTMarket()
  
  return useContractRead({
    ...nftMarket,
    functionName: 'getListing',
    args: [nftContract as `0x${string}`, tokenId],
    enabled: !!nftContract && !!tokenId,
  })
}

// 上架NFT
export function useListNFT() {
  const nftMarket = useNFTMarket()
  
  return useContractWrite({
    ...nftMarket,
    functionName: 'list',
  })
}

// 购买NFT
export function useBuyNFT() {
  const nftMarket = useNFTMarket()
  
  return useContractWrite({
    ...nftMarket,
    functionName: 'buyNFT',
  })
}

// 下架NFT
export function useDelistNFT() {
  const nftMarket = useNFTMarket()
  
  return useContractWrite({
    ...nftMarket,
    functionName: 'delist',
  })
}

// 铸造NFT
export function useMintNFT() {
  const simpleNFT = useSimpleNFT()
  
  return useContractWrite({
    ...simpleNFT,
    functionName: 'mint',
  })
}

// 获取代币余额
export function useTokenBalance(tokenAddress: string, userAddress: string) {
  const erc20 = useERC20(tokenAddress)
  
  return useContractRead({
    ...erc20,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
    enabled: !!tokenAddress && !!userAddress,
  })
}

// 授权代币
export function useApproveToken(tokenAddress: string) {
  const erc20 = useERC20(tokenAddress)
  
  return useContractWrite({
    ...erc20,
    functionName: 'approve',
  })
} 