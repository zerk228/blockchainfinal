// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardToken is ERC20 {

    address public crowdfunding;
    address public owner;

    constructor() ERC20("RewardToken", "RWD") {
        owner = msg.sender;
    }

    function setCrowdfunding(address _crowdfunding) external {
        require(msg.sender == owner, "Only owner");
        crowdfunding = _crowdfunding;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == crowdfunding, "Not allowed");
        _mint(to, amount);
    }
}
