pragma solidity ^0.5.16;

interface IERC20 {

    // tether functions
    function setFail(bool fail) external;
    function pause() external;
    function unpause() external;
    function setParams(uint256 newBasisPoints, uint256 newMaxFee) external;

    // faucet token
    function allocateTo(address owner, uint256 value) external;

    // optional views
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);

    // view
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);
    function totalSupply() external view returns (uint);

    // not view
    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint value
    ) external returns (bool);

    // events
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);
}
