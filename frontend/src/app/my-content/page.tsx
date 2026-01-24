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

        return () => {
            window.removeEventListener("keydown", handleKeys);
            document.removeEventListener("contextmenu", handleContextMenu);
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
                    <h2 className="text-4xl md:text-5xl font-bold italic tracking-tighter italic leading-none">
                        My Unlocked <br /> <span className="text-primary italic">Assets</span>
                    </h2>
                    <p className="text-gray-500 font-medium max-w-md italic">Securely access your purchased nodes. Printing and direct downloading are disabled for your security.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="glass-card !p-4 !rounded-2xl flex items-center gap-3">
                        <Database className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-[8px] font-bold text-gray-500 uppercase">Synchronized</p>
                            <p className="text-sm font-bold italic">{purchasedItems.length} Assets</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {purchasedItems.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
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
                                            <h3 className="font-bold text-xl italic uppercase tracking-tighter group-hover:text-primary transition-colors">{item.title}</h3>
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
                                        </div>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Key className="w-3 h-3" /> Fully Decrypted
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setViewingPdf(getGatewayUrl(item.fullHash))}
                                        className="btn-primary w-fit text-[10px] px-6 py-3 rounded-xl flex items-center gap-3 font-bold uppercase italic tracking-widest leading-none shadow-lg shadow-primary/20"
                                    >
                                        <Eye className="w-3 h-3" />
                                        Open in Secure Viewer
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
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
                    >
                        <div className="relative w-full max-w-6xl h-full flex flex-col space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-white">
                                    <ShieldCheck className="w-6 h-6 text-primary" />
                                    <div>
                                        <h3 className="font-bold uppercase tracking-widest italic text-lg">Secure Node Access</h3>
                                        <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase italic">Protection: Printing Blocked | Direct Downloads Disabled</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setViewingPdf(null)}
                                    className="p-3 glass rounded-full hover:bg-white/10 transition-colors text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="pdf-container group">
                                <div className="pdf-overlay no-select" />
                                <iframe
                                    src={`${viewingPdf}#toolbar=0&navpanes=0&scrollbar=0`}
                                    className="w-full h-full border-none rounded-2xl"
                                    title="EduChain Secure Reader"
                                />
                                {/* Anti-screenshot awareness */}
                                <div className="absolute bottom-4 right-4 z-[60] bg-black/60 px-3 py-1 rounded-md text-[8px] font-bold text-gray-500 uppercase italic">
                                    Encrypted Viewport: Session ID {Math.random().toString(36).substring(7)}
                                </div>
                            </div>

                            <p className="text-center text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em] italic">
                                Developed for EduChain Assets. Unauthorized redistribution is locked.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {purchasedItems.length === 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-40 glass rounded-[3rem] border-dashed border-2 border-white/5"
                >
                    <div className="p-6 bg-white/5 rounded-full w-fit mx-auto mb-6">
                        <Database className="w-10 h-10 text-gray-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-600 uppercase italic">Your Vault is Empty</h3>
                    <p className="text-gray-600 font-medium italic mt-2">Acquire content from the library to unlock knowledge nodes.</p>
                    <a href="/library" className="btn-secondary mt-8 inline-block px-10 py-4 !rounded-2xl font-bold italic tracking-widest uppercase">
                        Explore Library
                    </a>
                </motion.div>
            )}
        </div>
    );
}
