// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MurMurUniqueUriNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    error InvalidReceiver();
    error EmptyTokenURI();
    error TokenURIAlreadyMinted();
    error TokenURITooLong(uint256 maxLength, uint256 actualLength);
    error IncorrectMintFee(uint256 expected, uint256 actual);
    error WithdrawalFailed();

    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI, uint256 paid);
    event FundsWithdrawn(address indexed to, uint256 amount);
    event MintFeeUpdated(uint256 previousMintFee, uint256 newMintFee);

    mapping(string => bool) public mintedTokenURIs;

    uint256 public mintFee;
    uint256 public immutable maxTokenURILength;
    uint256 private _nextTokenId;

    constructor(address owner_, uint256 mintFee_, uint256 maxTokenURILength_)
        ERC721("MurMur Unique URI NFT", "MMURI")
        Ownable(owner_)
    {
        mintFee = mintFee_;
        maxTokenURILength = maxTokenURILength_;
    }

    function mintNFT(address to, string calldata tokenURI_) external payable nonReentrant {
        if (to == address(0)) revert InvalidReceiver();

        uint256 uriLength = bytes(tokenURI_).length;
        if (uriLength == 0) revert EmptyTokenURI();
        if (uriLength > maxTokenURILength) revert TokenURITooLong(maxTokenURILength, uriLength);
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

    function setMintFee(uint256 newMintFee) external onlyOwner {
        uint256 previousMintFee = mintFee;
        mintFee = newMintFee;
        emit MintFeeUpdated(previousMintFee, newMintFee);
    }

    function withdraw(address payable to) external onlyOwner nonReentrant {
        if (to == address(0)) revert InvalidReceiver();

        uint256 balance = address(this).balance;
        (bool sent,) = to.call{value: balance}("");
        if (!sent) revert WithdrawalFailed();

        emit FundsWithdrawn(to, balance);
    }
}
