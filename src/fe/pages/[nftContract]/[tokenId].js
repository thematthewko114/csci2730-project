'use client'

import { formatEther, parseEther } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createClient, fetchExchange } from "urql";
import { erc721ABI, useAccount } from "wagmi";
import MarketplaceABI from "../../abis/NFTMarketplace.json";
import Navbar from "../../components/Navbar";
import { MARKETPLACE_ADDRESS, SUBGRAPH_URL } from "../../constants";
import styles from "../../styles/Details.module.css";
import { readContract, writeContract, waitForTransaction } from "@wagmi/core";

export default function NFTDetails() {
  // Extract NFT contract address and Token ID from URL
  const router = useRouter();
  const nftAddress = router.query.nftContract;
  const tokenId = router.query.tokenId;
  // State variables to contain NFT and listing information
  const [listing, setListing] = useState();
  const [name, setName] = useState("");
  const [imageURI, setImageURI] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // State variable to contain new price if updating listing
  const [newPrice, setNewPrice] = useState("");

  // State variables to contain various loading states
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

    // Send the query to the subgraph GraphQL API, and get the response
    const response = await urqlClient.query(listingQuery).toPromise();
    const listingEntities = response.data.listingEntities;
    // If no active listing is found with the given parameters,
    // inform user of the error, then redirect to homepage
    if (listingEntities.length === 0) {
      window.alert("Listing does not exist or has been canceled");
      return router.push("/");
    }

    // Grab the first listing - which should be the only one matching the parameters
    const listing = listingEntities[0];

    // Update state variables
    setIsActive(listing.buyer === null);
    setIsOwner(address.toLowerCase() === listing.seller.toLowerCase());
    setListing(listing);
  }

  // Function to fetch NFT details from it's metadata, similar to the one in Listing.js
  async function fetchNFTDetails() {
    // Get token URI from contract
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

  // Function to call `updateListing` in the smart contract
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

  // Function to call `cancelListing` in the smart contract
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

  // Function to call `buyListing` in the smart contract
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

  // Load listing and NFT data on page load
   useEffect(() => {
     if (router.query.nftContract && router.query.tokenId && address) {
       Promise.all([fetchListing(), fetchNFTDetails()]).finally(() =>
         setLoading(false)
       );
     }
    //fetchListing()
   }, [router, address]);

  return (
    <>
      <Navbar />
      <div>
        {loading ? (
          <span>Loading...</span>
        ) : (
          <div className={styles.container}>
            <div className={styles.details}>
              <img src={imageURI} />
              <span>
                <b>
                  {name} - #{tokenId}
                </b>
              </span>
              <span>Price: {formatEther(listing&&listing.price?listing.price:0)} CELO</span>
              <span>
                <a
                  href={`https://alfajores.celoscan.io/address/${listing&&listing.seller?listing.seller:null}`}
                  target="_blank"
                >
                  Seller:{" "}
                  {isOwner ? "You" : listing && listing.seller ? listing.seller.substring(0, 6) + "...":null}
                </a>
              </span>
              <span>Status: {listing && listing.buyer === null ? "Active" : "Sold"}</span>
            </div>

            <div className={styles.options}>
              {!isActive && listing && listing.buyer && (
                <span>
                  Listing has been sold to{" "}
                  <a
                    href={`https://alfajores.celoscan.io/address/${listing&&listing.buyer?listing.buyer:null}`}
                    target="_blank"
                  >
                    {listing.buyer}
                  </a>
                </span>
              )}

              {isOwner && isActive && (
                <>
                  <div className={styles.updateListing}>
                    <input
                      type="text"
                      placeholder="New Price (in CELO)"
                      value={newPrice}
                      onChange={(e) => {
                        if (e.target.value === "") {
                          setNewPrice("0");
                        } else {
                          setNewPrice(e.target.value);
                        }
                      }}
                    ></input>
                    <button disabled={updating} onClick={updateListing}>
                      Update Listing
                    </button>
                  </div>

                  <button
                    className={styles.btn}
                    disabled={canceling}
                    onClick={cancelListing}
                  >
                    Cancel Listing
                  </button>
                </>
              )}

              {!isOwner && isActive && (
                <button
                  className={styles.btn}
                  disabled={buying}
                  onClick={buyListing}
                >
                  Buy Listing
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}