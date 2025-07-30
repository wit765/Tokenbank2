// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// ERC20 扩展接口，定义 tokensReceived 回调
interface IERC20Receiver {
    function tokensReceived(
        address sender,
        address recipient,
        uint256 amount,
        bytes calldata data
    ) external;
}

contract MyTokenExtended is ERC20 {
    constructor() ERC20("MyTokenExtended", "MTKE") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    /**
     * @dev 带回调的转账函数
     * @param to 接收地址
     * @param amount 转账数量
     * @param data 额外数据
     * @return 是否成功
     */
    function transferWithCallback(
        address to,
        uint256 amount,
        bytes calldata data
    ) external returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(amount > 0, "Transfer amount must be greater than zero");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // 执行转账
        _transfer(msg.sender, to, amount);
        
        // 如果接收者是合约，调用 tokensReceived 回调
        if (to.code.length > 0) {
            try IERC20Receiver(to).tokensReceived(msg.sender, to, amount, data) {
                // 回调成功
            } catch {
                // 如果回调失败，回滚转账
                revert("TokensReceived callback failed");
            }
        }
        
        return true;
    }
    
    /**
     * @dev 带回调的转账函数（从指定地址转账）
     * @param from 发送地址
     * @param to 接收地址
     * @param amount 转账数量
     * @param data 额外数据
     * @return 是否成功
     */
    function transferFromWithCallback(
        address from,
        address to,
        uint256 amount,
        bytes calldata data
    ) external returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(amount > 0, "Transfer amount must be greater than zero");
        require(balanceOf(from) >= amount, "Insufficient balance");
        require(allowance(from, msg.sender) >= amount, "Insufficient allowance");
        
        // 执行转账
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        
        // 如果接收者是合约，调用 tokensReceived 回调
        if (to.code.length > 0) {
            try IERC20Receiver(to).tokensReceived(from, to, amount, data) {
                // 回调成功
            } catch {
                // 如果回调失败，回滚转账
                revert("TokensReceived callback failed");
            }
        }
        
        return true;
    }
} 