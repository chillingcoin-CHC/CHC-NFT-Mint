// ✅ Addresses
const CHC_TOKEN_ADDRESS = "0xc50e66bca472da61d0184121e491609b774e2c37";
const CHILLBADGE_NFT_ADDRESS = "0x33EC7B370Ca70d3f7CbE6a03F72854ff2Ba9328f";
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

let web3;
let accounts = [];
let provider;
let web3Modal;

// ✅ Web3Modal setup
const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
    options: {
      rpc: {
        56: "https://bsc-dataseed.binance.org/" // BSC mainnet
      },
      chainId: 56
    }
  }
};

web3Modal = new window.Web3Modal.default({
  cacheProvider: true,
  providerOptions
});

async function connectWallet() {
  provider = await web3Modal.connect();
  web3 = new Web3(provider);
  accounts = await web3.eth.getAccounts();
  document.getElementById("walletAddress").innerText = accounts[0];
  await loadCHCBalance();
  await loadMintedCount();
}

// ✅ ABI: CHC Token (Only what's needed)
const CHC_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  }
];

// ✅ ABI: ChillBadge NFT
const NFT_ABI = [
  {
    "inputs": [],
    "name": "mintedCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function loadCHCBalance() {
  const token = new web3.eth.Contract(CHC_ABI, CHC_TOKEN_ADDRESS);
  const balance = await token.methods.balanceOf(accounts[0]).call();
  const readable = web3.utils.fromWei(balance);
  document.getElementById("chcBalance").innerText = parseFloat(readable).toLocaleString();
}

async function loadMintedCount() {
  const nft = new web3.eth.Contract(NFT_ABI, CHILLBADGE_NFT_ADDRESS);
  const count = await nft.methods.mintedCount().call();
  document.getElementById("mintedCount").innerText = count;
}

// ✅ Mint handler
document.getElementById("mintButton").addEventListener("click", async () => {
  const amount = parseInt(document.getElementById("mintAmount").value);
  if (!amount || amount < 1) return alert("Enter a valid mint amount");

  const CHC_COST_PER_NFT = web3.utils.toWei("5000000"); // 5 million CHC
  const totalCost = web3.utils.toBN(CHC_COST_PER_NFT).mul(web3.utils.toBN(amount));

  const token = new web3.eth.Contract(CHC_ABI, CHC_TOKEN_ADDRESS);
  const nft = new web3.eth.Contract(NFT_ABI, CHILLBADGE_NFT_ADDRESS);

  // ✅ Check balance
  const balance = await token.methods.balanceOf(accounts[0]).call();
  if (web3.utils.toBN(balance).lt(totalCost)) {
    return alert("Insufficient CHC balance");
  }

  // ✅ Approve CHC to be burned to dead address (if needed)
  const allowance = await token.methods.allowance(accounts[0], CHILLBADGE_NFT_ADDRESS).call();
  if (web3.utils.toBN(allowance).lt(totalCost)) {
    await token.methods.approve(CHILLBADGE_NFT_ADDRESS, totalCost).send({ from: accounts[0] });
  }

  // ✅ Mint loop
  for (let i = 0; i < amount; i++) {
    await nft.methods.mint().send({ from: accounts[0] });
  }

  document.getElementById("statusMessage").innerText = `🎉 Minted ${amount} ChillBadge NFT(s)!`;
  await loadCHCBalance();
  await loadMintedCount();
});

// ✅ Auto-connect if cached
if (web3Modal.cachedProvider) {
  connectWallet();
}

document.getElementById("connectWallet").addEventListener("click", connectWallet);
