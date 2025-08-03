import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Web3Button } from '@web3modal/wagmi/react'

import { 
  Store, 
  Image, 
  Plus, 
  Shield, 
  Zap, 
  Users, 
  ArrowRight,
  Wallet,
  Coins,
  Globe
} from 'lucide-react'

export function Home() {
  const { isConnected } = useAccount()

  const features = [
    {
      icon: Store,
      title: 'NFT市场',
      description: '浏览和交易各种独特的NFT作品，支持多种ERC20代币支付。',
      href: '/marketplace'
    },
    {
      icon: Image,
      title: '我的收藏',
      description: '管理您的NFT收藏，查看您的数字资产。',
      href: '/my-nfts'
    },
    {
      icon: Plus,
      title: '创建NFT',
      description: '轻松创建和铸造您自己的NFT作品。',
      href: '/create'
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: '安全可靠',
      description: '基于智能合约的安全交易，确保资产安全。'
    },
    {
      icon: Zap,
      title: '快速交易',
      description: '高效的区块链交易，快速完成NFT买卖。'
    },
    {
      icon: Coins,
      title: '多代币支持',
      description: '支持多种ERC20代币，灵活的支付方式。'
    },
    {
      icon: Users,
      title: '用户友好',
      description: '直观的界面设计，简单易用的操作体验。'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              下一代
              <span className="text-primary-600"> NFT 市场</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              支持任意ERC20代币支付的现代化NFT交易平台。
              安全、高效、用户友好的数字资产交易体验。
            </p>
            
                         {!isConnected ? (
               <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                 <Web3Button />
                 <Link
                   to="/marketplace"
                   className="btn-secondary flex items-center space-x-2"
                 >
                   <span>浏览市场</span>
                   <ArrowRight className="w-4 h-4" />
                 </Link>
               </div>
             ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/marketplace"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Store className="w-5 h-5" />
                  <span>开始交易</span>
                </Link>
                <Link
                  to="/create"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>创建NFT</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              探索我们的功能
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              发现NFT市场的无限可能，体验创新的数字资产交易方式。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.title}
                  to={feature.href}
                  className="card hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
                    <span>了解更多</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              为什么选择我们
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              我们致力于为用户提供最佳的NFT交易体验。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              准备开始您的NFT之旅？
            </h2>
            <p className="text-xl mb-8 opacity-90">
              连接钱包，开始探索数字艺术的世界。
            </p>
                         {!isConnected ? (
               <Web3Button />
             ) : (
              <Link
                to="/marketplace"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100"
              >
                浏览市场
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
} 