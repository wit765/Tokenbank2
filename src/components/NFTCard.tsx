import { useState } from 'react'
import { Heart, ShoppingCart, Eye, MoreVertical } from 'lucide-react'

interface NFT {
  id: number
  name: string
  description: string
  image: string
  price: string
  paymentToken: string
  seller: string
  tokenId: number
  nftContract: string
  isLiked: boolean
}

interface NFTCardProps {
  nft: NFT
  viewMode: 'grid' | 'list'
  onBuy: () => void
  isOwner: boolean
}

export function NFTCard({ nft, viewMode, onBuy, isOwner }: NFTCardProps) {
  const [isLiked, setIsLiked] = useState(nft.isLiked)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  if (viewMode === 'list') {
    return (
      <div className="card hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              src={nft.image}
              alt={nft.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {nft.name}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {nft.description}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-500">
                卖家: {nft.seller}
              </span>
              <span className="text-sm text-gray-500">
                Token ID: {nft.tokenId}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {nft.price} {nft.paymentToken}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleLike}
                className={`p-2 rounded-lg transition-colors ${
                  isLiked
                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              {!isOwner && (
                <button
                  onClick={onBuy}
                  className="btn-primary flex items-center space-x-1"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>购买</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300 group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
        
        {/* Overlay Actions */}
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <button
            onClick={handleLike}
            className={`p-2 rounded-full transition-colors ${
              isLiked
                ? 'text-red-500 bg-white shadow-lg'
                : 'text-white bg-black bg-opacity-50 hover:bg-opacity-70'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 rounded-full text-white bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Buy Button Overlay */}
        {!isOwner && (
          <div className="absolute bottom-3 left-3 right-3">
            <button
              onClick={onBuy}
              className="w-full btn-primary flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>购买 {nft.price} {nft.paymentToken}</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
          {nft.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {nft.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {nft.price} {nft.paymentToken}
            </div>
            <div className="text-sm text-gray-500">
              卖家: {nft.seller}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              #{nft.tokenId}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 