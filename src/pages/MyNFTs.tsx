import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Web3Button } from '@web3modal/wagmi/react'

import { 
  Plus, 
  Upload, 
  Grid, 
  List,
  Settings,
  ExternalLink
} from 'lucide-react'
import { NFTCard } from '@/components/NFTCard'

// 模拟用户的NFT数据
const mockMyNFTs = [
  {
    id: 1,
    name: "My Cosmic Dreamer #001",
    description: "A beautiful cosmic artwork representing dreams and aspirations",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
    price: "0.1",
    paymentToken: "TK1",
    seller: "0x1234...5678",
    tokenId: 1,
    nftContract: "0x...",
    isLiked: false,
    isListed: false
  },
  {
    id: 2,
    name: "My Digital Landscape #042",
    description: "A serene digital landscape with vibrant colors",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    price: "0.25",
    paymentToken: "TK2",
    seller: "0x8765...4321",
    tokenId: 2,
    nftContract: "0x...",
    isLiked: true,
    isListed: true
  }
]

export function MyNFTs() {
  const { isConnected, address } = useAccount()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | 'listed' | 'unlisted'>('all')
  const [myNFTs] = useState(mockMyNFTs)

  const filteredNFTs = myNFTs.filter(nft => {
    if (filter === 'listed') return nft.isListed
    if (filter === 'unlisted') return !nft.isListed
    return true
  })

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            连接钱包以查看您的NFT
          </h1>
          <p className="text-gray-600 mb-8">
            请连接您的钱包以管理您的NFT收藏。
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">我的 NFT</h1>
              <p className="text-gray-600">
                管理您的NFT收藏，上架或下架您的数字资产
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="btn-secondary flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>导入NFT</span>
              </button>
              <button className="btn-primary flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>创建NFT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总NFT数量</p>
                <p className="text-2xl font-bold text-gray-900">{myNFTs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">{myNFTs.length}</span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已上架</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myNFTs.filter(nft => nft.isListed).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">
                  {myNFTs.filter(nft => nft.isListed).length}
                </span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">未上架</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myNFTs.filter(nft => !nft.isListed).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-bold">
                  {myNFTs.filter(nft => !nft.isListed).length}
                </span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">钱包地址</p>
                <p className="text-sm font-mono text-gray-900 truncate">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                全部 ({myNFTs.length})
              </button>
              <button
                onClick={() => setFilter('listed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'listed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                已上架 ({myNFTs.filter(nft => nft.isListed).length})
              </button>
              <button
                onClick={() => setFilter('unlisted')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'unlisted'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                未上架 ({myNFTs.filter(nft => !nft.isListed).length})
              </button>
            </div>

            {/* View Controls */}
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
                onBuy={() => {}} // 自己的NFT不需要购买功能
                isOwner={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? '您还没有NFT' : `没有${filter === 'listed' ? '已上架' : '未上架'}的NFT`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? '开始创建或购买您的第一个NFT吧！'
                : `您当前没有${filter === 'listed' ? '已上架' : '未上架'}的NFT。`
              }
            </p>
            {filter === 'all' && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="btn-primary flex items-center justify-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>创建NFT</span>
                </button>
                <button className="btn-secondary flex items-center justify-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>浏览市场</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 