// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MyTokenExtended.sol";

interface IERC20Receiver {
    function tokensReceived(
        address sender,
        address recipient,
        uint256 amount,
        bytes calldata data
    ) external;
}

contract NFTMarket is IERC20Receiver, ERC721Holder, ReentrancyGuard, Pausable, Ownable {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool isActive;
        uint256 listingTime;
    }
    
    mapping(address => bool) public supportedTokens;
    mapping(address => mapping(uint256 => Listing)) public listings;
    
    address[] public listedNFTContracts;
    uint256[] public listedTokenIds;
    
    event NFTListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price, uint256 listingTime);
    event NFTSold(address indexed seller, address indexed buyer, address indexed nftContract, uint256 tokenId, uint256 price, uint256 saleTime);
    event NFTDelisted(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 delistTime);
    event TokensReceived(address indexed sender, address indexed recipient, uint256 amount, bytes data);
    
    constructor() {
        supportedTokens[address(0)] = false;
    }
    
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Token address cannot be zero");
        supportedTokens[token] = true;
    }
    
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }
    
    function list(address nftContract, uint256 tokenId, uint256 price) external nonReentrant whenNotPaused {
        require(nftContract != address(0), "NFT contract address cannot be zero");
        require(price > 0, "Price must be greater than zero");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "You don't own this NFT");
        require(
            IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) ||
            IERC721(nftContract).getApproved(tokenId) == address(this),
            "NFT not approved for market"
        );
        require(!listings[nftContract][tokenId].isActive, "NFT already listed");
        
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        
        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            isActive: true,
            listingTime: block.timestamp
        });
        
        listedNFTContracts.push(nftContract);
        listedTokenIds.push(tokenId);
        
        emit NFTListed(msg.sender, nftContract, tokenId, price, block.timestamp);
    }
    
    function buyNFT(address nftContract, uint256 tokenId, address tokenAddress) external nonReentrant whenNotPaused {
        require(supportedTokens[tokenAddress], "Token not supported");
        
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.isActive, "NFT not listed for sale");
        require(listing.seller != msg.sender, "Cannot buy your own NFT");
        
        MyTokenExtended(tokenAddress).transferFrom(msg.sender, listing.seller, listing.price);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        
        listing.isActive = false;
        
        emit NFTSold(listing.seller, msg.sender, nftContract, tokenId, listing.price, block.timestamp);
    }
    
    function tokensReceived(address sender, address recipient, uint256 amount, bytes calldata data) external override {
        require(supportedTokens[msg.sender], "Token not supported");
        require(recipient == address(this), "Invalid recipient");
        require(data.length >= 64, "Invalid data length");
        
        (address nftContract, uint256 tokenId) = abi.decode(data, (address, uint256));
        
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.isActive, "NFT not listed for sale");
        require(listing.seller != sender, "Cannot buy your own NFT");
        require(amount >= listing.price, "Insufficient payment amount");
        
        MyTokenExtended(msg.sender).transfer(listing.seller, listing.price);
        
        if (amount > listing.price) {
            MyTokenExtended(msg.sender).transfer(sender, amount - listing.price);
        }
        
        IERC721(nftContract).transferFrom(address(this), sender, tokenId);
        listing.isActive = false;
        
        emit NFTSold(listing.seller, sender, nftContract, tokenId, listing.price, block.timestamp);
        emit TokensReceived(sender, recipient, amount, data);
    }
    
    function delist(address nftContract, uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.isActive, "NFT not listed");
        require(listing.seller == msg.sender, "Only seller can delist");
        
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        listing.isActive = false;
        
        emit NFTDelisted(msg.sender, nftContract, tokenId, block.timestamp);
    }
    
    function updatePrice(address nftContract, uint256 tokenId, uint256 newPrice) external {
        require(newPrice > 0, "Price must be greater than zero");
        
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.isActive, "NFT not listed");
        require(listing.seller == msg.sender, "Only seller can update price");
        
        listing.price = newPrice;
        emit NFTListed(msg.sender, nftContract, tokenId, newPrice, listing.listingTime);
    }
    
    function getListing(address nftContract, uint256 tokenId) external view returns (Listing memory) {
        return listings[nftContract][tokenId];
    }
    
    function getListedCount() external view returns (uint256) {
        return listedNFTContracts.length;
    }
    
    function isSupportedToken(address token) external view returns (bool) {
        return supportedTokens[token];
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
} 