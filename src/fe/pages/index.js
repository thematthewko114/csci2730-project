import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Listing from "../components/Listing";
import { createClient, fetchExchange} from "urql";
import { SUBGRAPH_URL } from "../constants";
import { useAccount } from "wagmi";
import Head from "next/head";

export default function Home() {
    const [listings, setListings] = useState();
    const [loading, setLoading] = useState(false);

    const { isConnected } = useAccount();
    async function fetchListings() {
      setLoading(true);
      const listingsQuery = `
        query ListingsQuery {
          listingEntities {
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
        exchanges: [fetchExchange]
      });

      const response = await urqlClient.query(listingsQuery).toPromise();
      const listingEntities = response.data.listingEntities;

      const activeListings = listingEntities.filter((l) => l.buyer === null);

      setListings(activeListings);
      setLoading(false);
    }

    useEffect(() => {
      if (isConnected) {
        fetchListings();
      }
    }, [isConnected]);

    return (
      <>
        <Head>
          <title>CSCI2730 NFT Market</title>
        </Head>
        <Navbar />
        <div className="home_container">
        {
          !isConnected
          ?(
            <div className="text-black dark:text-white font-semibold">Please connect your wallet first!</div>
          )
          :loading && isConnected
          ?(
          <div className="text-black dark:text-white font-semibold">Loading...</div>
          )
          :!loading && listings && listings.length === 0?
          (
          <div className="text-black dark:text-white font-semibold">No listings found!</div>
          )
          :!loading && listings &&
            listings.map((listing) => {
              return (
                <Listing
                  nftAddress={listing.nftAddress}
                  tokenId={listing.tokenId}
                  price={listing.price}
                  seller={listing.seller}
                  key={listing.id}
                />
              );
            }
          )
        }
        </div>
      </>
    );
}