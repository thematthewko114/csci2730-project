const hre = require("hardhat");

async function main() {

  // Load the NFT contract artifacts
  const celoNftContract = await hre.ethers.deployContract("CeloNFT");
  
  // Wait and Deploy the contract
  await celoNftContract.waitForDeployment();

  // Print the address of the NFT contract
  console.log("Celo NFT deployed to:", celoNftContract.target);

  // Load the marketplace contract artifacts
  const NFTMarket = await hre.ethers.deployContract(
    "NFTMarket"
  );

  // Wait and Deploy the contract
   await NFTMarket.waitForDeployment()

  // Log the address of the new contract
  console.log("NFT Market deployed to:", NFTMarket.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});