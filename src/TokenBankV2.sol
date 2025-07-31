// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./TokenBank.sol";
import "./MyTokenExtended.sol";

contract TokenBankV2 is TokenBank {
    // 事件
    event TokensReceived(address indexed sender, address indexed recipient, uint256 amount, bytes data);
    
    // 支持的扩展 Token 映射
    mapping(address => bool) public supportedTokens;
    
    /**
     * @dev 添加支持的 Token
     * @param token Token 合约地址
     */
    function addSupportedToken(address token) external {
        // 这里可以添加权限控制
        supportedTokens[token] = true;
    }
    
    /**
     * @dev 移除支持的 Token
     * @param token Token 合约地址
     */
    function removeSupportedToken(address token) external {
        // 这里可以添加权限控制
        supportedTokens[token] = false;
    }
    
    function tokensReceived(
        address sender,
        address recipient,
        uint256 amount,
        bytes calldata data
    ) external {
        // 确保只有支持的 Token 合约才能调用此函数
        require(supportedTokens[msg.sender], "Token not supported");
        require(recipient == address(this), "Invalid recipient");
        
        // 记录用户的存款
        deposits[sender] += amount;
        
        emit TokensReceived(sender, recipient, amount, data);
        emit Deposited(sender, amount);
    }
    
    /**
     * @dev 支持扩展 Token 的存款函数
     * 用户可以直接调用 transferWithCallback 将 Token 存入
     * @param token 扩展 Token 合约地址
     * @param amount 存入数量
     * @param data 额外数据
     */
    function depositWithCallback(
        address token,
        uint256 amount,
        bytes calldata data
    ) external {
        require(token != address(0), "Token address cannot be zero");
        require(amount > 0, "Amount must be greater than zero");
        
        // 调用扩展 Token 的 transferWithCallback 函数
        MyTokenExtended(token).transferWithCallback(address(this), amount, data);
        
        // 注意：实际的存款记录在 tokensReceived 回调中完成
    }
    
    /**
     * @dev 查询合约是否支持特定的 Token
     * @param token Token 合约地址
     * @return 是否支持
     */
    function isSupportedToken(address token) external view returns (bool) {
        return supportedTokens[token];
    }
} 