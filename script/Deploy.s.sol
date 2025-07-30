// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/TokenBank.sol";
import "../src/TokenBankV2.sol";
import "../src/MyToken.sol";
import "../src/MyTokenExtended.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 部署 MyToken
        MyToken myToken = new MyToken();
        console.log("MyToken deployed at:", address(myToken));

        // 部署 MyTokenExtended
        MyTokenExtended myTokenExtended = new MyTokenExtended();
        console.log("MyTokenExtended deployed at:", address(myTokenExtended));

        // 部署 TokenBank
        TokenBank tokenBank = new TokenBank();
        console.log("TokenBank deployed at:", address(tokenBank));

        // 部署 TokenBankV2
        TokenBankV2 tokenBankV2 = new TokenBankV2();
        console.log("TokenBankV2 deployed at:", address(tokenBankV2));

        // 将扩展 Token 添加到 TokenBankV2 的支持列表
        tokenBankV2.addSupportedToken(address(myTokenExtended));
        console.log("MyTokenExtended added to TokenBankV2 supported tokens");

        vm.stopBroadcast();
    }
} 