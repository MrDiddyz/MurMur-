// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract MurmurNFT is ERC721A, Ownable, ERC2981 {
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721A("MurMur AI", "MURMUR") Ownable(msg.sender) {
        _setDefaultRoyalty(msg.sender, 500);
    }

    function mint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId();

        _safeMint(to, 1);

        _tokenURIs[tokenId] = uri;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return _tokenURIs[tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721A, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
