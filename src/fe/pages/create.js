'use client'

import { isAddress, parseEther } from "ethers";
import Link from "next/link";
import { useState } from "react";
import { erc721ABI, useAccount } from "wagmi";
import { readContract, writeContract } from "@wagmi/core";
import MarketplaceABI from "../abis/NFTMarketplace.json";
import Navbar from "../components/Navbar";
import { MARKETPLACE_ADDRESS } from "../constants";
import Head from "next/head";
import { useRouter } from 'next/router'


export default function Create() {
  const [nftAddress, setNftAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showListingLink, setShowListingLink] = useState(false);
  const { address } = useAccount();
  const router = useRouter();

  async function handleCreateListing() {
    setLoading(true);

    try {
      const isValidAddress = isAddress(nftAddress);
      if (!isValidAddress) {
        throw new Error(`Invalid contract address`);
      }
      else if(price === "" || price === "0") {
        throw new Error(`Please enter a valid price`);
      }

      await requestApproval();
      await createListing();
      router.push(`/${nftAddress}/${tokenId}`);
    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  }

  async function requestApproval() {
  const ownerOf = await readContract({
    address: nftAddress,
    abi: erc721ABI,
    functionName: "ownerOf",
    args: [tokenId]
  });

  const isApprovedForAll = await readContract({
    address: nftAddress,
    abi: erc721ABI,
    functionName: "isApprovedForAll",
    args: [address, MARKETPLACE_ADDRESS]
  });

    if (ownerOf.toLowerCase() !== address.toLowerCase()) {
      throw new Error(`You do not own this NFT`);
    }

    if (!isApprovedForAll) {
    console.log("Requesting approval over NFTs...");
     await writeContract({
       account: address,
       address: nftAddress,
       abi: erc721ABI,
       functionName: "setApprovalForAll",
       args: [MARKETPLACE_ADDRESS, true]
     });
    }
  }

  async function createListing() {
   await writeContract({
      account: address,
      address: MARKETPLACE_ADDRESS,
      abi: MarketplaceABI,
      functionName: "createListing",
      args: [nftAddress, tokenId, parseEther(price)]
    });
  }

  return (
    <>
      <Head>
        <title>CSCI2730 NFT Market - Sell NFT</title>
      </Head>
      <Navbar />

      <div className="create_container">
        <input
          type="text"
          placeholder="NFT Address"
          value={nftAddress}
          onChange={(e) => setNftAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Price (Sepolia)"
          value={price}
          onChange={(e) => {
            if (e.target.value === "") {
              setPrice("0");
            } else {
              setPrice(e.target.value);
            }
          }}
        />
        <button onClick={handleCreateListing} disabled={loading}>
          {loading ? "Loading..." : "Sell"}
        </button>

        {showListingLink && (
          <Link href={`/${nftAddress}/${tokenId}`}>
              <button>View Listing</button>
          </Link>
        )}
      </div>
    </>
  );
}