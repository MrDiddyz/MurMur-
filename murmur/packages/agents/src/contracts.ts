import { ethers } from "ethers";

export const MURMUR_NFT_ABI = [
  "function mintNFT(address to,string tokenURI,uint96 royaltyFee) public returns (uint256)",
  "function tokenCounter() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

export async function connectWallet(): Promise<{
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
  address: string;
}> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}

export async function mintNft(params: {
  contractAddress: string;
  tokenUri: string;
  royaltyFee: number;
  recipient?: string;
}): Promise<string> {
  const { signer, address } = await connectWallet();

  const contract = new ethers.Contract(
    params.contractAddress,
    MURMUR_NFT_ABI,
    signer,
  );

  const tx = await contract.mintNFT(
    params.recipient || address,
    params.tokenUri,
    params.royaltyFee,
  );

  await tx.wait();
  return tx.hash as string;
}

export * from "./read";
