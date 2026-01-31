"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Search, ShoppingCart, BookOpen, Filter, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x146cEd605d2BfF0Eee901AE210a24B18BD722d55";
const ABI = [
    "function contentCount() view returns (uint256)",
    "function contents(uint256) view returns (uint256 id, string title, string description, string previewUrl, string contentHash, uint256 price, address creator, uint256 royaltyPercentage, bool isActive, bool isDeleted)",
    "function checkAccess(uint256 contentId, address user) view returns (bool)",
    "function purchaseContent(uint256 contentId) payable"
];

export default function LibraryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x...") return;

            const rpcs = [
                "https://rpc-amoy.polygon.technology",
                "https://polygon-amoy-bor-rpc.publicnode.com",
                "https://rpc.ankr.com/polygon_amoy"
            ];

            let provider;
            let contract;
            let success = false;

            for (const rpc of rpcs) {
                try {
                    provider = new ethers.JsonRpcProvider(rpc);
                    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
                    await contract.contentCount();
                    success = true;
                    break;
                } catch (e) {
                    console.warn(`RPC ${rpc} failed`);
                }
            }

            if (!success || !contract) throw new Error("Connection failed");

            const count = await contract.contentCount();
            const fetchedItems = [];
            const forbiddenTitles = ["SS", "MANUSH", "VIDEO"];

            for (let i = 1; i <= Number(count); i++) {
                const item = await contract.contents(i);
                if (item.isActive && !item.isDeleted) {
                    if (forbiddenTitles.includes(item.title.toUpperCase())) continue;

                    fetchedItems.push({
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        previewUrl: item.previewUrl,
                        price: item.price,
                        creator: item.creator,
                        isActive: item.isActive,
                        isDeleted: item.isDeleted
                    });
                }
            }
            setItems(fetchedItems.reverse());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const buyContent = async (id: number, price: bigint) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            const feeData = await provider.getFeeData();

            const tx = await contract.purchaseContent(id, {
                value: price,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? ethers.parseUnits("30", "gwei"),
                maxFeePerGas: feeData.maxFeePerGas ?? ethers.parseUnits("35", "gwei"),
            });
            await tx.wait();
            alert("Purchase successful!");
            fetchContent();
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Purchase failed");
        }
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-16 pb-40 pt-10 px-4 sm:px-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12 border-b border-white/10 pb-8 md:pb-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-[0.3em]">
                        VAULT_EXPLORER_V2.1
                    </div>
                    <h2 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] flex flex-col">
                        Discover
                        <span className="text-secondary italic">Knowledge</span>
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-4 w-full md:w-96"
                >
                    <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-widest pl-1">Search_Protocol</p>
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 w-5 h-5 group-focus-within:text-secondary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="INITIALIZE_SEARCH..."
                            className="w-full bg-neutral-900 border border-white/10 py-4 sm:py-6 pl-14 sm:pl-16 pr-6 rounded-sm outline-none focus:border-secondary transition-all font-mono text-sm tracking-tight text-white placeholder:text-neutral-700"
                        />
                    </div>
                </motion.div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-white/5 border border-white/10">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="aspect-square bg-neutral-900 animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-white/10 border border-white/10">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, idx) => (
                            <motion.div
                                layout
                                key={Number(item.id)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative aspect-square bg-neutral-900 overflow-hidden flex flex-col border border-white/5"
                            >
                                {/* Item Image */}
                                <div className="relative flex-grow overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-20 transition-opacity" />
                                    <img
                                        src={item.previewUrl || "/placeholder.jpg"}
                                        alt={item.title}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                                    />

                                    <div className="absolute top-8 right-8 z-20 bg-white text-black px-4 py-2 font-black text-xs uppercase tracking-tighter italic">
                                        {ethers.formatEther(item.price)} POL
                                    </div>

                                    {/* Bento Hover Label */}
                                    <div className="absolute bottom-8 left-8 right-8 z-20 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-2 font-mono">NODE_HASH: {item.id.toString().padStart(6, '0')}</p>
                                    </div>
                                </div>

                                {/* Content Info */}
                                <div className="p-10 space-y-6 relative z-20 bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">{item.title}</h3>
                                        <p className="text-neutral-500 text-xs font-bold uppercase tracking-tighter line-clamp-2 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Provider</span>
                                            <span className="text-[10px] font-mono font-bold text-neutral-400">
                                                {item.creator.slice(0, 6)}...{item.creator.slice(-4)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => buyContent(Number(item.id), item.price)}
                                            className="btn-primary !px-6 !py-3 !text-[10px] flex items-center gap-3"
                                        >
                                            <ShoppingCart className="w-3 h-3" />
                                            BUY_ACCESS
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!loading && filteredItems.length === 0 && (
                <div className="text-center py-60 border border-white/10 bg-neutral-900">
                    <h3 className="text-4xl font-black text-neutral-800 uppercase italic tracking-tighter">Zero_Nodes_Found</h3>
                    <p className="text-neutral-600 font-bold uppercase tracking-widest mt-4 text-[10px]">Initialize upload to populate the vault</p>
                </div>
            )}
        </div>
    );
}
