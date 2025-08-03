import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Web3Button } from '@web3modal/wagmi/react'

import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ShoppingCart,
  Eye,
  Heart
} from 'lucide-react'
import { NFTCard } from '@/components/NFTCard'
import { BuyNFTModal } from '@/components/BuyNFTModal'
import { SUPPORTED_TOKENS } from '@/config/contracts'

// 模拟NFT数据 - 实际应用中应该从区块链获取
const mockNFTs = [
  {
    id: 1,
    name: "Cosmic Dreamer #001",
    description: "A beautiful cosmic artwork representing dreams and aspirations",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
    price: "0.1",
    paymentToken: "TK1",
    seller: "0x1234...5678",
    tokenId: 1,
    nftContract: "0x...",
    isLiked: false
  },
  {
    id: 2,
    name: "Digital Landscape #042",
    description: "A serene digital landscape with vibrant colors",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    price: "0.25",
    paymentToken: "TK2",
    seller: "0x8765...4321",
    tokenId: 2,
    nftContract: "0x...",
    isLiked: true
  },
  {
    id: 3,
    name: "Abstract Harmony #007",
    description: "An abstract composition exploring harmony and balance",
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop",
    price: "0.5",
    paymentToken: "TK3",
    seller: "0xabcd...efgh",
    tokenId: 3,
    nftContract: "0x...",
    isLiked: false
  },
  {
    id: 4,
    name: "Neon City #123",
    description: "A futuristic neon-lit cityscape",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=400&fit=crop",
    price: "0.15",
    paymentToken: "TK1",
    seller: "0x9876...5432",
    tokenId: 4,
    nftContract: "0x...",
    isLiked: false
  },
  {
    id: 5,
    name: "Nature's Whisper #089",
    description: "A peaceful nature scene with soft lighting",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    price: "0.3",
    paymentToken: "TK2",
    seller: "0x5678...1234",
    tokenId: 5,
    nftContract: "0x...",
    isLiked: true
  },
  {
    id: 6,
    name: "Geometric Flow #156",
    description: "Dynamic geometric patterns in motion",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
    price: "0.2",
    paymentToken: "TK3",
    seller: "0xdcba...9876",
    tokenId: 6,
    nftContract: "0x...",
    isLiked: false
  }
]

export function Marketplace() {
  const { isConnected, address } = useAccount()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedToken, setSelectedToken] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedNFT, setSelectedNFT] = useState<any>(null)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [filteredNFTs, setFilteredNFTs] = useState(mockNFTs)

  // 过滤NFT
  useEffect(() => {
    let filtered = mockNFTs

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(nft => 
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 代币过滤
    if (selectedToken !== 'all') {
      filtered = filtered.filter(nft => nft.paymentToken === selectedToken)
    }

    // 价格过滤
    if (priceRange.min) {
      filtered = filtered.filter(nft => parseFloat(nft.price) >= parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(nft => parseFloat(nft.price) <= parseFloat(priceRange.max))
    }

    setFilteredNFTs(filtered)
  }, [searchTerm, selectedToken, priceRange])

  const handleBuyNFT = (nft: any) => {
    setSelectedNFT(nft)
    setShowBuyModal(true)
  }

  const handleCloseBuyModal = () => {
    setShowBuyModal(false)
    setSelectedNFT(null)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            连接钱包以访问市场
          </h1>
          <p className="text-gray-600 mb-8">
            请连接您的钱包以浏览和购买NFT。
          </p>
                                                 <Web3Button />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NFT 市场</h1>
          <p className="text-gray-600">
            发现独特的数字艺术品，支持多种ERC20代币支付
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索NFT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Token Filter */}
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="input"
            >
              <option value="all">所有代币</option>
              {SUPPORTED_TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.name} ({token.symbol})
                </option>
              ))}
            </select>

            {/* Min Price */}
            <input
              type="number"
              placeholder="最低价格"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="input"
            />

            {/* Max Price */}
            <input
              type="number"
              placeholder="最高价格"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="input"
            />
          </div>
        </div>

        {/* View Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            显示 {filteredNFTs.length} 个NFT
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NFT Grid */}
        {filteredNFTs.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredNFTs.map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                viewMode={viewMode}
                onBuy={() => handleBuyNFT(nft)}
                isOwner={nft.seller === address}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              没有找到NFT
            </h3>
            <p className="text-gray-600">
              尝试调整搜索条件或过滤器。
            </p>
          </div>
        )}
      </div>

      {/* Buy NFT Modal */}
      {showBuyModal && selectedNFT && (
        <BuyNFTModal
          nft={selectedNFT}
          onClose={handleCloseBuyModal}
        />
      )}
    </div>
  )
} 