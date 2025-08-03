// 合约地址配置 - 部署后需要更新这些地址
export const CONTRACTS = {
  // 测试网络配置
  sepolia: {
    NFTMarket: '0x...', // 部署后填入实际地址
    SimpleNFT: '0x...', // 部署后填入实际地址
    TestToken1: '0x...', // 部署后填入实际地址
    TestToken2: '0x...', // 部署后填入实际地址
    TestToken3: '0x...', // 部署后填入实际地址
  },
  // 主网配置
  mainnet: {
    NFTMarket: '0x...', // 部署后填入实际地址
    SimpleNFT: '0x...', // 部署后填入实际地址
    TestToken1: '0x...', // 部署后填入实际地址
    TestToken2: '0x...', // 部署后填入实际地址
    TestToken3: '0x...', // 部署后填入实际地址
  },
  // 本地测试网络
  localhost: {
    NFTMarket: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    SimpleNFT: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    TestToken1: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    TestToken2: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    TestToken3: '0xDc64a140Aa3E981100a9ccA8C8e8A8e8A8e8A8e8',
  }
}

// 获取当前网络的合约地址
export function getContractAddresses(chainId: number) {
  switch (chainId) {
    case 1: // mainnet
      return CONTRACTS.mainnet
    case 11155111: // sepolia
      return CONTRACTS.sepolia
    case 31337: // hardhat localhost
    case 1337: // ganache localhost
      return CONTRACTS.localhost
    default:
      return CONTRACTS.sepolia // 默认使用sepolia
  }
}

// 支持的代币配置
export const SUPPORTED_TOKENS = [
  {
    symbol: 'TK1',
    name: 'Token1',
    decimals: 18,
    address: '0x...', // 部署后更新
  },
  {
    symbol: 'TK2',
    name: 'Token2',
    decimals: 18,
    address: '0x...', // 部署后更新
  },
  {
    symbol: 'TK3',
    name: 'Token3',
    decimals: 18,
    address: '0x...', // 部署后更新
  },
] 