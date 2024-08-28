// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MusicNFTMarketplace is ERC721("DAppFi", "DAPP"), Ownable {
    string public baseURI = "https://gateway.pinata.cloud/ipfs/";

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        uint256 price;
    }

    MarketItem[] public marketItems;

    event MarketItemBought(
        uint256 indexed tokenId,
        address indexed seller,
        address buyer,
        uint256 price
    );

    event MarketItemRelisted(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    constructor(uint256[] memory _prices) payable {
        // Example: mint a few NFTs
        for (uint8 i = 0; i < 7; i++) {
            require(_prices[i] > 0, "Price must be greater than 0");
            _mint(address(this), i);
            marketItems.push(MarketItem(i, payable(msg.sender), _prices[i]));
        }
    }

    function buyToken(uint256 _tokenId) external payable {
        // Ensure the token is for sale
        uint256 price = marketItems[_tokenId].price;
        address seller = marketItems[_tokenId].seller;

        require(seller != address(0), "Token not for sale");

        require(
            msg.value == price,
            "Please send the correct price to complete the purchase"
        );

        marketItems[_tokenId].seller = payable(address(0));

        _transfer(address(this), msg.sender, _tokenId);

        payable(seller).transfer(msg.value);

        emit MarketItemBought(_tokenId, seller, msg.sender, price);
    }

    function resellToken(uint256 _tokenId, uint256 _price) external {
        require(
            ownerOf(_tokenId) == msg.sender,
            "Only the owner can resell the token"
        );

        marketItems[_tokenId].seller = payable(msg.sender);
        marketItems[_tokenId].price = _price; // Set the price
        _transfer(msg.sender, address(this), _tokenId);

        emit MarketItemRelisted(_tokenId, msg.sender, _price);
    }

    function getAllUnsoldTokens() external view returns (MarketItem[] memory) {
        uint256 unsoldCount;
        for (uint256 i = 0; i < marketItems.length; i++) {
            if (marketItems[i].seller != address(0)) {
                unsoldCount++;
            }
        }

        MarketItem[] memory tokens = new MarketItem[](unsoldCount);
        uint256 currentIndex;
        for (uint256 i = 0; i < marketItems.length; i++) {
            if (marketItems[i].seller != address(0)) {
                tokens[currentIndex] = marketItems[i];
                currentIndex++;
            }
        }
        return tokens;
    }

    function getMyTokens() external view returns (MarketItem[] memory) {
        uint256 myTokenCount = balanceOf(msg.sender);
        MarketItem[] memory tokens = new MarketItem[](myTokenCount);
        uint256 currentIndex;
        for (uint256 i = 0; i < marketItems.length; i++) {
            if (ownerOf(i) == msg.sender) {
                tokens[currentIndex] = marketItems[i];
                currentIndex++;
            }
        }
        return tokens;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
