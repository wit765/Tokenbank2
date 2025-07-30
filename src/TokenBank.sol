// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TokenBank is ReentrancyGuard {
    // 存储每个地址的存款数量
    mapping(address => uint256) public deposits;
    
    // 事件
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    
    /**
     * @dev 存入 Token 到银行
     * @param token 要存入的 Token 合约地址
     * @param amount 存入数量
     */
    function deposit(address token, uint256 amount) external nonReentrant {
        require(token != address(0), "Token address cannot be zero");
        require(amount > 0, "Amount must be greater than zero");
        
        // 从用户转移 Token 到合约
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        // 记录用户的存款
        deposits[msg.sender] += amount;
        
        emit Deposited(msg.sender, amount);
    }
    
    /**
     * @dev 从银行取出 Token
     * @param token 要取出的 Token 合约地址
     * @param amount 取出数量
     */
    function withdraw(address token, uint256 amount) external nonReentrant {
        require(token != address(0), "Token address cannot be zero");
        require(amount > 0, "Amount must be greater than zero");
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        
        // 更新用户的存款记录
        deposits[msg.sender] -= amount;
        
        // 从合约转移 Token 给用户
        IERC20(token).transfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }
    
    /**
     * @dev 查询用户的存款余额
     * @param user 用户地址
     * @return 存款余额
     */
    function getBalance(address user) external view returns (uint256) {
        return deposits[user];
    }
    
    /**
     * @dev 查询合约中特定 Token 的余额
     * @param token Token 合约地址
     * @return Token 余额
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
