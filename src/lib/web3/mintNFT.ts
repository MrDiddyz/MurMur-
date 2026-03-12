import {
  BrowserProvider,
  Contract,
  type ContractTransactionResponse,
  type Eip1193Provider,
} from "ethers";

const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;

const abi = ["function mint(address to,string uri) public returns(uint256)"];

function getEthereumProvider(): Eip1193Provider {
  const ethereum = (window as Window & { ethereum?: Eip1193Provider }).ethereum;

  if (!ethereum) {
    throw new Error("MetaMask is not installed");
  }

  return ethereum;
}

export async function mintNFT(tokenURI: string): Promise<ContractTransactionResponse> {
  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_NFT_CONTRACT_ADDRESS is not configured");
  }

  const provider = new BrowserProvider(getEthereumProvider());

  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();
  const contract = new Contract(contractAddress, abi, signer);

  const tx = await contract.mint(await signer.getAddress(), tokenURI);
  await tx.wait();

  return tx;
}
