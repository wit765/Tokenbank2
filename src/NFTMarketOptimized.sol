// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketOptimized is ERC721Holder, ReentrancyGuard, Pausable, Ownable {
    // 优化1: 使用更紧凑的数据结构
    struct Listing {
        address seller;
        address paymentToken;
        uint96 price;            // 使用 uint96 节省 gas
        uint32 listingTime;      // 使用 uint32 节省 gas
        bool isActive;
    }
    
    mapping(address => bool) public supportedTokens;
    mapping(bytes32 => Listing) public listings; // 使用 keccak256 作为 key
    
    uint256 public totalListings;
    
    // 优化2: 减少事件参数
    event NFTListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price);
    event NFTSold(address indexed seller, address indexed buyer, address indexed nftContract, uint256 tokenId, uint256 price);
    event NFTDelisted(address indexed seller, address indexed nftContract, uint256 indexed tokenId);
    
    constructor() Ownable(msg.sender) {}
    
    // 优化3: 使用 modifier 减少重复代码
    modifier onlySupportedToken(address token) {
        require(supportedTokens[token], "Token not supported");
        _;
    }
    
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid address");
        supportedTokens[token] = true;
    }
    
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }
    
    // 优化4: 减少存储操作和外部调用
    function list(address nftContract, uint256 tokenId, address paymentToken, uint256 price) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(nftContract != address(0) && paymentToken != address(0), "Invalid address");
        require(supportedTokens[paymentToken], "Token not supported");
        require(price > 0, "Invalid price");
        
        bytes32 listingKey = keccak256(abi.encodePacked(nftContract, tokenId));
        Listing storage listing = listings[listingKey];
        
        require(!listing.isActive, "Already listed");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not owner");
        
        // 合并授权检查
        address approved = IERC721(nftContract).getApproved(tokenId);
        bool isApproved = approved == address(this) || IERC721(nftContract).isApprovedForAll(msg.sender, address(this));
        require(isApproved, "Not approved");
        
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        
        listings[listingKey] = Listing({
            seller: msg.sender,
            paymentToken: paymentToken,
            price: uint96(price),
            listingTime: uint32(block.timestamp),
            isActive: true
        });
        
        totalListings++;
        emit NFTListed(msg.sender, nftContract, tokenId, price);
    }
    
    // 优化5: 减少重复的存储访问
    function buyNFT(address nftContract, uint256 tokenId) external nonReentrant whenNotPaused {
        bytes32 listingKey = keccak256(abi.encodePacked(nftContract, tokenId));
        Listing storage listing = listings[listingKey];
        
        require(listing.isActive, "Not listed");
        require(listing.seller != msg.sender, "Cannot buy own NFT");
        
        uint256 price = listing.price;
        IERC20 paymentToken = IERC20(listing.paymentToken);
        
        require(paymentToken.balanceOf(msg.sender) >= price, "Insufficient balance");
        require(paymentToken.allowance(msg.sender, address(this)) >= price, "Insufficient allowance");
        
        paymentToken.transferFrom(msg.sender, listing.seller, price);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        
        listing.isActive = false;
        totalListings--;
        
        emit NFTSold(listing.seller, msg.sender, nftContract, tokenId, price);
    }
    
    function delist(address nftContract, uint256 tokenId) external nonReentrant {
        bytes32 listingKey = keccak256(abi.encodePacked(nftContract, tokenId));
        Listing storage listing = listings[listingKey];
        
        require(listing.isActive, "Not listed");
        require(listing.seller == msg.sender, "Not seller");
        
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        listing.isActive = false;
        totalListings--;
        
        emit NFTDelisted(msg.sender, nftContract, tokenId);
    }
    
    function updatePrice(address nftContract, uint256 tokenId, address paymentToken, uint256 newPrice) external {
        require(paymentToken != address(0), "Invalid address");
        require(supportedTokens[paymentToken], "Token not supported");
        require(newPrice > 0, "Invalid price");
        
        bytes32 listingKey = keccak256(abi.encodePacked(nftContract, tokenId));
        Listing storage listing = listings[listingKey];
        
        require(listing.isActive, "Not listed");
        require(listing.seller == msg.sender, "Not seller");
        
        listing.paymentToken = paymentToken;
        listing.price = uint96(newPrice);
        
        emit NFTListed(msg.sender, nftContract, tokenId, newPrice);
    }
    
    function getListing(address nftContract, uint256 tokenId) external view returns (
        address seller,
        address paymentToken,
        uint256 price,
        uint256 listingTime,
        bool isActive
    ) {
        bytes32 listingKey = keccak256(abi.encodePacked(nftContract, tokenId));
        Listing storage listing = listings[listingKey];
        return (
            listing.seller,
            listing.paymentToken,
            listing.price,
            listing.listingTime,
            listing.isActive
        );
    }
    
    function getListedCount() external view returns (uint256) {
        return totalListings;
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