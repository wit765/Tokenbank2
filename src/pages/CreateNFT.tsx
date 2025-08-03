import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Web3Button } from '@web3modal/wagmi/react'

import { 
  Upload, 
  Image, 
  FileText, 
  Coins,
  Sparkles,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'
import { useMintNFT } from '@/hooks/useContract'
import { SUPPORTED_TOKENS } from '@/config/contracts'

export function CreateNFT() {
  const { isConnected, address } = useAccount()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null as File | null,
    imagePreview: '',
    price: '',
    paymentToken: 'TK1'
  })
  const [step, setStep] = useState<'form' | 'minting' | 'success' | 'error'>('form')
  const [error, setError] = useState('')

  // 铸造NFT
  const { write: mintNFT, isLoading: isMinting } = useMintNFT()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.image) {
      setError('请填写所有必填字段')
      return
    }

    if (parseFloat(formData.price) <= 0) {
      setError('价格必须大于0')
      return
    }

    setStep('minting')
    setError('')

    try {
      // 这里应该先上传图片到IPFS，然后铸造NFT
      // 为了演示，我们直接调用铸造函数
      mintNFT?.({
        args: [address as `0x${string}`],
        onSuccess: () => {
          setStep('success')
        },
        onError: (err) => {
          setError(err.message)
          setStep('error')
        }
      })
    } catch (err) {
      setError('铸造失败')
      setStep('error')
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      image: null,
      imagePreview: '',
      price: '',
      paymentToken: 'TK1'
    })
    setStep('form')
    setError('')
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            连接钱包以创建NFT
          </h1>
          <p className="text-gray-600 mb-8">
            请连接您的钱包以创建和铸造NFT。
          </p>
                                             <Web3Button />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">创建 NFT</h1>
          <p className="text-gray-600">
            上传您的数字艺术品，设置价格，并在市场上出售
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">NFT 信息</h2>
            
            {step === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="label">NFT 图片 *</label>
                  <div className="mt-1">
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                      <div className="space-y-1 text-center">
                        {formData.imagePreview ? (
                          <div className="relative">
                            <img
                              src={formData.imagePreview}
                              alt="Preview"
                              className="mx-auto h-32 w-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: '' }))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                                <span>上传文件</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="sr-only"
                                  required
                                />
                              </label>
                              <p className="pl-1">或拖拽到此处</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF 最大 10MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="label">NFT 名称 *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="输入NFT名称"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="label">描述 *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="input"
                    placeholder="描述您的NFT..."
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="label">价格 *</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="input flex-1"
                      placeholder="0.0"
                      step="0.01"
                      min="0"
                      required
                    />
                    <select
                      name="paymentToken"
                      value={formData.paymentToken}
                      onChange={handleInputChange}
                      className="input w-32"
                    >
                      {SUPPORTED_TOKENS.map(token => (
                        <option key={token.symbol} value={token.symbol}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isMinting}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isMinting ? '铸造中...' : '创建 NFT'}</span>
                </button>
              </form>
            )}

            {step === 'minting' && (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">正在铸造 NFT</h3>
                <p className="text-gray-600">
                  请稍候，我们正在将您的NFT铸造到区块链上...
                </p>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">NFT 创建成功！</h3>
                <p className="text-gray-600">
                  您的NFT已成功铸造并添加到您的收藏中。
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleReset}
                    className="btn-secondary"
                  >
                    创建另一个
                  </button>
                  <button
                    onClick={() => window.location.href = '/my-nfts'}
                    className="btn-primary"
                  >
                    查看我的NFT
                  </button>
                </div>
              </div>
            )}

            {step === 'error' && (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">创建失败</h3>
                <p className="text-gray-600">
                  {error || '创建NFT时出现错误，请重试。'}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep('form')}
                    className="btn-secondary"
                  >
                    重试
                  </button>
                  <button
                    onClick={handleReset}
                    className="btn-primary"
                  >
                    重新开始
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">预览</h2>
            
            {formData.imagePreview ? (
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={formData.imagePreview}
                    alt="NFT Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {formData.name || 'NFT 名称'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formData.description || 'NFT 描述'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">价格</span>
                    <span className="font-semibold text-gray-900">
                      {formData.price ? `${formData.price} ${formData.paymentToken}` : '未设置'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">上传图片以查看预览</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 