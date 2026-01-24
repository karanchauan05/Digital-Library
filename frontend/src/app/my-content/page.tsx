"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Unlock, FileText, ExternalLink, ShieldCheck, Database, Key } from "lucide-react";
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

    useEffect(() => {
        fetchPurchasedContent();
    }, []);

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
        <div className="max-w-6xl mx-auto space-y-12 pb-32">

            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div className="space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-green-500">
                        <ShieldCheck className="w-3 h-3" /> Encrypted Vault Status: Secure
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter italic leading-none">
                        Private <br /> <span className="text-primary italic">Knowledge Vault</span>
                    </h2>
                    <p className="text-gray-500 font-medium max-w-md">Your decentralized assets are indexed and ready for decryption.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="glass-card !p-4 !rounded-2xl flex items-center gap-3">
                        <Database className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-[8px] font-black text-gray-500 uppercase">Synchronized</p>
                            <p className="text-sm font-black italic">{purchasedItems.length} Nodes</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {loading ? (
                <div className="py-40 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-black uppercase tracking-widest animate-pulse">Scanning Vault...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {purchasedItems.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                className="glass-card flex items-center gap-6 group hover:bg-white/[0.04] !p-6 !rounded-[2.5rem]"
                            >
                                <div className="relative w-24 h-24 rounded-2xl overflow-hidden glass border border-white/10 flex-shrink-0">
                                    <img
                                        src={item.previewUrl}
                                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay" />
                                </div>

                                <div className="flex flex-col justify-between py-1 flex-grow space-y-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-black text-xl italic uppercase tracking-tighter group-hover:text-primary transition-colors">{item.title}</h3>
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
                                        </div>
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <Key className="w-3 h-3" /> Node Decrypted
                                        </p>
                                    </div>

                                    <a
                                        href={getGatewayUrl(item.fullHash)}
                                        target="_blank"
                                        className="btn-primary w-fit text-[10px] px-6 py-3 rounded-xl flex items-center gap-3 font-black uppercase italic tracking-widest leading-none"
                                    >
                                        <Unlock className="w-3 h-3" />
                                        Access Data Node
                                        <ExternalLink className="w-3 h-3 opacity-50" />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {purchasedItems.length === 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-40 glass rounded-[3rem] border-dashed border-2 border-white/5"
                >
                    <div className="p-6 bg-white/5 rounded-full w-fit mx-auto mb-6">
                        <Database className="w-10 h-10 text-gray-700" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-600 uppercase italic">Vault Empty</h3>
                    <p className="text-gray-600 font-medium italic mt-2">Zero datasets detected in your primary storage.</p>
                    <a href="/library" className="btn-secondary mt-8 inline-block px-10 py-4 !rounded-2xl font-black italic tracking-widest uppercase">
                        Explore Market Nodes
                    </a>
                </motion.div>
            )}
        </div>
    );
}
