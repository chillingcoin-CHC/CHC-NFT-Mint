// ==== CONFIGURATION ====
const CHC_TOKEN_ADDRESS = "0xc50e66bca472da61d0184121e491609b774e2c37";
const NFT_CONTRACT_ADDRESS = "0x33EC7B370Ca70d3f7CbE6a03F72854ff2Ba9328f";
const BURN_AMOUNT = Web3.utils.toWei("5000000", "ether"); // 5M CHC per mint

// ==== WEB3MODAL SETUP ====
let web3, provider, selectedAccount;
const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
    options: {
      rpc: {
        56: "https://bsc-dataseed.binance.org/"
      },
      chainId: 56
    }
  }
};
const web3Modal = new window.Web3Modal.default({
  cacheProvider: true,
  providerOptions
});

// ==== ABIs ====
const chcAbi = [ /* ✅ Full CHC Token ABI (Paste yours here) */
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "remaining", "type": "uint256" }],
    "type": "function"
  }
];

const nftAbi = [
  {
    "inputs": [],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ==== UI HOOKS ====
const connectBtn = document.getElementById("connectWallet");
const mintBtn = document.getElementById("mintBtn");
const amountInput = document.getElementById("mintAmount");
const balanceSpan = document.getElementById("chcBalance");
const mintedSpan = document.getElementById("mintedCount");
const walletSpan = document.getElementById("walletAddress");
const statusMsg = document.getElementById("statusMessage");

// ==== CONNECT WALLET ====
async function connectWallet() {
  try {
    provider = await web3Modal.connect();
    web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    selectedAccount = accounts[0];
    walletSpan.innerText = selectedAccount;

    getCHCBalance();
    getMintedCount();
  } catch (err) {
    console.error("Connection failed:", err);
    statusMsg.innerText = "Wallet connection failed.";
  }
}

// ==== GET CHC BALANCE ====
async function getCHCBalance() {
  const token = new web3.eth.Contract(chcAbi, CHC_TOKEN_ADDRESS);
  const balance = await token.methods.balanceOf(selectedAccount).call();
  const formatted = Web3.utils.fromWei(balance, "ether");
  balanceSpan.innerText = parseFloat(formatted).toLocaleString();
}

// ==== GET MINTED COUNT ====
async function getMintedCount() {
  try {
    const nft = new web3.eth.Contract(nftAbi, NFT_CONTRACT_ADDRESS);
    const total = await nft.methods.totalSupply().call();
    mintedSpan.innerText = total;
  } catch {
    mintedSpan.innerText = "N/A";
  }
}

// ==== MINT NFTs ====
async function mintNFTs() {
  const quantity = parseInt(amountInput.value);
  if (!quantity || quantity <= 0) {
    statusMsg.innerText = "Enter a valid amount.";
    return;
  }

  const totalCost = Web3.utils.toBN(BURN_AMOUNT).muln(quantity);
  const token = new web3.eth.Contract(chcAbi, CHC_TOKEN_ADDRESS);
  const allowance = await token.methods.allowance(selectedAccount, NFT_CONTRACT_ADDRESS).call();

  if (Web3.utils.toBN(allowance).lt(totalCost)) {
    statusMsg.innerText = "Approving CHC for minting...";
    await token.methods.approve(NFT_CONTRACT_ADDRESS, totalCost.toString()).send({ from: selectedAccount });
  }

  statusMsg.innerText = "Minting ChillBadge NFT(s)...";
  const nft = new web3.eth.Contract(nftAbi, NFT_CONTRACT_ADDRESS);
  for (let i = 0; i < quantity; i++) {
    await nft.methods.mint().send({ from: selectedAccount });
  }

  statusMsg.innerText = `✅ Successfully minted ${quantity} ChillBadge(s)!`;
  getCHCBalance();
  getMintedCount();
}

// ==== INIT ====
connectBtn.addEventListener("click", connectWallet);
mintBtn.addEventListener("click", mintNFTs);

if (web3Modal.cachedProvider) {
  connectWallet();
}
