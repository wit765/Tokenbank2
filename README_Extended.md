# TokenBank 扩展功能说明

## 概述

本项目扩展了原有的 TokenBank 功能，添加了支持 ERC20 扩展 Token 的版本。

## 合约说明

### 1. MyTokenExtended.sol
扩展的 ERC20 Token 合约，支持 `tokensReceived` 回调机制。

**主要功能：**
- `transferWithCallback(address to, uint256 amount, bytes calldata data)`: 带回调的转账函数
- `transferFromWithCallback(address from, address to, uint256 amount, bytes calldata data)`: 带回调的授权转账函数

### 2. TokenBankV2.sol
继承自 TokenBank 的升级版本，支持扩展 Token 的自动存款。

**主要功能：**
- `tokensReceived()`: 实现 ERC20 扩展的回调接口
- `depositWithCallback()`: 支持扩展 Token 的存款函数
- `addSupportedToken()` / `removeSupportedToken()`: 管理支持的 Token
- `isSupportedToken()`: 查询 Token 是否被支持

## 使用方式

### 方式一：直接使用 transferWithCallback
```solidity
// 用户直接调用扩展 Token 的 transferWithCallback
myTokenExtended.transferWithCallback(
    address(tokenBankV2), 
    100 * 10**18, 
    "deposit data"
);
```

### 方式二：通过 TokenBankV2 的 depositWithCallback
```solidity
// 用户调用 TokenBankV2 的 depositWithCallback
tokenBankV2.depositWithCallback(
    address(myTokenExtended), 
    100 * 10**18, 
    "deposit data"
);
```

## 工作流程

1. **Token 支持管理**：首先需要将扩展 Token 添加到 TokenBankV2 的支持列表中
2. **自动存款**：用户使用 `transferWithCallback` 转账到 TokenBankV2 时，会自动触发 `tokensReceived` 回调
3. **存款记录**：在回调中自动记录用户的存款
4. **正常取款**：用户可以使用原有的 `withdraw` 函数取出存款

## 安全特性

- **Token 白名单**：只有添加到支持列表的 Token 才能触发回调
- **回调验证**：确保只有合约地址才能接收回调
- **重入保护**：继承自 TokenBank 的重入保护机制

## 测试

运行测试命令：
```bash
forge test --match-contract TokenBankV2Test -vv
```

## 部署

运行部署脚本：
```bash
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
``` 