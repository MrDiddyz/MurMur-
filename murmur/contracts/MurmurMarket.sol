// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MurmurMarket {
    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 price;
    }

    Listing[] public listings;

    function createListing(uint256 tokenId, uint256 price) external {
        listings.push(Listing({seller: msg.sender, tokenId: tokenId, price: price}));
    }
}
