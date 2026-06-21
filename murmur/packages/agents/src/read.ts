import { ethers } from "ethers";

import { MURMUR_NFT_ABI } from "./contracts";

export async function getTokenCounter(contractAddress: string): Promise<bigint> {
  const provider = new ethers.JsonRpcProvider();
  const contract = new ethers.Contract(contractAddress, MURMUR_NFT_ABI, provider);
  return (await contract.tokenCounter()) as bigint;
}

export async function getTokenUri(
  contractAddress: string,
  tokenId: bigint | number,
): Promise<string> {
  const provider = new ethers.JsonRpcProvider();
  const contract = new ethers.Contract(contractAddress, MURMUR_NFT_ABI, provider);
  return (await contract.tokenURI(tokenId)) as string;
}
