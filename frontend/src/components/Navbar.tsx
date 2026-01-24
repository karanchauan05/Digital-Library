"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Menu, X, Library, Cpu, Globe, Activity } from "lucide-react";
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
        { name: "Browse Nodes", href: "/library" },
        { name: "Deploy", href: "/upload" },
        { name: "Terminal", href: "/dashboard" },
        { name: "Inventory", href: "/my-content" },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? "py-4 glass border-b border-white/5 shadow-2xl" : "py-8"}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="flex items-center space-x-3 group relative">
                    <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-500">
                        <Cpu className="text-white w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black uppercase italic tracking-tighter leading-none italic">EduChain</span>
                        <div className="flex items-center gap-1">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">Library Console</span>
                            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    </div>
                </Link>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center space-x-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[11px] font-black uppercase tracking-[0.2em] italic text-gray-400 hover:text-white transition-colors relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
                        </Link>
                    ))}

                    <button
                        onClick={connectWallet}
                        className="btn-primary !rounded-xl !px-6 !py-3 flex items-center space-x-3 group/btn"
                    >
                        <Wallet className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                        <span className="text-xs font-black uppercase italic tracking-widest leading-none">
                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Node"}
                        </span>
                    </button>

                    <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-gray-600 uppercase">Latency</span>
                            <span className="text-[8px] font-black text-green-500 uppercase">24ms</span>
                        </div>
                        <Activity className="w-4 h-4 text-green-500/50" />
                    </div>
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
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden glass border-t border-white/5 overflow-hidden"
                    >
                        <div className="p-8 flex flex-col space-y-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-lg font-black uppercase italic tracking-widest text-gray-400 hover:text-primary transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <button
                                onClick={() => { connectWallet(); setIsMenuOpen(false); }}
                                className="btn-primary w-full py-5 rounded-2xl font-black uppercase italic tracking-widest"
                            >
                                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
