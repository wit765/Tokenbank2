// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/NFTMarket.sol";
import "../src/SimpleNFT.sol";
import "../src/TestToken.sol";

contract NFTMarketTest is Test {
    NFTMarket public market;
    SimpleNFT public nft;
    TestToken public token1;
    TestToken public token2;
    TestToken public token3;
    
    address public owner;
    address public seller;
    address public buyer1;
    address public buyer2;
    address public buyer3;
    
    uint256 public constant INITIAL_BALANCE = 1000000 * 10**18; // 1M tokens
    uint256 public constant NFT_PRICE = 100 * 10**18; // 100 tokens
    
    event NFTListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, address paymentToken, uint256 price, uint256 listingTime);
    event NFTSold(address indexed seller, address indexed buyer, address indexed nftContract, uint256 tokenId, address paymentToken, uint256 price, uint256 saleTime);
    event NFTDelisted(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 delistTime);
    
    function setUp() public {
        owner = address(this);
        seller = makeAddr("seller");
        buyer1 = makeAddr("buyer1");
        buyer2 = makeAddr("buyer2");
        buyer3 = makeAddr("buyer3");
        
        // 部署合约
        market = new NFTMarket();
        nft = new SimpleNFT();
        token1 = new TestToken("Token1", "TK1");
        token2 = new TestToken("Token2", "TK2");
        token3 = new TestToken("Token3", "TK3");
        
        // 添加支持的代币
        market.addSupportedToken(address(token1));
        market.addSupportedToken(address(token2));
        market.addSupportedToken(address(token3));
        
        // 铸造代币
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
        
        // 铸造NFT
        nft.mint(seller);
        nft.mint(seller);
        nft.mint(seller);
        
        // 授权市场合约操作NFT
        vm.prank(seller);
        nft.setApprovalForAll(address(market), true);
        
        // 授权市场合约操作代币
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
        vm.expectEmit(true, true, true, true, address(market));
        emit NFTListed(seller, address(nft), tokenId, address(token1), price, block.timestamp);
        market.list(address(nft), tokenId, address(token1), price);
        
        NFTMarket.Listing memory listing = market.getListing(address(nft), tokenId);
        assertEq(listing.seller, seller);
        assertEq(listing.nftContract, address(nft));
        assertEq(listing.tokenId, tokenId);
        assertEq(listing.paymentToken, address(token1));
        assertEq(listing.price, price);
        assertTrue(listing.isActive);
        assertEq(listing.listingTime, block.timestamp);
        
        assertEq(nft.ownerOf(tokenId), address(market));
        assertEq(market.getListedCount(), 1);
    }
    
    function test_ListNFT_ZeroNFTContract() public {
        vm.prank(seller);
        vm.expectRevert("NFT contract address cannot be zero");
        market.list(address(0), 1, address(token1), NFT_PRICE);
    }
    
    function test_ListNFT_ZeroPaymentToken() public {
        vm.prank(seller);
        vm.expectRevert("Payment token address cannot be zero");
        market.list(address(nft), 1, address(0), NFT_PRICE);
    }
    
    function test_ListNFT_UnsupportedToken() public {
        TestToken unsupportedToken = new TestToken("Unsupported", "UNS");
        
        vm.prank(seller);
        vm.expectRevert("Payment token not supported");
        market.list(address(nft), 1, address(unsupportedToken), NFT_PRICE);
    }
    
    function test_ListNFT_ZeroPrice() public {
        vm.prank(seller);
        vm.expectRevert("Price must be greater than zero");
        market.list(address(nft), 1, address(token1), 0);
    }
    
    function test_ListNFT_NotOwner() public {
        vm.prank(buyer1);
        vm.expectRevert("You don't own this NFT");
        market.list(address(nft), 1, address(token1), NFT_PRICE);
    }
    
    function test_ListNFT_NotApproved() public {
        vm.prank(seller);
        nft.setApprovalForAll(address(market), false);
        
        vm.prank(seller);
        vm.expectRevert("NFT not approved for market");
        market.list(address(nft), 1, address(token1), NFT_PRICE);
    }
    
    function test_ListNFT_AlreadyListed() public {
        // 先上架
        vm.prank(seller);
        market.list(address(nft), 1, address(token1), NFT_PRICE);
        
        // 尝试重复上架 - 此时NFT已经在市场合约中，卖家不再拥有它
        vm.prank(seller);
        vm.expectRevert("You don't own this NFT");
        market.list(address(nft), 1, address(token1), NFT_PRICE);
    }
    
    // ========== 购买NFT测试 ==========
    
    function test_BuyNFT_Success() public {
        uint256 tokenId = 1;
        uint256 price = NFT_PRICE;
        
        // 上架NFT
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), price);
        
        uint256 sellerBalanceBefore = token1.balanceOf(seller);
        uint256 buyerBalanceBefore = token1.balanceOf(buyer1);
        
        // 购买NFT
        vm.prank(buyer1);
        vm.expectEmit(true, true, true, true, address(market));
        emit NFTSold(seller, buyer1, address(nft), tokenId, address(token1), price, block.timestamp);
        market.buyNFT(address(nft), tokenId);
        
        // 验证NFT所有权转移
        assertEq(nft.ownerOf(tokenId), buyer1);
        
        // 验证代币转移
        assertEq(token1.balanceOf(seller), sellerBalanceBefore + price);
        assertEq(token1.balanceOf(buyer1), buyerBalanceBefore - price);
        
        // 验证上架状态
        NFTMarket.Listing memory listing = market.getListing(address(nft), tokenId);
        assertFalse(listing.isActive);
    }
    
    function test_BuyNFT_NotListed() public {
        vm.prank(buyer1);
        vm.expectRevert("NFT not listed for sale");
        market.buyNFT(address(nft), 1);
    }
    
    function test_BuyNFT_BuyOwnNFT() public {
        uint256 tokenId = 1;
        
        // 上架NFT
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), NFT_PRICE);
        
        // 尝试购买自己的NFT
        vm.prank(seller);
        vm.expectRevert("Cannot buy your own NFT");
        market.buyNFT(address(nft), tokenId);
    }
    
    function test_BuyNFT_InsufficientBalance() public {
        uint256 tokenId = 1;
        uint256 highPrice = INITIAL_BALANCE + 1;
        
        // 上架NFT
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), highPrice);
        
        // 尝试购买但余额不足
        vm.prank(buyer1);
        vm.expectRevert("Insufficient token balance");
        market.buyNFT(address(nft), tokenId);
    }
    
    function test_BuyNFT_InsufficientAllowance() public {
        uint256 tokenId = 1;
        
        // 上架NFT
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), NFT_PRICE);
        
        // 撤销授权
        vm.prank(buyer1);
        token1.approve(address(market), 0);
        
        // 尝试购买但授权不足
        vm.prank(buyer1);
        vm.expectRevert("Insufficient token allowance");
        market.buyNFT(address(nft), tokenId);
    }
    
    function test_BuyNFT_AlreadySold() public {
        uint256 tokenId = 1;
        
        // 上架NFT
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), NFT_PRICE);
        
        // 第一次购买成功
        vm.prank(buyer1);
        market.buyNFT(address(nft), tokenId);
        
        // 尝试重复购买
        vm.prank(buyer2);
        vm.expectRevert("NFT not listed for sale");
        market.buyNFT(address(nft), tokenId);
    }
    
    // ========== 模糊测试 ==========
    
    function test_Fuzz_ListAndBuyNFT(uint256 price, address buyer) public {
        // 限制价格范围在 0.01-10000 tokens
        vm.assume(price >= 0.01 ether && price <= 10000 ether);
        vm.assume(buyer != address(0) && buyer != seller);
        
        // 确保买家有足够的余额
        token1.mint(buyer, price + 1000 ether);
        vm.prank(buyer);
        token1.approve(address(market), type(uint256).max);
        
        uint256 tokenId = 1;
        
        // 上架NFT
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), price);
        
        // 购买NFT
        vm.prank(buyer);
        market.buyNFT(address(nft), tokenId);
        
        // 验证NFT所有权
        assertEq(nft.ownerOf(tokenId), buyer);
        
        // 验证上架状态
        NFTMarket.Listing memory listing = market.getListing(address(nft), tokenId);
        assertFalse(listing.isActive);
    }
    
    // ========== 不可变测试 ==========
    
    function test_Invariant_NoTokenBalance() public {
        // 上架多个NFT
        vm.prank(seller);
        market.list(address(nft), 1, address(token1), NFT_PRICE);
        vm.prank(seller);
        market.list(address(nft), 2, address(token2), NFT_PRICE);
        vm.prank(seller);
        market.list(address(nft), 3, address(token3), NFT_PRICE);
        
        // 购买NFT
        vm.prank(buyer1);
        market.buyNFT(address(nft), 1);
        vm.prank(buyer2);
        market.buyNFT(address(nft), 2);
        vm.prank(buyer3);
        market.buyNFT(address(nft), 3);
        
        // 验证市场合约没有代币余额
        assertEq(token1.balanceOf(address(market)), 0);
        assertEq(token2.balanceOf(address(market)), 0);
        assertEq(token3.balanceOf(address(market)), 0);
    }
    
    function test_Invariant_NoTokenBalance_AfterMultipleTransactions() public {
        // 执行多次上架和购买操作
        for (uint256 i = 0; i < 10; i++) {
            // 铸造新NFT
            nft.mint(seller);
            uint256 tokenId = nft.getCurrentTokenId();
            
            // 上架NFT
            vm.prank(seller);
            market.list(address(nft), tokenId, address(token1), NFT_PRICE);
            
            // 购买NFT
            vm.prank(buyer1);
            market.buyNFT(address(nft), tokenId);
            
            // 验证市场合约没有代币余额
            assertEq(token1.balanceOf(address(market)), 0);
        }
    }
    
    // ========== 其他功能测试 ==========
    
    function test_DelistNFT() public {
        uint256 tokenId = 1;
        
        // 上架NFT
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), NFT_PRICE);
        
        // 下架NFT
        vm.prank(seller);
        vm.expectEmit(true, true, true, false, address(market));
        emit NFTDelisted(seller, address(nft), tokenId, block.timestamp);
        market.delist(address(nft), tokenId);
        
        // 验证NFT返回给卖家
        assertEq(nft.ownerOf(tokenId), seller);
        
        // 验证上架状态
        NFTMarket.Listing memory listing = market.getListing(address(nft), tokenId);
        assertFalse(listing.isActive);
    }
    
    function test_UpdatePrice() public {
        uint256 tokenId = 1;
        uint256 newPrice = 200 * 10**18;
        
        // 上架NFT
        vm.prank(seller);
        market.list(address(nft), tokenId, address(token1), NFT_PRICE);
        
        // 更新价格
        vm.prank(seller);
        market.updatePrice(address(nft), tokenId, address(token2), newPrice);
        
        // 验证价格更新
        NFTMarket.Listing memory listing = market.getListing(address(nft), tokenId);
        assertEq(listing.price, newPrice);
        assertEq(listing.paymentToken, address(token2));
    }
    
    function test_PauseAndUnpause() public {
        // 暂停市场
        market.pause();
        assertTrue(market.paused());
        
        // 尝试在暂停状态下上架NFT
        vm.prank(seller);
        vm.expectRevert("EnforcedPause()");
        market.list(address(nft), 1, address(token1), NFT_PRICE);
        
        // 恢复市场
        market.unpause();
        assertFalse(market.paused());
        
        // 现在可以正常上架
        vm.prank(seller);
        market.list(address(nft), 1, address(token1), NFT_PRICE);
    }
} 