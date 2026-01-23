"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Coins } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center space-y-20">
            {/* Hero Section */}
            <section className="text-center space-y-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-4"
                >
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
                        EDUCATE & <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-glow bg-[length:200%_auto] bg-animate-gradient">
                            EARN SECURELY
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl">
                        The first blockchain-powered educational library on Polygon.
                        Protect your IP, earn royalties, and share knowledge with the world.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex space-x-4 justify-center"
                >
                    <Link href="/library" className="btn-primary flex items-center space-x-2 px-8 py-4">
                        <span>Explore Library</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="/upload" className="btn-secondary px-8 py-4">
                        Start Uploading
                    </Link>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                <div className="glass-card">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                        <ShieldCheck className="text-primary w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Anti-Piracy</h3>
                    <p className="text-gray-400">Content hashes are encrypted and gated by smart contracts. Only owners can access the full content.</p>
                </div>

                <div className="glass-card">
                    <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mb-4">
                        <Coins className="text-secondary w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Automated Royalties</h3>
                    <p className="text-gray-400">Smarts contracts ensure creators get paid instantly for every purchase without any middleman.</p>
                </div>

                <div className="glass-card">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                        <Zap className="text-green-500 w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Global Library</h3>
                    <p className="text-gray-400">Decentralized storage powered by IPFS ensures your content lives forever on the web.</p>
                </div>
            </section>
        </div>
    );
}
