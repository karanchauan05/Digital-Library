"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Menu, X, Library, Upload } from "lucide-react";

export default function Navbar() {
    const [address, setAddress] = useState<string>("");
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const connectWallet = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                setAddress(accounts[0]);
            } catch (err) {
                console.error("User denied account access");
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass py-3" : "py-5"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                        <Library className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        EduChain Lib
                    </span>
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    <Link href="/library" className="hover:text-primary transition-colors">Browse</Link>
                    <Link href="/upload" className="hover:text-primary transition-colors">Upload</Link>
                    <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                    <Link href="/my-content" className="hover:text-primary transition-colors">My Assets</Link>

                    <button
                        onClick={connectWallet}
                        className="btn-primary flex items-center space-x-2 text-sm"
                    >
                        <Wallet className="w-4 h-4" />
                        <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
