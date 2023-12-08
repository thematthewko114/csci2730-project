// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CourseNFT is ERC721 {
    constructor() ERC721("CourseNFT", "courseNFT") {
        // mint 5 NFTs to yourself
        for (uint i = 0; i < 5; i++) {
            _mint(msg.sender, i);
        }
    }

    // Hardcoded token URI will return the same metadata
    // for each NFT
    function tokenURI(uint) public pure override returns (string memory) {
        return "ipfs://bafkreifxhmqzr6oponz4y7fha6efrbzj6p6tk7wlluqkl5zolkhqz3wi7m";
    }
}