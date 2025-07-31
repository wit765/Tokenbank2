// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleNFT is ERC721, Ownable {
    uint256 private _tokenIds;

    constructor() ERC721("SimpleNFT", "SNFT") Ownable(msg.sender) {}

    function mint(address to) external onlyOwner returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _mint(to, newTokenId);
        return newTokenId;
    }

    function mintMultiple(address to, uint256 count) external onlyOwner {
        for (uint256 i = 0; i < count; i++) {
            _tokenIds++;
            uint256 newTokenId = _tokenIds;
            _mint(to, newTokenId);
        }
    }

    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIds;
    }
} 