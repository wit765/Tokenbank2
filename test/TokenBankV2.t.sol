// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/TokenBankV2.sol";
import "../src/MyTokenExtended.sol";

contract TokenBankV2Test is Test {
    TokenBankV2 public tokenBankV2;
    MyTokenExtended public myTokenExtended;
    
    address public alice = address(1);
    address public bob = address(2);
    
    function setUp() public {
        tokenBankV2 = new TokenBankV2();
        myTokenExtended = new MyTokenExtended();
        
        // 给测试用户一些 Token
        myTokenExtended.transfer(alice, 1000 * 10**18);
        myTokenExtended.transfer(bob, 1000 * 10**18);
        
        // 将扩展 Token 添加到支持列表
        tokenBankV2.addSupportedToken(address(myTokenExtended));
    }
    
    function testTransferWithCallback() public {
        uint256 transferAmount = 100 * 10**18;
        bytes memory data = "test data";
        
        vm.startPrank(alice);
        myTokenExtended.transferWithCallback(address(tokenBankV2), transferAmount, data);
        vm.stopPrank();
        
        assertEq(tokenBankV2.deposits(alice), transferAmount);
        assertEq(myTokenExtended.balanceOf(address(tokenBankV2)), transferAmount);
    }
    
    function testDepositWithCallback() public {
        uint256 depositAmount = 100 * 10**18;
        bytes memory data = "deposit data";
        
        vm.startPrank(alice);
        tokenBankV2.depositWithCallback(address(myTokenExtended), depositAmount, data);
        vm.stopPrank();
        
        assertEq(tokenBankV2.deposits(alice), depositAmount);
        assertEq(myTokenExtended.balanceOf(address(tokenBankV2)), depositAmount);
    }
    
    function testCannotTransferToUnsupportedToken() public {
        // 移除支持的 Token
        tokenBankV2.removeSupportedToken(address(myTokenExtended));
        
        uint256 transferAmount = 100 * 10**18;
        bytes memory data = "test data";
        
        vm.startPrank(alice);
        vm.expectRevert("Token not supported");
        myTokenExtended.transferWithCallback(address(tokenBankV2), transferAmount, data);
        vm.stopPrank();
    }
    
    function testIsSupportedToken() public {
        assertTrue(tokenBankV2.isSupportedToken(address(myTokenExtended)));
        
        tokenBankV2.removeSupportedToken(address(myTokenExtended));
        assertFalse(tokenBankV2.isSupportedToken(address(myTokenExtended)));
    }
    
    function testWithdrawAfterCallback() public {
        uint256 depositAmount = 100 * 10**18;
        uint256 withdrawAmount = 50 * 10**18;
        bytes memory data = "test data";
        
        // 先通过回调存入
        vm.startPrank(alice);
        myTokenExtended.transferWithCallback(address(tokenBankV2), depositAmount, data);
        
        // 再取出
        tokenBankV2.withdraw(address(myTokenExtended), withdrawAmount);
        vm.stopPrank();
        
        assertEq(tokenBankV2.deposits(alice), depositAmount - withdrawAmount);
        assertEq(myTokenExtended.balanceOf(alice), 1000 * 10**18 - depositAmount + withdrawAmount);
    }
    
    function testTransferFromWithCallback() public {
        uint256 transferAmount = 100 * 10**18;
        bytes memory data = "test data";
        
        vm.startPrank(alice);
        myTokenExtended.approve(bob, transferAmount);
        vm.stopPrank();
        
        vm.startPrank(bob);
        myTokenExtended.transferFromWithCallback(alice, address(tokenBankV2), transferAmount, data);
        vm.stopPrank();
        
        assertEq(tokenBankV2.deposits(alice), transferAmount);
        assertEq(myTokenExtended.balanceOf(address(tokenBankV2)), transferAmount);
    }
} 