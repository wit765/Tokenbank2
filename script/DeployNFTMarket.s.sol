// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/NFTMarket.sol";
import "../src/SimpleNFT.sol";
import "../src/TestToken.sol";

contract DeployNFTMarket is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 部署NFT市场合约
        NFTMarket market = new NFTMarket();
        console.log("NFTMarket deployed at:", address(market));

        // 部署SimpleNFT合约
        SimpleNFT nft = new SimpleNFT();
        console.log("SimpleNFT deployed at:", address(nft));

        // 部署测试代币
        TestToken token1 = new TestToken("Token1", "TK1");
        TestToken token2 = new TestToken("Token2", "TK2");
        TestToken token3 = new TestToken("Token3", "TK3");
        
        console.log("Token1 deployed at:", address(token1));
        console.log("Token2 deployed at:", address(token2));
        console.log("Token3 deployed at:", address(token3));

        // 添加支持的代币
        market.addSupportedToken(address(token1));
        market.addSupportedToken(address(token2));
        market.addSupportedToken(address(token3));
        
        console.log("Supported tokens added to market");

        vm.stopBroadcast();
    }
} 