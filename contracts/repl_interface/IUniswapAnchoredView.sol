pragma solidity ^0.5.16;


interface IUniswapAnchoredView {
    function getUnderlyingPrice(address addr) external returns (uint256);
}
