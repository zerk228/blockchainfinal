// Hardhat 3: deploy via ethers JsonRpcProvider (stable for TS typing)

import { ethers } from "ethers";
import hre from "hardhat";
import "dotenv/config";

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const pk = process.env.PRIVATE_KEY;

  if (!rpcUrl) throw new Error("Missing SEPOLIA_RPC_URL in .env");
  if (!pk) throw new Error("Missing PRIVATE_KEY in .env");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  console.log("Deployer:", wallet.address);

  const artifact = await hre.artifacts.readArtifact("RewardToken");

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  const token = await factory.deploy("Crowd Reward Token", "CRT", wallet.address);

  await token.waitForDeployment();
  console.log("RewardToken deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
