const hre = require("hardhat");

async function main() {

  // Load the NFT contract artifacts
  const CourseNftContract = await hre.ethers.deployContract("CourseNFT");
  
  // Wait and Deploy the contract
  await CourseNftContract.waitForDeployment();

  // Print the address of the NFT contract
  console.log("Sepolia NFT deployed to:", CourseNftContract.target);

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