'use client'

import { useEffect, useState } from "react";
import { useAccount, erc721ABI } from "wagmi";
import { readContract } from "@wagmi/core";
import Link from "next/link";

export default function Listing(props) {
  const [imageURI, setImageURI] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);

  const { address } = useAccount();
  
  const isOwner = address.toLowerCase() === props.seller.toLowerCase();

  async function fetchNFTDetails() {
    try {
     let tokenURI = await readContract({
        address: props.nftAddress,
        abi: erc721ABI,
        functionName: "tokenURI",
        args: [0],
      });
      tokenURI = tokenURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");

      const metadata = await fetch(tokenURI);
      const metadataJSON = await metadata.json();

      let image = metadataJSON.imageUrl;
      image = image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");

      setName(metadataJSON.name);
      setImageURI(image);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNFTDetails();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="card">
          <div className="text-white text-center my-auto h-full">Loading NFT...</div>
        </div>
      ) : (
        <div className="card">
          <Link href={`/${props.nftAddress}/${props.tokenId}`}>
            <img src={imageURI} alt="NFT Image Unavailable" key={Date.now()} />
            <div className="listing_container">
              <span>
                <b>
                  {name} - #{props.tokenId}
                </b>
              </span>
              <span>Price: {props.price/1000000000000000000} Sepolia</span>
              <span>
                Seller: {isOwner ? "You" : props.seller.substring(0, 6) + "..."}
              </span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}