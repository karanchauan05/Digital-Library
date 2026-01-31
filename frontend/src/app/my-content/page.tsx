"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Unlock, ShieldCheck, Database, Key, X, Eye, Lock, FileText, Video } from "lucide-react";
import { getGatewayUrl } from "../../lib/pinata";
import { motion, AnimatePresence } from "framer-motion";
import SecureVideoPlayer from "../../components/SecureVideoPlayer";
import { useAntiPiracy } from "../../lib/useAntiPiracy";

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
    const [viewingAsset, setViewingAsset] = useState<{ url: string, title: string, type: 'pdf' | 'video' } | null>(null);
    const [walletConnected, setWalletConnected] = useState(false);

    // Enable global anti-piracy features
    useAntiPiracy(true);

    useEffect(() => {
        checkIfConnected();

        if (viewingAsset) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [viewingAsset]);

    const checkIfConnected = async () => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                setWalletConnected(true);
                fetchPurchasedContent(accounts[0].address);
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const fetchPurchasedContent = async (address: string) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            const count = await contract.contentCount();
            const fetched = [];

            // Targeted items to filter out
            const forbiddenTitles = ["SS", "MANUSH", "VIDEO"];

            for (let i = 1; i <= Number(count); i++) {
                const hasAccess = await contract.checkAccess(i, address);
                if (hasAccess) {
                    const item = await contract.contents(i);

                    if (forbiddenTitles.includes(item.title.toUpperCase())) continue;

                    const fullHash = await contract.getContentHash(i);
                    fetched.push({
                        id: item.id ? item.id.toString() : i.toString(),
                        title: item.title,
                        description: item.description,
                        previewUrl: item.previewUrl,
                        fullHash
                    });
                }
            }
            setPurchasedItems(fetched);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                setWalletConnected(true);
                setLoading(true);
                fetchPurchasedContent(accounts[0]);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const openAsset = async (item: any) => {
        const url = getGatewayUrl(item.fullHash);
        try {
            // Tentative detection
            const response = await fetch(url, { method: 'HEAD' });
            const contentType = response.headers.get('content-type');

            if (contentType?.includes('video')) {
                setViewingAsset({ url, title: item.title, type: 'video' });
            } else {
                setViewingAsset({ url, title: item.title, type: 'pdf' });
            }
        } catch (e) {
            // Fallback to title-based or default
            if (item.title.toLowerCase().includes('video') || item.title.toLowerCase().includes('lecture')) {
                setViewingAsset({ url, title: item.title, type: 'video' });
            } else {
                setViewingAsset({ url, title: item.title, type: 'pdf' });
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-40 pt-10">
            {/* Asset Header */}
            <div className="border-b border-white/10 pb-12 flex flex-col md:flex-row justify-between items-end gap-8">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-[0.3em]">
                        SECURE_VAULT_ACCESS
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter uppercase leading-[0.8]">
                        My<br />
                        <span className="text-secondary italic">Inventory</span>
                    </h1>
                </motion.div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-2">Authenticated_Nodes</span>
                    <span className="text-5xl font-black text-white italic">{purchasedItems.length}</span>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-white/5 border border-white/10 p-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-square bg-neutral-900 animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : !walletConnected ? (
                <div className="max-w-7xl mx-auto py-60 text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">
                        ACCESS_RESTRICTED
                    </div>
                    <h1 className="text-6xl font-black uppercase tracking-tighter">Connection<br /><span className="text-neutral-700 italic">Required</span></h1>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] max-w-sm mx-auto">Vault decryption requires valid signature from a registered educational node holder.</p>
                    <button
                        onClick={connectWallet}
                        className="btn-primary !px-12 !py-6"
                    >
                        INITIALIZE_AUTH
                    </button>
                </div>
            ) : purchasedItems.length === 0 ? (
                <div className="text-center py-60 border border-white/10 bg-neutral-900">
                    <h3 className="text-4xl font-black text-neutral-800 uppercase italic tracking-tighter">Inventory_Empty</h3>
                    <p className="text-neutral-600 font-bold uppercase tracking-widest mt-4 text-[10px]">Initialize acquisition protocol in the library</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-white/10 border border-white/10">
                    <AnimatePresence>
                        {purchasedItems.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative aspect-square bg-neutral-900 overflow-hidden border border-white/5 flex flex-col transition-all hover:bg-neutral-800"
                            >
                                <div className="relative flex-grow overflow-hidden">
                                    <img
                                        src={item.previewUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />

                                    <div className="absolute top-8 right-8">
                                        <div className="w-12 h-12 rounded-sm bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                                            <Unlock className="w-5 h-5 text-secondary" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 space-y-6 relative z-10">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Access_Granted</span>
                                        </div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter leading-none group-hover:text-secondary transition-colors underline decoration-secondary/0 group-hover:decoration-secondary/100 decoration-2 underline-offset-8">
                                            {item.title}
                                        </h3>
                                    </div>

                                    <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest italic">License_Hash</span>
                                            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">#{item.id.toString().padStart(6, '0')}</span>
                                        </div>
                                        <button
                                            onClick={() => openAsset(item)}
                                            className="btn-primary !px-8 !py-4 !text-[10px] flex items-center gap-3 !bg-secondary !text-black"
                                        >
                                            <Eye className="w-3 h-3" />
                                            INITIALIZE_STREAM
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Viewer Overlay */}
            <AnimatePresence>
                {viewingAsset && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-2xl p-4 md:p-12 flex items-center justify-center overflow-auto no-select"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-6xl space-y-8 my-auto"
                        >
                            <div className="flex justify-between items-center border-b border-white/10 pb-8">
                                <div className="flex flex-col gap-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-[0.3em]">
                                        DECRYPTING_STREAM
                                    </div>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter">{viewingAsset.title}</h2>
                                </div>
                                <button
                                    onClick={() => setViewingAsset(null)}
                                    className="p-6 bg-white/5 hover:bg-white text-white hover:text-black transition-all border border-white/10"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="bg-black border border-white/10 overflow-hidden shadow-2xl relative">
                                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-sm border border-white/10">
                                    <ShieldCheck className="w-3 h-3 text-secondary" />
                                    <span className="text-[8px] font-black text-secondary uppercase tracking-widest">NODE_PROTECTION_ENABLED</span>
                                </div>

                                <div className="aspect-video bg-neutral-900 flex items-center justify-center">
                                    {viewingAsset.type === 'pdf' ? (
                                        <div className="w-full h-[70vh] relative group">
                                            <div className="absolute inset-0 z-[205] bg-transparent cursor-default pointer-events-none" />
                                            <iframe
                                                src={`${viewingAsset.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                                className="w-full h-full border-none"
                                                title="Secure Stream"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-45deg]">
                                                <p className="text-9xl font-black text-white uppercase tracking-[1em]">SECURE_NODE</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full p-4">
                                            <SecureVideoPlayer url={viewingAsset.url} title={viewingAsset.title} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-white/5 border border-white/10 p-1">
                                <div className="bg-neutral-900 p-8 space-y-4">
                                    <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest italic">Protocol_License</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-[9px] font-black text-neutral-600 uppercase">Standard</span>
                                            <span className="text-[9px] font-black text-secondary uppercase tracking-[0.3em]">SECURE_NODE</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[9px] font-black text-neutral-600 uppercase">Transferable</span>
                                            <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em]">DISABLED</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2 bg-neutral-900 p-8 flex flex-col justify-center items-center gap-4">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-secondary/10 border border-secondary/20 rounded-full flex items-center justify-center">
                                            <Database className="w-6 h-6 text-secondary" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">DRM_ACTIVE</p>
                                            <p className="text-[8px] font-mono text-neutral-500 uppercase">Encrypted storage node authenticated</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
