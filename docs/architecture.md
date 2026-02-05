# Architecture

## Components
- Crowdfunding.sol: manages campaigns and contributions, mints rewards
- RewardToken.sol: ERC-20 reward token

## Minting flow
Crowdfunding calls: `RewardToken.mint(contributor, amount)`.

## Access control
RewardToken uses AccessControl:
- Admin grants MINTER_ROLE to Crowdfunding contract after deployment
- In this project, admin uses `setMinter(crowdfundingAddress)`
