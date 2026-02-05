# Run Instructions

## Install
```bash
npm install
Env
Copy .env.example → .env and set:

SEPOLIA_RPC_URL

PRIVATE_KEY

Compile
npx hardhat compile --force
Deploy RewardToken to Sepolia
npx hardhat run scripts/deploy_reward_token.ts --network sepolia