# TokenBank V2 - ERC20 Extension Support

## 项目概述

TokenBank V2 是一个支持 ERC20 扩展 Token 的智能合约银行系统，允许用户通过回调机制自动存款。

## 功能特性

- **ERC20 扩展支持**: 支持带有 `tokensReceived` 回调的扩展 ERC20 Token
- **自动存款**: 用户转账时自动触发存款记录
- **Token 白名单**: 只有授权的 Token 才能使用回调功能
- **重入保护**: 内置安全机制防止重入攻击
- **完整测试**: 包含全面的测试用例

## 合约架构

### 核心合约

1. **TokenBank.sol** - 基础银行合约
   - 标准存款/取款功能
   - 重入保护
   - 余额查询

2. **TokenBankV2.sol** - 扩展银行合约
   - 继承自 TokenBank
   - 支持 ERC20 扩展回调
   - Token 白名单管理

3. **MyTokenExtended.sol** - 扩展 ERC20 Token
   - 标准 ERC20 功能
   - `transferWithCallback` 函数
   - `transferFromWithCallback` 函数

## 安装和运行

### 前置要求

- Foundry
- Node.js (可选，用于依赖管理)

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

# 运行特定测试
forge test --match-contract TokenBankV2Test -vv
```

### 部署合约

```bash
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
```

## 使用方式

### 1. 直接使用 transferWithCallback

```solidity
// 用户直接调用扩展 Token 的 transferWithCallback
myTokenExtended.transferWithCallback(
    address(tokenBankV2), 
    100 * 10**18, 
    "deposit data"
);
```

### 2. 通过 TokenBankV2 的 depositWithCallback

```solidity
// 用户调用 TokenBankV2 的 depositWithCallback
tokenBankV2.depositWithCallback(
    address(myTokenExtended), 
    100 * 10**18, 
    "deposit data"
);
```

## 工作流程

1. **Token 支持管理**: 首先需要将扩展 Token 添加到 TokenBankV2 的支持列表中
2. **自动存款**: 用户使用 `transferWithCallback` 转账到 TokenBankV2 时，会自动触发 `tokensReceived` 回调
3. **存款记录**: 在回调中自动记录用户的存款
4. **正常取款**: 用户可以使用原有的 `withdraw` 函数取出存款

## 安全特性

- **Token 白名单**: 只有添加到支持列表的 Token 才能触发回调
- **回调验证**: 确保只有合约地址才能接收回调
- **重入保护**: 继承自 TokenBank 的重入保护机制
- **权限控制**: 可扩展的权限管理系统

## 测试覆盖

项目包含完整的测试用例：

- 基本转账回调测试
- 存款回调测试
- 不支持 Token 的拒绝测试
- Token 支持状态查询测试
- 取款功能测试
- 授权转账回调测试

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

- GitHub: [wit765](https://github.com/wit765)
- 项目地址: [Tokenbankv2](https://github.com/wit765/Tokenbankv2/)
