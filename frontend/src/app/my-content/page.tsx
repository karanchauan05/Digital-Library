"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Unlock, ShieldCheck, Database, Key, X, Eye, Lock } from "lucide-react";
import { getGatewayUrl } from "@/lib/pinata";
import { motion, AnimatePresence } from "framer-motion";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x146cEd605d2BfF0Eee901AE210a24B18BD722d55";
const ABI = [
    "function contentCount() view returns (uint256)",
    "function contents(uint256) view returns (uint256 id, string title, string description, string previewUrl, string contentHash, uint256 price, address creator, uint256 royaltyPercentage, bool isActive)",
    "function checkAccess(uint256 contentId, address user) view returns (bool)",
    "function getContentHash(uint256 contentId) view returns (string)"
];

export default function MyAssetsPage() {
    const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingPdf, setViewingPdf] = useState<string | null>(null);

    useEffect(() => {
        fetchPurchasedContent();

        // Anti-Piracy v1.0: Disable interaction
        const handleKeys = (e: KeyboardEvent) => {
            if (viewingPdf) {
                // Block Ctrl+P (Print), Ctrl+S (Save), Ctrl+U (Source)
                if (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'u')) {
                    e.preventDefault();
                    alert("EduChain Anti-Piracy: Action Blocked.");
                }
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            if (viewingPdf) e.preventDefault();
        };

        window.addEventListener("keydown", handleKeys);
        document.addEventListener("contextmenu", handleContextMenu);

        if (viewingPdf) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            window.removeEventListener("keydown", handleKeys);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.body.style.overflow = "auto";
        };
    }, [viewingPdf]);

    const fetchPurchasedContent = async () => {
        try {
            if (!window.ethereum) return;
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const address = accounts[0];
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            const count = await contract.contentCount();
            const fetched = [];

            for (let i = 1; i <= Number(count); i++) {
                const hasAccess = await contract.checkAccess(i, address);
                if (hasAccess) {
                    const item = await contract.contents(i);
                    const fullHash = await contract.getContentHash(i);
                    fetched.push({ ...item, fullHash });
                }
            }
            setPurchasedItems(fetched);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-32 no-select">

            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div className="space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-green-500">
                        <Lock className="w-3 h-3" /> Anti-Piracy Shield Enabled
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none">
                        My Unlocked <br /> <span className="text-primary">Assets</span>
                    </h2>
                    <p className="text-gray-500 font-medium max-w-md">Securely access your purchased nodes. Printing and direct downloading are disabled for your security.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="glass-card !p-4 !rounded-xl flex items-center gap-3">
                        <Database className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-[8px] font-bold text-gray-500 uppercase">Synchronized</p>
                            <p className="text-sm font-bold">{purchasedItems.length} Assets</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {loading ? (
                <div className="py-40 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest animate-pulse">Syncing Vault...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {purchasedItems.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-card flex flex-col md:flex-row items-center gap-6 group hover:bg-slate-50/80 !p-4 !rounded-xl border-slate-100"
                            >
                                <div className="relative w-full md:w-32 h-40 md:h-24 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50">
                                    <img
                                        src={item.previewUrl}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
                                </div>

                                <div className="flex flex-col md:flex-row flex-grow items-start md:items-center justify-between gap-4 w-full px-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
                                        </div>
                                        <p className="text-gray-500 text-xs line-clamp-1 max-w-xl">{item.description}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                <Key className="w-3 h-3" /> Node #{item.id.toString().padStart(4, '0')}
                                            </span>
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Decrypted</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setViewingPdf(getGatewayUrl(item.fullHash))}
                                        className="btn-primary w-full md:w-auto text-[10px] px-8 py-3 rounded-lg flex items-center justify-center gap-3 font-bold uppercase tracking-widest shadow-lg shadow-primary/10"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Access Node
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Anti-Piracy Secure Viewer */}
            <AnimatePresence>
                {viewingPdf && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex flex-col bg-slate-900 overflow-hidden"
                    >
                        {/* Fullscreen Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-white/5 z-[210]">
                            <div className="flex items-center gap-4 text-white">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold uppercase tracking-widest text-sm text-white flex items-center gap-2">
                                        Secure Viewer
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold bg-green-500/20 text-green-400 border border-green-500/20">PROTECTED</span>
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase hidden md:block">Session ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <p className="text-[10px] text-red-400 font-bold uppercase animate-pulse hidden md:block tracking-widest">
                                    Unauthorized distribution locked
                                </p>
                                <button
                                    onClick={() => setViewingPdf(null)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-white border border-white/10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Fullscreen Body */}
                        <div className="flex-grow relative bg-slate-950 no-select">
                            <div className="absolute inset-0 z-[205] bg-transparent cursor-default pointer-events-none"
                                style={{ backgroundImage: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)" }}
                            />

                            {/* Watermark */}
                            <div className="absolute inset-0 z-[206] pointer-events-none flex items-center justify-center opacity-[0.03] select-none rotate-[-45deg]">
                                <p className="text-8xl font-black text-white uppercase tracking-[1em]">EDU CHAIN SECURE</p>
                            </div>

                            <iframe
                                src={`${viewingPdf}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                className="w-full h-full border-none shadow-2xl relative z-[204]"
                                title="EduChain Secure Reader"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {purchasedItems.length === 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-40 glass rounded-xl border-dashed border-2 border-slate-100"
                >
                    <div className="p-6 bg-white/5 rounded-full w-fit mx-auto mb-6">
                        <Database className="w-10 h-10 text-gray-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-600 uppercase">Your Vault is Empty</h3>
                    <p className="text-gray-600 font-medium mt-2">Acquire content from the library to unlock knowledge nodes.</p>
                    <a href="/library" className="btn-secondary mt-8 inline-block px-10 py-4 !rounded-lg font-bold tracking-widest uppercase">
                        Explore Library
                    </a>
                </motion.div>
            )}
        </div>
    );
}
