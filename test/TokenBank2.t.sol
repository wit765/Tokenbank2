// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/TokenBank2.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() ERC20("TestToken", "TT") {
        _mint(msg.sender, 1_000_000 ether);
    }
}

contract TokenBank2Test is Test {
    // 重新声明 TokenBank2 中定义的自定义错误
    error OwnableUnauthorizedAccount(address account);

    TokenBank2 public tokenBank;
    TestToken public token;

    address public user = address(0x1234);
    address public owner;

    function setUp() public {
        owner = msg.sender;

        // 部署模拟 ERC20 代币合约
        token = new TestToken();

        // 部署 TokenBank2 合约，传入代币地址
        tokenBank = new TokenBank2(address(token));

        // 给 user 转账 1000 代币
        token.transfer(user, 1000 ether);

        // user 授权 tokenBank 合约花费代币
        vm.startPrank(user);
        token.approve(address(tokenBank), type(uint256).max);
        vm.stopPrank();
    }

    function testDeposit() public {
        vm.startPrank(user);

        tokenBank.deposit(100 ether);

        uint256 balance = tokenBank.balanceOf(user);
        assertEq(balance, 100 ether);

        vm.stopPrank();
    }

    function testWithdraw() public {
        vm.startPrank(user);

        tokenBank.deposit(200 ether);
        tokenBank.withdraw(50 ether);

        uint256 balance = tokenBank.balanceOf(user);
        assertEq(balance, 150 ether);

        vm.stopPrank();
    }

    function testWithdrawInsufficientBalance() public {
        vm.startPrank(user);

        tokenBank.deposit(30 ether);

        vm.expectRevert("Insufficient balance");
        tokenBank.withdraw(40 ether);

        vm.stopPrank();
    }

    function testEmergencyWithdrawToken() public {
        // 给合约转入 500 token
        token.transfer(address(tokenBank), 500 ether);

        uint256 ownerBalanceBefore = token.balanceOf(owner);
        uint256 contractBalanceBefore = token.balanceOf(address(tokenBank));

        tokenBank.emergencyWithdrawToken(owner, 200 ether);

        uint256 ownerBalanceAfter = token.balanceOf(owner);
        uint256 contractBalanceAfter = token.balanceOf(address(tokenBank));

        assertEq(ownerBalanceAfter, ownerBalanceBefore + 200 ether);
        assertEq(contractBalanceAfter, contractBalanceBefore - 200 ether);
    }

    function testEmergencyWithdrawTokenOnlyOwner() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(OwnableUnauthorizedAccount.selector, user));
        tokenBank.emergencyWithdrawToken(user, 1 ether);
    }
}
