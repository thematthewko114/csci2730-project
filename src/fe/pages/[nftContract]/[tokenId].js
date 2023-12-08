'use client'

import { formatEther, parseEther } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createClient, fetchExchange } from "urql";
import { erc721ABI, useAccount } from "wagmi";
import MarketplaceABI from "../../abis/NFTMarketplace.json";
import Navbar from "../../components/Navbar";
import { MARKETPLACE_ADDRESS, SUBGRAPH_URL } from "../../constants";
import { readContract, writeContract, waitForTransaction } from "@wagmi/core";
import Head from "next/head";

export default function NFTDetails() {
  const router = useRouter();
  const nftAddress = router.query.nftContract;
  const tokenId = router.query.tokenId;
  const [listing, setListing] = useState();
  const [name, setName] = useState("");
  const [imageURI, setImageURI] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const [newPrice, setNewPrice] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [buying, setBuying] = useState(false);

  const {address} = useAccount()


  async function fetchListing() {
    const listingQuery = `
      query ListingsQuery {
  listingEntities(where: {nftAddress: "${nftAddress}", tokenId: "${tokenId}"}) {
    id
    nftAddress
    tokenId
    price
    seller
    buyer
  }
}
    `;

   const urqlClient = createClient({
     url: SUBGRAPH_URL,
     exchanges: [fetchExchange],
   });

    const response = await urqlClient.query(listingQuery).toPromise();
    const listingEntities = response.data.listingEntities;
    if (listingEntities.length === 0) {
      window.alert("Listing does not exist or has been canceled");
      return router.push("/");
    }

    const listing = listingEntities[0];

    setIsActive(listing.buyer === null);
    setIsOwner(address.toLowerCase() === listing.seller.toLowerCase());
    setListing(listing);
  }

  async function fetchNFTDetails() {
    let tokenURI = await readContract({
      address: nftAddress,
      abi: erc721ABI,
      functionName: "tokenURI",
      args: [tokenId],
    });

    tokenURI = tokenURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");

    console.log(tokenURI);
    const metadata = await fetch(tokenURI, {method: 'GET', redirect: 'follow'});
    const metadataJSON = await metadata.json();

    let image = metadataJSON.imageUrl;
    image = image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");

    setName(metadataJSON.name);
    setImageURI(image);
  }

  async function updateListing() {
    const { hash } = await writeContract({
      account: address,
      address: MARKETPLACE_ADDRESS,
      abi: MarketplaceABI,
      functionName: "updateListing",
      args: [nftAddress, tokenId, parseEther(newPrice)],
    });
    setUpdating(true);
    await waitForTransaction({hash});
    await fetchListing();
    setUpdating(false);
  }

  async function cancelListing() {
   const { hash } = await writeContract({
      account: address,
      address: MARKETPLACE_ADDRESS,
      abi: MarketplaceABI,
      functionName: "cancelListing",
      args: [nftAddress, tokenId]
    }); 
    setCanceling(true)
    await waitForTransaction({hash});
    window.alert("Listing canceled");
    await router.push("/");
    setCanceling(false);
  }

  async function buyListing() {
   setBuying(true)
     const { hash } = await writeContract({
       account: address,
       address: MARKETPLACE_ADDRESS,
       abi: MarketplaceABI,
       functionName: "purchaseListing",
       args: [nftAddress, tokenId],
       value: listing.price,
     }); 
    await waitForTransaction({hash});
    await fetchListing();
    setBuying(false);
  }

   useEffect(() => {
     if (router.query.nftContract && router.query.tokenId && address) {
       Promise.all([fetchListing(), fetchNFTDetails()]).finally(() =>
         setLoading(false)
       );
     }
   }, [router, address]);

  return (
    <>
      <Head>
        <title>CSCI2730 NFT Market - NFT Details</title>
      </Head>
      <Navbar />
      <div>
        {loading ? (
          <span>Loading...</span>
        ) : (
          <div className="detail_container">
            <div className="detail_info">
              <img src={imageURI} />
              <span>
                <b>
                  {name} - #{tokenId}
                </b>
              </span>
              <span>Price: {formatEther(listing&&listing.price?listing.price:0)} Sepolia</span>
              <span>
                <a
                  href={`https://sepolia.etherscan.io/address/${listing&&listing.seller?listing.seller:null}`}
                  target="_blank"
                >
                  Seller:{" "}
                  {isOwner ? "You" : listing && listing.seller ? listing.seller.substring(0, 6) + "...":null}
                </a>
              </span>
              <span>Status: {listing && listing.buyer === null ? "Active" : "Sold"}</span>
            </div>

            <div className="options">
              {!isActive && listing && listing.buyer && (
                <span>
                  Listing has been sold to{" "}
                  <a
                    href={`https://sepolia.etherscan.io/address/${listing&&listing.buyer?listing.buyer:null}`}
                    target="_blank"
                  >
                    {listing.buyer}
                  </a>
                </span>
              )}

              {isOwner && isActive && (
                <>
                  <div className="update_listing">
                    <input
                      type="text"
                      placeholder="New Price (Sepolia)"
                      value={newPrice}
                      onChange={(e) => {
                        if (e.target.value === "") {
                          setNewPrice("0");
                        } else {
                          setNewPrice(e.target.value);
                        }
                      }}
                    ></input>
                    <button disabled={updating} onClick={updateListing} className="update_btn bg-orange-500 text-white">
                      Update sale price
                    </button>
                  </div>

                  <button
                    className="detail_btn bg-red-600 text-white mt-4"
                    disabled={canceling}
                    onClick={cancelListing}
                  >
                    Remove from market
                  </button>
                </>
              )}

              {!isOwner && isActive && (
                <button
                  className="detail_btn bg-green-600 mt-4"
                  disabled={buying}
                  onClick={buyListing}
                >
                  Purchase this NFT
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}