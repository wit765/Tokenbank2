import { Routes, Route } from 'react-router-dom'
import { Web3Modal } from '@web3modal/wagmi/react'
import { WagmiProvider } from './providers/WagmiProvider'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { Marketplace } from './pages/Marketplace'
import { MyNFTs } from './pages/MyNFTs'
import { CreateNFT } from './pages/CreateNFT'
import { Footer } from './components/Footer'

function App() {
  return (
    <WagmiProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/my-nfts" element={<MyNFTs />} />
            <Route path="/create" element={<CreateNFT />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Web3Modal />
    </WagmiProvider>
  )
}

export default App 