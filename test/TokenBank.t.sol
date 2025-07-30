// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/TokenBank.sol";
import "../src/MyToken.sol";

contract TokenBankTest is Test {
    TokenBank public tokenBank;
    MyToken public myToken;
    
    address public alice = address(1);
    address public bob = address(2);
    
    function setUp() public {
        tokenBank = new TokenBank();
        myToken = new MyToken();
        
        // 给测试用户一些 Token
        myToken.transfer(alice, 1000 * 10**18);
        myToken.transfer(bob, 1000 * 10**18);
    }
    
    function testDeposit() public {
        uint256 depositAmount = 100 * 10**18;
        
        vm.startPrank(alice);
        myToken.approve(address(tokenBank), depositAmount);
        tokenBank.deposit(address(myToken), depositAmount);
        vm.stopPrank();
        
        assertEq(tokenBank.deposits(alice), depositAmount);
        assertEq(myToken.balanceOf(address(tokenBank)), depositAmount);
    }
    
    function testWithdraw() public {
        uint256 depositAmount = 100 * 10**18;
        uint256 withdrawAmount = 50 * 10**18;
        
        // 先存入
        vm.startPrank(alice);
        myToken.approve(address(tokenBank), depositAmount);
        tokenBank.deposit(address(myToken), depositAmount);
        
        // 再取出
        tokenBank.withdraw(address(myToken), withdrawAmount);
        vm.stopPrank();
        
        assertEq(tokenBank.deposits(alice), depositAmount - withdrawAmount);
        assertEq(myToken.balanceOf(alice), 1000 * 10**18 - depositAmount + withdrawAmount);
    }
    
    function testCannotWithdrawMoreThanDeposited() public {
        uint256 depositAmount = 100 * 10**18;
        uint256 withdrawAmount = 150 * 10**18;
        
        vm.startPrank(alice);
        myToken.approve(address(tokenBank), depositAmount);
        tokenBank.deposit(address(myToken), depositAmount);
        
        vm.expectRevert("Insufficient balance");
        tokenBank.withdraw(address(myToken), withdrawAmount);
        vm.stopPrank();
    }
    
    function testGetBalance() public {
        uint256 depositAmount = 100 * 10**18;
        
        vm.startPrank(alice);
        myToken.approve(address(tokenBank), depositAmount);
        tokenBank.deposit(address(myToken), depositAmount);
        vm.stopPrank();
        
        assertEq(tokenBank.getBalance(alice), depositAmount);
        assertEq(tokenBank.getBalance(bob), 0);
    }
    
    function testGetTokenBalance() public {
        uint256 depositAmount = 100 * 10**18;
        
        vm.startPrank(alice);
        myToken.approve(address(tokenBank), depositAmount);
        tokenBank.deposit(address(myToken), depositAmount);
        vm.stopPrank();
        
        assertEq(tokenBank.getTokenBalance(address(myToken)), depositAmount);
    }
} 