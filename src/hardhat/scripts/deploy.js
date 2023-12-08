const hre = require("hardhat");

async function main() {

  const CourseNftContract = await hre.ethers.deployContract("CourseNFT");
  
  await CourseNftContract.waitForDeployment();

  console.log("Sepolia NFT deployed to:", CourseNftContract.target);

  const NFTMarket = await hre.ethers.deployContract(
    "NFTMarket"
  );

   await NFTMarket.waitForDeployment()

  console.log("NFT Market deployed to:", NFTMarket.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});