import { Link, useLocation } from 'react-router-dom'
import { useAccount, useDisconnect } from 'wagmi'
import { Web3Button } from '@web3modal/wagmi/react'
import { Wallet, Home, Store, Image, Plus } from 'lucide-react'

export function Header() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const location = useLocation()

  const navigation = [
    { name: '首页', href: '/', icon: Home },
    { name: '市场', href: '/marketplace', icon: Store },
    { name: '我的NFT', href: '/my-nfts', icon: Image },
    { name: '创建NFT', href: '/create', icon: Plus },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NFT Market</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <button
                  onClick={() => disconnect()}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  断开连接
                </button>
              </div>
            ) : (
              <Web3Button />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
} 