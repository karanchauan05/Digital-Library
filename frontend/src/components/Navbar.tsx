"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Menu, X, Library, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [address, setAddress] = useState<string>("");
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    const navLinks = [
        { name: "Browse", href: "/library" },
        { name: "Upload", href: "/upload" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "My Assets", href: "/my-content" },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? "py-4 bg-black/80 backdrop-blur-xl border-b border-white/10" : "py-8"}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="flex items-center space-x-3 group relative">
                    <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center group-hover:bg-white transition-colors duration-500">
                        <Library className="text-black w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tighter text-white leading-none uppercase">
                            Edu<span className="text-primary">Chain</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-[0.2em] mt-1 pl-1">
                            NETWORK: AMOY
                        </span>
                    </div>
                </Link>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-black hover:bg-white px-4 py-2 transition-all duration-300 rounded-sm"
                        >
                            {link.name}
                        </Link>
                    ))}

                    <button
                        onClick={connectWallet}
                        className="btn-primary flex items-center space-x-3 px-6 py-3"
                    >
                        <Wallet className="w-4 h-4" />
                        <span className="text-xs">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "AUTH_SYSTEM"}</span>
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden p-2 text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="fixed inset-0 z-[110] bg-black p-10 lg:hidden flex flex-col justify-center"
                    >
                        <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-white">
                            <X className="w-10 h-10" />
                        </button>
                        <div className="flex flex-col space-y-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-5xl font-black uppercase tracking-tighter text-neutral-800 hover:text-primary transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <button
                                onClick={() => { connectWallet(); setIsMenuOpen(false); }}
                                className="btn-primary w-full py-8 mt-10"
                            >
                                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "CONNECT"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
