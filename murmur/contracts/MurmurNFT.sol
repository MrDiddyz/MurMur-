// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MurmurNFT {
    string public name = "MurmurNFT";
    string public symbol = "MMR";
    uint256 public totalSupply;

    mapping(uint256 => address) public ownerOf;

    function mint(address to) external returns (uint256 tokenId) {
        tokenId = ++totalSupply;
        ownerOf[tokenId] = to;
    }
}
