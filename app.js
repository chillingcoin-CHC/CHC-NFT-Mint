const CHC_ADDRESS = "0xa5E6F40Bd1D16d21Aeb5e89AEE50f307fc4eA0b3";
const NFT_CONTRACT = "0x33EC7B370Ca70d3f7CbE6a03F72854ff2Ba9328f";

const CHC_ABI = [
  "function approve(address spender, uint amount) public returns (bool)",
  "function balanceOf(address owner) view returns (uint)"
];

const NFT_ABI = [
  "function mint() public",
  "function nextTokenId() view returns (uint256)"
];

let provider, signer, walletAddress;
const pricePerNFT = ethers.utils.parseUnits("5000000", 18); // 5 million CHC

// 🟢 Connect wallet
async function connectWallet() {
  const web3Modal = new Web3Modal.default();
  const instance = await web3Modal.connect();
  provider = new ethers.providers.Web3Provider(instance);
  signer = provider.getSigner();
  walletAddress = await signer.getAddress();
  await getCHCBalance();
  await updateSupply();
}

// 🟢 Get CHC balance
async function getCHCBalance() {
  const chc = new ethers.Contract(CHC_ADDRESS, CHC_ABI, provider);
  const balance = await chc.balanceOf(walletAddress);
  document.getElementById("chcBalance").innerText = ethers.utils.formatUnits(balance, 18);
}

// 🟢 Update minted count
async function updateSupply() {
  const nft = new ethers.Contract(NFT_CONTRACT, NFT_ABI, provider);
  const nextId = await nft.nextTokenId();
  document.getElementById("mintedCount").innerText = (nextId.toNumber() - 1).toString();
}

// 🟢 Mint NFT(s)
async function mintMultiple() {
  const quantity = parseInt(document.getElementById("mintAmount").value);
  if (quantity < 1 || quantity > 10) {
    alert("Please enter a quantity between 1 and 10.");
    return;
  }

  const totalPrice = pricePerNFT.mul(quantity);
  const chc = new ethers.Contract(CHC_ADDRESS, CHC_ABI, signer);
  const nft = new ethers.Contract(NFT_CONTRACT, NFT_ABI, signer);

  try {
    const approveTx = await chc.approve(NFT_CONTRACT, totalPrice);
    await approveTx.wait();

    for (let i = 0; i < quantity; i++) {
      const mintTx = await nft.mint();
      await mintTx.wait();
    }

    showSuccessModal();
    await getCHCBalance();
    await updateSupply();
  } catch (err) {
    console.error(err);
    alert("❌ Mint failed. See console for error.");
  }
}

// ✅ Show modal, play sound
function showSuccessModal() {
  const modal = document.getElementById("successModal");
  modal.style.display = "block";

  const audio = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_7a7083b373.mp3");
  audio.volume = 0.5;
  audio.play();

  setTimeout(() => {
    modal.style.display = "none";
  }, 4000); // auto close after 4 sec
}

// ✅ Manual close
function closeModal() {
  document.getElementById("successModal").style.display = "none";
}
