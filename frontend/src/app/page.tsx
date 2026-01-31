"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Coins, Globe, Lock, Sparkles } from "lucide-react";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x146cEd605d2BfF0Eee901AE210a24B18BD722d55";

const FloatingNode = ({ delay, x, y }: { delay: number; x: string; y: string }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
            opacity: [0.1, 0.3, 0.1],
            y: ["0%", "-10%", "0%"],
            scale: [1, 1.1, 1]
        }}
        transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay
        }}
        className="absolute w-24 h-24 bg-primary/10 rounded-full blur-3xl -z-10"
        style={{ left: x, top: y }}
    />
);

export default function Home() {
    return (
        <div className="relative isolate flex flex-col items-center space-y-40 overflow-hidden pb-40">
            {/* Background elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[1px] h-full bg-white/5" />
                <div className="absolute top-0 left-2/4 w-[1px] h-full bg-white/5" />
                <div className="absolute top-0 left-3/4 w-[1px] h-full bg-white/5" />
                <div className="absolute top-1/4 left-0 w-full h-[1px] bg-white/5" />
                <div className="absolute top-2/4 left-0 w-full h-[1px] bg-white/5" />
            </div>

            {/* Hero Section */}
            <section className="relative w-full max-w-7xl px-8 pt-40 text-left grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-12"
                >
                    <div className="inline-flex items-center gap-4 px-4 py-1.5 border border-primary/30 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.4em]">
                        POLYGON_PROTOCOL_AMOY
                    </div>

                    <h1 className="text-[120px] font-black tracking-tighter leading-[0.75] uppercase flex flex-col">
                        Decentralized
                        <span className="text-primary italic">Learning</span>
                        Node
                    </h1>

                    <p className="max-w-md text-neutral-500 text-lg font-bold uppercase tracking-tight leading-tight">
                        The ultimate vault for high-fidelity educational nodes. Encrypted, permanent, and creator-first.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-10">
                        <Link href="/library" className="btn-primary !px-12 !py-6 !text-lg flex items-center justify-center gap-4 !bg-primary !text-black italic">
                            BORROW_DATA
                            <ArrowRight className="w-5 h-5 -rotate-45" />
                        </Link>
                        <Link href="/upload" className="btn-secondary !px-12 !py-6 !text-lg flex items-center justify-center gap-4 !border-white !text-white italic">
                            DEPLOY_MODULE
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "circOut" }}
                    className="relative group"
                >
                    <div className="absolute -inset-10 bg-primary/20 blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="aspect-square relative flex items-center justify-center border border-white/10 p-2 overflow-hidden bg-neutral-900 rounded-sm">
                        <img
                            src="https://plus.unsplash.com/premium_photo-1661877737564-3dfd7282efcb?q=80&w=2100&auto=format&fit=crop"
                            alt="Node Visualization"
                            className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black via-black/40 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-primary animate-pulse rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">SYSTEM_ID: {CONTRACT_ADDRESS.slice(0, 10)}...</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>


            {/* Feature Bento */}
            <section className="w-full max-w-7xl px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-1 bg-white/5 border border-white/10">
                    <div className="md:col-span-2 p-16 bg-neutral-900 flex flex-col justify-between space-y-20 border border-white/5">
                        <h2 className="text-6xl font-black uppercase tracking-tighter leading-none italic">
                            Immutable<br />Protocol
                        </h2>
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest italic">Node Status</span>
                            <p className="text-neutral-400 text-sm font-bold uppercase tracking-tight leading-relaxed max-w-sm">
                                Every asset is hashed onto IPFS and registered via a non-interactive zero-knowledge verification contract.
                            </p>
                        </div>
                    </div>

                    <div className="p-16 bg-neutral-900 space-y-12 border border-white/5 hover:bg-neutral-800 transition-colors group">
                        <div className="w-12 h-12 bg-white flex items-center justify-center group-hover:bg-primary transition-colors">
                            <ShieldCheck className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight">Secure Vault</h3>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight leading-relaxed">
                            Enterprise-grade DRM (Digital Rights Management) via encrypted file chunking.
                        </p>
                    </div>

                    <div className="p-16 bg-primary space-y-12 border border-white/5 flex flex-col justify-between">
                        <div className="w-12 h-12 bg-black flex items-center justify-center">
                            <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter leading-tight text-black italic">
                            Instant Settlements
                        </h3>
                    </div>

                    <div className="lg:col-span-2 p-16 bg-neutral-900 border border-white/5 flex flex-col md:flex-row gap-12 items-center">
                        <div className="w-full h-40 bg-black border border-white/10 relative overflow-hidden flex items-center justify-center">
                            <span className="text-[8px] font-black text-white italic opacity-20 uppercase tracking-[2em]">DATA_STREAM</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight italic">Low Fees</h3>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight leading-relaxed">
                                Leveraging the efficiency of Polygon Layer 2 for millisecond transaction speeds.
                            </p>
                        </div>
                    </div>

                    <div className="md:col-span-2 p-16 bg-white flex items-end justify-between border border-white/5">
                        <h3 className="text-6xl font-black uppercase text-black italic tracking-tighter leading-[0.8]">
                            Verified<br />Nodes
                        </h3>
                        <div className="flex flex-col items-end">
                            <Globe className="w-10 h-10 text-black mb-4" />
                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Global Reach</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
