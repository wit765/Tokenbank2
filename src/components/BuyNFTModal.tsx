import { useState } from 'react'
import { X, ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useBuyNFT, useTokenBalance, useApproveToken } from '@/hooks/useContract'
import { parseEther, formatEther } from 'viem'
import { SUPPORTED_TOKENS } from '@/config/contracts'

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
}

interface BuyNFTModalProps {
  nft: NFT
  onClose: () => void
}

export function BuyNFTModal({ nft, onClose }: BuyNFTModalProps) {
  const { address } = useAccount()
  const [step, setStep] = useState<'confirm' | 'approve' | 'buy' | 'success' | 'error'>('confirm')
  const [error, setError] = useState('')

  // 获取支付代币信息
  const paymentToken = SUPPORTED_TOKENS.find(token => token.symbol === nft.paymentToken)
  
  // 获取用户代币余额
  const { data: tokenBalance } = useTokenBalance(
    paymentToken?.address || '',
    address || ''
  )

  // 购买NFT
  const { write: buyNFT, isLoading: isBuying } = useBuyNFT()
  
  // 授权代币
  const { write: approveToken, isLoading: isApproving } = useApproveToken(
    paymentToken?.address || ''
  )

  const handleBuy = async () => {
    if (!address || !paymentToken) return

    const priceInWei = parseEther(nft.price)
    
    // 检查余额
    if (tokenBalance && tokenBalance < priceInWei) {
      setError('代币余额不足')
      setStep('error')
      return
    }

    try {
      // 先授权代币
      setStep('approve')
      approveToken?.({
        args: [
          '0x...', // NFT Market合约地址
          priceInWei
        ],
        onSuccess: () => {
          setStep('buy')
          // 购买NFT
          buyNFT?.({
            args: [
              nft.nftContract as `0x${string}`,
              BigInt(nft.tokenId)
            ],
            onSuccess: () => {
              setStep('success')
            },
            onError: (err) => {
              setError(err.message)
              setStep('error')
            }
          })
        },
        onError: (err) => {
          setError(err.message)
          setStep('error')
        }
      })
    } catch (err) {
      setError('交易失败')
      setStep('error')
    }
  }

  const handleClose = () => {
    if (step === 'success') {
      onClose()
    } else if (step !== 'buy' && step !== 'approve') {
      onClose()
    }
  }

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0'
    return formatEther(balance)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">购买 NFT</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'confirm' && (
            <div className="space-y-4">
              {/* NFT Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{nft.name}</h3>
                  <p className="text-sm text-gray-600">Token ID: {nft.tokenId}</p>
                </div>
              </div>

              {/* Price Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">价格</span>
                  <span className="font-semibold text-gray-900">
                    {nft.price} {nft.paymentToken}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">您的余额</span>
                  <span className="text-sm text-gray-600">
                    {formatBalance(tokenBalance)} {nft.paymentToken}
                  </span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="text-sm text-gray-600">
                <span>卖家: {nft.seller}</span>
              </div>

              {/* Action */}
              <button
                onClick={handleBuy}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>确认购买</span>
              </button>
            </div>
          )}

          {step === 'approve' && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">授权代币</h3>
              <p className="text-gray-600">
                正在授权市场合约使用您的 {nft.paymentToken} 代币...
              </p>
            </div>
          )}

          {step === 'buy' && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">购买中</h3>
              <p className="text-gray-600">
                正在处理您的购买交易，请稍候...
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">购买成功！</h3>
              <p className="text-gray-600">
                您已成功购买 {nft.name}，NFT 已转移到您的钱包。
              </p>
              <button
                onClick={handleClose}
                className="btn-primary"
              >
                完成
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">购买失败</h3>
              <p className="text-gray-600">
                {error || '交易过程中出现错误，请重试。'}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('confirm')}
                  className="btn-secondary"
                >
                  重试
                </button>
                <button
                  onClick={handleClose}
                  className="btn-primary"
                >
                  关闭
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 