console.log("script.js loaded");

let provider;
let signer;
let userAddress;

// ================= CONTRACT ADDRESSES =================
// ПОТОМ ЗАМЕНИ НА РЕАЛЬНЫЕ
const CROWDFUND_ADDRESS = "0xYOUR_CROWDFUND_ADDRESS";
const TOKEN_ADDRESS = "0xbE9Bd59cEB74412301B33dc2c84E7BAE5bCD2a76";

// ================= ABI =================
const CROWDFUND_ABI = [
  "function createCampaign(string title, uint256 goal, uint256 deadline)"
];

const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)"
];

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("connectBtn")
    .addEventListener("click", connectWallet);

  document
    .getElementById("createBtn")
    .addEventListener("click", createCampaign);
});

// ================= CONNECT METAMASK =================
async function connectWallet() {
  console.log("Connect MetaMask clicked");

  if (!window.ethereum) {
    alert("MetaMask not installed");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  signer = provider.getSigner();
  userAddress = await signer.getAddress();

  document.getElementById("walletAddress").innerText = userAddress;

  await checkNetwork();
  await loadBalances();
}

// ================= NETWORK CHECK =================
async function checkNetwork() {
  const network = await provider.getNetwork();

  if (network.chainId !== 11155111) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }] // Sepolia
      });
    } catch (err) {
      alert("Please switch to Sepolia Testnet manually");
    }
  }

  document.getElementById("networkName").innerText = "Sepolia";
}


// ================= LOAD BALANCES =================
async function loadBalances() {
  const ethBalance = await provider.getBalance(userAddress);
  document.getElementById("ethBalance").innerText =
    ethers.utils.formatEther(ethBalance);

  const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
  const tokenBalance = await token.balanceOf(userAddress);
  document.getElementById("tokenBalance").innerText =
    ethers.utils.formatUnits(tokenBalance, 18);
}

// ================= CREATE CAMPAIGN =================
async function createCampaign() {
  if (!signer) {
    alert("Connect MetaMask first");
    return;
  }

  const title = document.getElementById("titleInput").value;
  const goalEth = document.getElementById("goalInput").value;
  const date = document.getElementById("dateInput").value;

  if (!title || !goalEth || !date) {
    alert("Fill all fields");
    return;
  }

  const deadline = Math.floor(new Date(date).getTime() / 1000);
  const goalWei = ethers.utils.parseEther(goalEth);

  const contract = new ethers.Contract(
    CROWDFUND_ADDRESS,
    CROWDFUND_ABI,
    signer
  );

  const tx = await contract.createCampaign(title, goalWei, deadline);
  await tx.wait();

  alert("Campaign created successfully");
}
