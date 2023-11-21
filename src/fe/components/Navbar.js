import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  return (
    <div className={styles.navbar} suppressHydrationWarning>
        <div className={styles.left}>
            <Link href="/" className={styles.link}>Home</Link>
            <Link href="/create">Create Listing</Link>
        </div>
        
        <div className={styles.right}>
           <ConnectButton /> 
        </div>
    </div>
  );
}