// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "src/MyToken.sol";
import "src/TokenBank2.sol";

contract Deploy is Script {
    function run() external returns (address, address) {
        vm.startBroadcast();

        MyToken token = new MyToken();
        TokenBank2 bank = new TokenBank2(address(token));

        vm.stopBroadcast();
        return (address(token), address(bank));
    }
} 