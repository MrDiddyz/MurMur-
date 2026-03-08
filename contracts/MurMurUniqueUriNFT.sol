// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MurMurUniqueUriNFT is ERC721URIStorage, Ownable {
    error InvalidReceiver();
    error EmptyTokenURI();
    error TokenURIAlreadyMinted();
    error IncorrectMintFee(uint256 expected, uint256 actual);
    error WithdrawalFailed();

    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI, uint256 paid);
    event FundsWithdrawn(address indexed to, uint256 amount);

    mapping(string => bool) public mintedTokenURIs;

    uint256 public immutable mintFee;
    uint256 private _nextTokenId;

    constructor(address owner_, uint256 mintFee_)
        ERC721("MurMur Unique URI NFT", "MMURI")
        Ownable(owner_)
    {
        mintFee = mintFee_;
    }

    function mintNFT(address to, string calldata tokenURI_) external payable {
        if (to == address(0)) revert InvalidReceiver();
        if (bytes(tokenURI_).length == 0) revert EmptyTokenURI();
        if (mintedTokenURIs[tokenURI_]) revert TokenURIAlreadyMinted();
        if (msg.value != mintFee) revert IncorrectMintFee(mintFee, msg.value);

        uint256 tokenId = _nextTokenId;
        unchecked {
            _nextTokenId = tokenId + 1;
        }

        mintedTokenURIs[tokenURI_] = true;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        emit NFTMinted(to, tokenId, tokenURI_, msg.value);
    }

    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    function withdraw(address payable to) external onlyOwner {
        if (to == address(0)) revert InvalidReceiver();

        uint256 balance = address(this).balance;
        (bool sent,) = to.call{value: balance}("");
        if (!sent) revert WithdrawalFailed();

        emit FundsWithdrawn(to, balance);
    }
}
