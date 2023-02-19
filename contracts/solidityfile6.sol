// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./NFTFloorPriceConsumerV3.sol";

error NotApprovedForStaking();
error AlreadyStaked(address nftAddress, uint256 tokenId);
error NotOwner();
error NftNotStaked(address nftAddress, uint256 tokenId);

contract SolidityFile6 {
    struct Staking {
        uint256 floorPrice;
        address seller;
    }

    event ItemStaked(address indexed seller, address indexed nftAddress, uint256 indexed tokenId, uint256 floorPrice);
    event ItemTransferred(address indexed from, address indexed to, address indexed nftAddress, uint256 tokenId);

    mapping(address => mapping(uint256 => Staking)) private s_staking;

    NFTFloorPriceConsumerV3 private nftFloorPriceConsumer;

    constructor(address nftFloorPriceConsumerAddress) {
        nftFloorPriceConsumer = NFTFloorPriceConsumerV3(nftFloorPriceConsumerAddress);
    }

    modifier notStaked(address nftAddress, uint256 tokenId) {
        Staking memory staking = s_staking[nftAddress][tokenId];
        if (staking.floorPrice > 0) {
            revert AlreadyStaked(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(address nftAddress, uint256 tokenId) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    modifier nftStaked(address nftAddress, uint256 tokenId) {
        Staking memory staking = s_staking[nftAddress][tokenId];
        if (staking.floorPrice == 0) {
            revert NftNotStaked(nftAddress, tokenId);
        }
        _;
    }

    function stake(address nftAddress, uint256 tokenId)
        external
        notStaked(nftAddress, tokenId)
        isOwner(nftAddress, tokenId)
    {
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NotApprovedForStaking();
        }

        (, int nftFloorPrice,,,) = nftFloorPriceConsumer.getLatestPrice();

        uint256 floorPrice = uint256(nftFloorPrice);
        s_staking[nftAddress][tokenId] = Staking(floorPrice, msg.sender);
        emit ItemStaked(msg.sender, nftAddress, tokenId, floorPrice);
    }

    function transferNFT(address nftAddress, uint256 tokenId, address recipient)
        external
        nftStaked(nftAddress, tokenId)
    {
        IERC721 nft = IERC721(nftAddress);
        Staking memory staking = s_staking[nftAddress][tokenId];
        require(msg.sender == staking.seller, "Only the seller can transfer the NFT.");
        require(recipient != address(0), "Recipient address cannot be zero.");

        nft.safeTransferFrom(address(this), recipient, tokenId);
        delete s_staking[nftAddress][tokenId];
        emit ItemTransferred(address(this), recipient, nftAddress, tokenId);
    }
}
