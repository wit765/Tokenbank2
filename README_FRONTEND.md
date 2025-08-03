# NFT Market Frontend

这是NFTMarket项目的现代化前端应用，使用React + TypeScript + Tailwind CSS构建，集成了Web3Modal和WalletConnect。

## 功能特性

### 🎨 现代化UI设计
- 响应式设计，支持桌面和移动设备
- 美观的渐变色彩和动画效果
- 直观的用户界面和交互体验

### 🔗 Web3集成
- **WalletConnect v2** 支持多种钱包连接
- **MetaMask** 桌面钱包支持
- **移动端钱包** 支持（需要安装WalletConnect兼容的钱包）
- **多链支持** (Ethereum Mainnet, Sepolia, Arbitrum)

### 🛍️ NFT市场功能
- 浏览和搜索NFT
- 支持多种ERC20代币支付
- 实时价格和余额显示
- 安全的购买流程

### 👤 用户功能
- 连接钱包登录
- 管理个人NFT收藏
- 创建和铸造新NFT
- 上架/下架NFT

## 技术栈

- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Vite** - 构建工具
- **Wagmi** - React Hooks for Ethereum
- **Web3Modal** - 钱包连接UI
- **WalletConnect** - 钱包连接协议
- **Viem** - 以太坊客户端

## 安装和设置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置WalletConnect

1. 访问 [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. 创建新项目并获取Project ID
3. 更新 `src/providers/WagmiProvider.tsx` 中的 `projectId`

```typescript
const projectId = 'YOUR_PROJECT_ID' // 替换为你的Project ID
```

### 3. 配置合约地址

更新 `src/config/contracts.ts` 中的合约地址：

```typescript
export const CONTRACTS = {
  sepolia: {
    NFTMarket: '0x...', // 部署后填入实际地址
    SimpleNFT: '0x...', // 部署后填入实际地址
    TestToken1: '0x...', // 部署后填入实际地址
    // ...
  },
  // ...
}
```

### 4. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

## 移动端钱包设置

### 安装移动端钱包

为了使用WalletConnect进行移动端登录，你需要安装支持WalletConnect的钱包应用：

#### iOS用户
- **Rainbow** - 在App Store搜索"Rainbow - Ethereum Wallet"
- **Trust Wallet** - 在App Store搜索"Trust Wallet"
- **MetaMask** - 在App Store搜索"MetaMask"

#### Android用户
- **Rainbow** - 在Google Play搜索"Rainbow - Ethereum Wallet"
- **Trust Wallet** - 在Google Play搜索"Trust Wallet"
- **MetaMask** - 在Google Play搜索"MetaMask"

### 使用WalletConnect登录

1. 在桌面浏览器中打开应用
2. 点击"连接钱包"按钮
3. 选择"WalletConnect"
4. 使用手机扫描二维码
5. 在手机钱包中确认连接

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── Header.tsx      # 页面头部
│   ├── Footer.tsx      # 页面底部
│   ├── NFTCard.tsx     # NFT卡片组件
│   └── BuyNFTModal.tsx # 购买NFT模态框
├── pages/              # 页面组件
│   ├── Home.tsx        # 首页
│   ├── Marketplace.tsx # 市场页面
│   ├── MyNFTs.tsx      # 我的NFT页面
│   └── CreateNFT.tsx   # 创建NFT页面
├── hooks/              # 自定义Hooks
│   └── useContract.ts  # 合约交互Hook
├── providers/          # 上下文提供者
│   └── WagmiProvider.tsx # Web3配置
├── config/             # 配置文件
│   └── contracts.ts    # 合约地址配置
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

## 部署

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

### 部署到Vercel

1. 安装Vercel CLI: `npm i -g vercel`
2. 运行: `vercel`
3. 按照提示完成部署

## 环境变量

创建 `.env.local` 文件：

```env
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
VITE_CHAIN_ID=11155111  # Sepolia测试网
```

## 故障排除

### 常见问题

1. **WalletConnect连接失败**
   - 确保Project ID配置正确
   - 检查网络连接
   - 确保移动端钱包支持WalletConnect

2. **合约交互失败**
   - 检查合约地址配置
   - 确保钱包连接到正确的网络
   - 检查代币余额和授权

3. **移动端扫码无法连接**
   - 确保手机和电脑在同一网络
   - 尝试刷新页面重新生成二维码
   - 检查钱包应用是否支持WalletConnect

### 调试模式

在开发模式下，打开浏览器控制台查看详细错误信息。

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

MIT License 