// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/NFTMarketOptimized.sol";
import "../src/SimpleNFT.sol";
import "../src/TestToken.sol";

contract NFTMarketOptimizedTest is Test {
    NFTMarketOptimized public market;
    SimpleNFT public nft;
    TestToken public token1;
    TestToken public token2;
    TestToken public token3;
    
    address public owner;
    address public seller;
    address public buyer1;
    address public buyer2;
    address public buyer3;
    
    uint256 public constant INITIAL_BALANCE = 1000000 * 10**18;
    uint256 public constant NFT_PRICE = 100 * 10**18;
    
    event NFTListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price);
    event NFTSold(address indexed seller, address indexed buyer, address indexed nftContract, uint256 tokenId, uint256 price);
    event NFTDelisted(address indexed seller, address indexed nftContract, uint256 indexed tokenId);
    
    function setUp() public {
        owner = address(this);
        seller = makeAddr("seller");
        buyer1 = makeAddr("buyer1");
        buyer2 = makeAddr("buyer2");
        buyer3 = makeAddr("buyer3");
        
        market = new NFTMarketOptimized();
        nft = new SimpleNFT();
        token1 = new TestToken("Token1", "TK1");
        token2 = new TestToken("Token2", "TK2");
        token3 = new TestToken("Token3", "TK3");
        
        market.addSupportedToken(address(token1));
        market.addSupportedToken(address(token2));
        market.addSupportedToken(address(token3));
        
        token1.mint(seller, INITIAL_BALANCE);
        token1.mint(buyer1, INITIAL_BALANCE);
        token1.mint(buyer2, INITIAL_BALANCE);
        token1.mint(buyer3, INITIAL_BALANCE);
        
        token2.mint(seller, INITIAL_BALANCE);
        token2.mint(buyer1, INITIAL_BALANCE);
        token2.mint(buyer2, INITIAL_BALANCE);
        token2.mint(buyer3, INITIAL_BALANCE);
        
        token3.mint(seller, INITIAL_BALANCE);
        token3.mint(buyer1, INITIAL_BALANCE);
        token3.mint(buyer2, INITIAL_BALANCE);
        token3.mint(buyer3, INITIAL_BALANCE);
        
        nft.mint(seller);
        nft.mint(seller);
        nft.mint(seller);
        
        vm.prank(seller);
        nft.setApprovalForAll(address(market), true);
        
        vm.prank(buyer1);
        token1.approve(address(market), type(uint256).max);
        vm.prank(buyer2);
        token1.approve(address(market), type(uint256).max);
        vm.prank(buyer3);
        token1.approve(address(market), type(uint256).max);
        
        vm.prank(buyer1);
        token2.approve(address(market), type(uint256).max);
        vm.prank(buyer2);
        token2.approve(address(market), type(uint256).max);
        vm.prank(buyer3);
        token2.approve(address(market), type(uint256).max);
        
        vm.prank(buyer1);
        token3.approve(address(market), type(uint256).max);
        vm.prank(buyer2);
        token3.approve(address(market), type(uint256).max);
        vm.prank(buyer3);
        token3.approve(address(market), type(uint256).max);
    }
    
    // ========== 上架NFT测试 ==========
    
    function test_ListNFT_Success() public {
        uint256 tokenId = 1;
        uint256 price = NFT_PRICE;
        
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), price);
        
        (address sellerAddr, address paymentToken, uint256 listingPrice, uint256 listingTime, bool isActive) = 
            market.getListing(address(nft), tokenId);
        
        assertEq(sellerAddr, seller);
        assertEq(paymentToken, address(token1));
        assertEq(listingPrice, price);
        assertEq(isActive, true);
        assertEq(market.totalListings(), 1);
        assertEq(nft.ownerOf(tokenId), address(market));
    }
    
    function test_ListNFT_AlreadyListed() public {
        uint256 tokenId = 1;
        uint256 price = NFT_PRICE;
        
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), price);
        
        vm.prank(seller);
        vm.expectRevert("Already listed");
        market.list(address(nft), tokenId, address(token2), price * 2);
    }
    
    function test_ListNFT_NotOwner() public {
        uint256 tokenId = 1;
        uint256 price = NFT_PRICE;
        
        vm.prank(buyer1);
        vm.expectRevert("Not owner");
        market.list(address(nft), tokenId, address(token1), price);
    }
    
    function test_ListNFT_NotApproved() public {
        uint256 tokenId = 1;
        uint256 price = NFT_PRICE;
        
        vm.prank(seller);
        nft.setApprovalForAll(address(market), false);
        
        vm.prank(seller);
        vm.expectRevert("Not approved");
        market.list(address(nft), tokenId, address(token1), price);
    }
    
    function test_ListNFT_UnsupportedToken() public {
        uint256 tokenId = 1;
        uint256 price = NFT_PRICE;
        
        vm.prank(seller);
        vm.expectRevert("Token not supported");
        market.list(address(nft), tokenId, address(0x123), price);
    }
    
    function test_ListNFT_ZeroPrice() public {
        uint256 tokenId = 1;
        
        vm.prank(seller);
        vm.expectRevert("Invalid price");
        market.list(address(nft), tokenId, address(token1), 0);
    }
    
    // ========== 购买NFT测试 ==========
    
    function test_BuyNFT_Success() public {
        uint256 tokenId = 1;
        uint256 price = NFT_PRICE;
        
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), price);
        
        uint256 buyerBalanceBefore = token1.balanceOf(buyer1);
        uint256 sellerBalanceBefore = token1.balanceOf(seller);
        
        vm.prank(buyer1);
        market.buyNFT(address(nft), tokenId);
        
        assertEq(nft.ownerOf(tokenId), buyer1);
        assertEq(token1.balanceOf(buyer1), buyerBalanceBefore - price);
        assertEq(token1.balanceOf(seller), sellerBalanceBefore + price);
        assertEq(market.totalListings(), 0);
        
        (,,, , bool isActive) = market.getListing(address(nft), tokenId);
        assertEq(isActive, false);
    }
    
    function test_BuyNFT_NotListed() public {
        uint256 tokenId = 1;
        
        vm.prank(buyer1);
        vm.expectRevert("Not listed");
        market.buyNFT(address(nft), tokenId);
    }
    
    function test_BuyNFT_BuyOwnNFT() public {
        uint256 tokenId = 1;
        uint256 price = NFT_PRICE;
        
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), price);
        
        vm.prank(seller);
        vm.expectRevert("Cannot buy own NFT");
        market.buyNFT(address(nft), tokenId);
    }
    
    function test_BuyNFT_InsufficientBalance() public {
        uint256 tokenId = 1;
        uint256 price = NFT_PRICE;
        
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), price);
        
        vm.prank(buyer1);
        token1.transfer(address(0xdead), token1.balanceOf(buyer1) - price + 1);
        
        vm.prank(buyer1);
        vm.expectRevert("Insufficient balance");
        market.buyNFT(address(nft), tokenId);
    }
    
    function test_BuyNFT_InsufficientAllowance() public {
        uint256 tokenId = 1;
        uint256 price = NFT_PRICE;
        
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), price);
        
        vm.prank(buyer1);
        token1.approve(address(market), price - 1);
        
        vm.prank(buyer1);
        vm.expectRevert("Insufficient allowance");
        market.buyNFT(address(nft), tokenId);
    }
    
    function test_BuyNFT_AlreadySold() public {
        uint256 tokenId = 1;
        uint256 price = NFT_PRICE;
        
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), price);
        
        vm.prank(buyer1);
        market.buyNFT(address(nft), tokenId);
        
        vm.prank(buyer2);
        vm.expectRevert("Not listed");
        market.buyNFT(address(nft), tokenId);
    }
    
    // ========== 下架NFT测试 ==========
    
    function test_DelistNFT() public {
        uint256 tokenId = 1;
        uint256 price = NFT_PRICE;
        
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), price);
        
        assertEq(market.totalListings(), 1);
        
        vm.prank(seller);
        market.delist(address(nft), tokenId);
        
        assertEq(nft.ownerOf(tokenId), seller);
        assertEq(market.totalListings(), 0);
        
        (,,, , bool isActive) = market.getListing(address(nft), tokenId);
        assertEq(isActive, false);
    }
    
    // ========== 更新价格测试 ==========
    
    function test_UpdatePrice() public {
        uint256 tokenId = 1;
        uint256 price = NFT_PRICE;
        uint256 newPrice = price * 2;
        
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), price);
        
        vm.prank(seller);
        market.updatePrice(address(nft), tokenId, address(token2), newPrice);
        
        (address sellerAddr, address paymentToken, uint256 listingPrice, , bool isActive) = 
            market.getListing(address(nft), tokenId);
        
        assertEq(sellerAddr, seller);
        assertEq(paymentToken, address(token2));
        assertEq(listingPrice, newPrice);
        assertEq(isActive, true);
    }
    
    // ========== 暂停/恢复测试 ==========
    
    function test_PauseAndUnpause() public {
        market.pause();
        assertTrue(market.paused());
        
        market.unpause();
        assertFalse(market.paused());
    }
    
    // ========== 模糊测试 ==========
    
    function test_Fuzz_ListAndBuyNFT(uint256 tokenId, address buyer) public {
        vm.assume(tokenId < 1000);
        vm.assume(buyer != address(0) && buyer != seller);
        
        uint256 price = NFT_PRICE;
        
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), price);
        
        vm.prank(buyer);
        market.buyNFT(address(nft), tokenId);
        
        assertEq(nft.ownerOf(tokenId), buyer);
    }
    
    // ========== 不变性测试 ==========
    
    function test_Invariant_NoTokenBalance() public {
        uint256 tokenId = 1;
        uint256 price = NFT_PRICE;
        
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), price);
        
        vm.prank(buyer1);
        market.buyNFT(address(nft), tokenId);
        
        // 市场合约不应该持有任何代币
        assertEq(token1.balanceOf(address(market)), 0);
    }
    
    function test_Invariant_NoTokenBalance_AfterMultipleTransactions() public {
        for (uint256 i = 0; i < 3; i++) {
            uint256 tokenId = i;
            uint256 price = NFT_PRICE;
            
            vm.prank(seller);
            market.list(address(nft), tokenId, address(token1), price);
            
            vm.prank(buyer1);
            market.buyNFT(address(nft), tokenId);
        }
        
        // 市场合约不应该持有任何代币
        assertEq(token1.balanceOf(address(market)), 0);
    }
} 