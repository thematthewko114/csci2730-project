import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <div className="navbar" suppressHydrationWarning>
        <div className="left">
          <div className="site_name">NFT Market</div>
          <Link href="/" className="link">Home</Link>
          <Link href="/create" className="ml-8">Sell</Link>
        </div>
        
        <div className="right">
           <ConnectButton /> 
        </div>
    </div>
  );
}