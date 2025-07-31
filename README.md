# NFT Market with ERC20 Payment Support

这是一个支持任意ERC20代币支付的NFT市场合约项目。

## 功能特性

### 核心功能
- **支持任意ERC20代币定价**: 卖家可以使用任何支持的ERC20代币为NFT定价
- **ERC20代币支付**: 买家可以使用指定的ERC20代币购买NFT
- **安全交易**: 使用ReentrancyGuard防止重入攻击
- **暂停机制**: 支持紧急暂停和恢复市场功能
- **权限管理**: 只有合约所有者可以添加/移除支持的代币

### 主要合约

#### NFTMarket.sol
主要的NFT市场合约，包含以下功能：
- `list()`: 上架NFT，指定支付代币和价格
- `buyNFT()`: 购买NFT
- `delist()`: 下架NFT
- `updatePrice()`: 更新NFT价格和支付代币
- `addSupportedToken()`: 添加支持的支付代币
- `removeSupportedToken()`: 移除支持的支付代币

#### SimpleNFT.sol
简单的ERC721 NFT合约，用于测试：
- `mint()`: 铸造单个NFT
- `mintMultiple()`: 批量铸造NFT
- `getCurrentTokenId()`: 获取当前tokenId

#### TestToken.sol
测试用的ERC20代币合约：
- `mint()`: 铸造代币
- `mintMultiple()`: 批量铸造代币

## 测试覆盖

### 上架NFT测试
- ✅ 成功上架NFT
- ✅ NFT合约地址为零
- ✅ 支付代币地址为零
- ✅ 不支持的代币
- ✅ 价格为零
- ✅ 非NFT所有者
- ✅ NFT未授权
- ✅ NFT已上架

### 购买NFT测试
- ✅ 成功购买NFT
- ✅ NFT未上架
- ✅ 购买自己的NFT
- ✅ 代币余额不足
- ✅ 代币授权不足
- ✅ NFT已被购买

### 模糊测试
- ✅ 随机价格范围(0.01-10000 tokens)
- ✅ 随机买家地址

### 不可变测试
- ✅ 市场合约无代币余额
- ✅ 多次交易后仍无代币余额

### 其他功能测试
- ✅ 下架NFT
- ✅ 更新价格
- ✅ 暂停/恢复功能

## 安装和运行

### 前置要求
- Foundry (forge)
- Git

### 安装依赖
```bash
forge install
```

### 编译合约
```bash
forge build
```

### 运行测试
```bash
# 运行所有测试
forge test

# 运行NFT市场测试
forge test --match-contract NFTMarketTest

# 运行详细测试输出
forge test --match-contract NFTMarketTest -vv

# 运行测试并生成报告
forge test --match-contract NFTMarketTest --gas-report
```

### 运行特定测试
```bash
# 运行上架测试
forge test --match-test test_ListNFT

# 运行购买测试
forge test --match-test test_BuyNFT

# 运行模糊测试
forge test --match-test test_Fuzz

# 运行不可变测试
forge test --match-test test_Invariant
```

## 合约架构

### Listing结构体
```solidity
struct Listing {
    address seller;        // 卖家地址
    address nftContract;   // NFT合约地址
    uint256 tokenId;       // NFT的tokenId
    address paymentToken;  // 支付代币地址
    uint256 price;         // 价格
    bool isActive;         // 是否活跃
    uint256 listingTime;   // 上架时间
}
```

### 主要事件
- `NFTListed`: NFT上架事件
- `NFTSold`: NFT销售事件
- `NFTDelisted`: NFT下架事件
- `TokensReceived`: 代币接收事件

## 安全特性

1. **重入攻击防护**: 使用ReentrancyGuard
2. **暂停机制**: 支持紧急暂停
3. **权限控制**: 只有所有者可以管理支持的代币
4. **余额检查**: 购买前检查代币余额和授权
5. **零地址检查**: 防止零地址操作
6. **状态验证**: 确保NFT状态正确

## 使用示例

### 1. 部署合约
```solidity
NFTMarket market = new NFTMarket();
SimpleNFT nft = new SimpleNFT();
TestToken token = new TestToken("Test", "TST");
```

### 2. 添加支持的代币
```solidity
market.addSupportedToken(address(token));
```

### 3. 上架NFT
```solidity
// 授权市场合约操作NFT
nft.approve(address(market), tokenId);
// 上架NFT，使用token代币，价格100
market.list(address(nft), tokenId, address(token), 100 * 10**18);
```

### 4. 购买NFT
```solidity
// 授权市场合约操作代币
token.approve(address(market), price);
// 购买NFT
market.buyNFT(address(nft), tokenId);
```

## 许可证

MIT License
