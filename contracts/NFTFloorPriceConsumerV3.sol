// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./AggregatorV3Interface.sol";

contract NFTFloorPriceConsumerV3 {
    AggregatorV3Interface internal nftFloorPriceFeed;

    constructor(address _nftFloorPriceFeedAddress) {
        nftFloorPriceFeed = AggregatorV3Interface(_nftFloorPriceFeedAddress);
    }

    function getLatestPrice() public view returns (uint80,int,uint,uint,uint80) {
        (
            uint80 roundID,
            int nftFloorPrice,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = nftFloorPriceFeed.latestRoundData();

        return (roundID,nftFloorPrice,startedAt,timeStamp,answeredInRound);
    }
}
