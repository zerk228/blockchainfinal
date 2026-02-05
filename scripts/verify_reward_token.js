const hre = require("hardhat");

async function main() {
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const adminAddress = process.env.ADMIN_ADDRESS;

  if (!tokenAddress) throw new Error("Set TOKEN_ADDRESS in .env");
  if (!adminAddress) throw new Error("Set ADMIN_ADDRESS in .env");

  const name = "Crowd Reward Token";
  const symbol = "CRT";

  await hre.run("verify:verify", {
    address: tokenAddress,
    constructorArguments: [name, symbol, adminAddress],
  });

  console.log("Verified:", tokenAddress);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
