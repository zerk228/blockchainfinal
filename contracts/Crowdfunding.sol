// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRewardToken {
    function mint(address to, uint256 amount) external;
}

contract Crowdfunding {

    struct Campaign {
        string title;
        uint256 goal;        // в wei
        uint256 deadline;    // timestamp
        uint256 raised;      // сколько собрано (wei)
        bool finalized;
        address creator;
    }

    Campaign[] public campaigns;

    // campaignId => contributor => amount
    mapping(uint256 => mapping(address => uint256)) public contributions;

    IRewardToken public rewardToken;

    uint256 public constant REWARD_RATE = 1000; 
    // 1 ETH (1e18 wei) = 1000 RWD (с учётом decimals токена)

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string title,
        uint256 goal,
        uint256 deadline
    );

    event Contributed(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount,
        uint256 rewardMinted
    );

    event Finalized(
        uint256 indexed campaignId,
        uint256 totalRaised,
        bool goalReached
    );

    constructor(address _rewardToken) {
        require(_rewardToken != address(0), "Invalid token address");
        rewardToken = IRewardToken(_rewardToken);
    }

    function createCampaign(
        string calldata title,
        uint256 goal,
        uint256 deadline
    ) external {

        require(bytes(title).length > 0, "Empty title");
        require(goal > 0, "Goal must be > 0");
        require(deadline > block.timestamp, "Deadline in past");

        campaigns.push(
            Campaign({
                title: title,
                goal: goal,
                deadline: deadline,
                raised: 0,
                finalized: false,
                creator: msg.sender
            })
        );

        uint256 id = campaigns.length - 1;

        emit CampaignCreated(id, msg.sender, title, goal, deadline);
    }

    function contribute(uint256 campaignId) external payable {

        require(campaignId < campaigns.length, "Invalid campaign");
        Campaign storage campaign = campaigns[campaignId];

        require(block.timestamp < campaign.deadline, "Campaign ended");
        require(!campaign.finalized, "Already finalized");
        require(msg.value > 0, "No ETH sent");

        campaign.raised += msg.value;
        contributions[campaignId][msg.sender] += msg.value;

        // mint reward tokens
        uint256 rewardAmount = msg.value * REWARD_RATE;
        rewardToken.mint(msg.sender, rewardAmount);

        emit Contributed(
            campaignId,
            msg.sender,
            msg.value,
            rewardAmount
        );
    }

    function finalize(uint256 campaignId) external {

        require(campaignId < campaigns.length, "Invalid campaign");
        Campaign storage campaign = campaigns[campaignId];

        require(block.timestamp >= campaign.deadline, "Not ended yet");
        require(!campaign.finalized, "Already finalized");

        campaign.finalized = true;

        bool goalReached = campaign.raised >= campaign.goal;

        emit Finalized(
            campaignId,
            campaign.raised,
            goalReached
        );
    }

    function getCampaigns() external view returns (Campaign[] memory) {
        return campaigns;
    }

    function campaignsCount() external view returns (uint256) {
        return campaigns.length;
    }
}
