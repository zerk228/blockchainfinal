console.log("script loaded");

const CROWDFUND_ADDRESS = "0x392D6949A3F5532a67d43617934c90bf53eE4495";

const CROWDFUND_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_rewardToken", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "goal", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "CampaignCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "contributor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "rewardMinted", "type": "uint256" }
    ],
    "name": "Contributed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "campaignId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "totalRaised", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "goalReached", "type": "bool" }
    ],
    "name": "Finalized",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "REWARD_RATE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "campaigns",
    "outputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "uint256", "name": "goal", "type": "uint256" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      { "internalType": "uint256", "name": "raised", "type": "uint256" },
      { "internalType": "bool", "name": "finalized", "type": "bool" },
      { "internalType": "address", "name": "creator", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "campaignsCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "campaignId", "type": "uint256" }],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "contributions",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "uint256", "name": "goal", "type": "uint256" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "createCampaign",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "campaignId", "type": "uint256" }],
    "name": "finalize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCampaigns",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "uint256", "name": "goal", "type": "uint256" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" },

          { "internalType": "uint256", "name": "raised", "type": "uint256" },
          { "internalType": "bool", "name": "finalized", "type": "bool" },
          { "internalType": "address", "name": "creator", "type": "address" }
        ],
        "internalType": "struct Crowdfunding.Campaign[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardToken",
    "outputs": [{ "internalType": "contract IRewardToken", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];


let provider;
let signer;
let user;

document.getElementById("connectBtn").onclick = connect;
document.getElementById("createBtn").onclick = createCampaign;

// ---------------- CONNECT ----------------
async function connect() {
  if (!window.ethereum) return alert("Install MetaMask");

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  signer = provider.getSigner();
  user = await signer.getAddress();

  document.getElementById("walletAddress").innerText = user;

  const net = await provider.getNetwork();
  if (net.chainId !== 11155111) {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }]
    });
  }

  document.getElementById("networkName").innerText = "Sepolia";

  const bal = await provider.getBalance(user);
  document.getElementById("ethBalance").innerText =
    ethers.utils.formatEther(bal);

  loadCampaigns();
}

//create
async function createCampaign() {
  if (!signer) return alert("Connect wallet");

  const title = titleInput.value;
  const goal = goalInput.value;
  const date = dateInput.value;

  if (!title || !goal || !date) return alert("Fill all fields");

  const contract = new ethers.Contract(
    CROWDFUND_ADDRESS,
    CROWDFUND_ABI,
    signer
  );

  const deadline = Math.floor(new Date(date).getTime() / 1000);
  const goalWei = ethers.utils.parseEther(goal);

  const tx = await contract.createCampaign(title, goalWei, deadline);
  await tx.wait();

  alert("Campaign created");
  loadCampaigns();
}

//campaigns
async function loadCampaigns() {
  const contract = new ethers.Contract(
    CROWDFUND_ADDRESS,
    CROWDFUND_ABI,
    provider
  );

  const campaigns = await contract.getCampaigns();
  const box = document.getElementById("campaigns");
  box.innerHTML = "";

  campaigns.forEach((c, i) => {
    const div = document.createElement("div");
    div.style.border = "1px solid #000";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";
    div.className = "campaign";

    div.innerHTML = `
      <b>${c.title}</b><br>
      Goal: ${ethers.utils.formatEther(c.goal)} ETH<br>
      Raised: ${ethers.utils.formatEther(c.raised)} ETH<br>
      Deadline: ${new Date(c.deadline * 1000).toLocaleDateString()}<br><br>

      <input id="amt-${i}" placeholder="ETH amount">
      <button id="btn-${i}">Contribute</button>
    `;

    box.appendChild(div);

    document.getElementById(`btn-${i}`).onclick = async () => {
      const amount = document.getElementById(`amt-${i}`).value;
      contribute(i, amount);
    };
  });
}

//contribute
async function contribute(id, amount) {
  if (!signer) return alert("Connect wallet");
  if (!amount || amount <= 0) return alert("Enter ETH amount");

  const contract = new ethers.Contract(
    CROWDFUND_ADDRESS,
    CROWDFUND_ABI,
    signer
  );

  const tx = await contract.contribute(id, {
    value: ethers.utils.parseEther(amount)
  });

  await tx.wait();

  alert("Contribution sent");
  loadCampaigns();
}
