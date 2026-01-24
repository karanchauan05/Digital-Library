"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Search, ShoppingCart, Lock, Unlock, ArrowUpRight, Filter, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x146cEd605d2BfF0Eee901AE210a24B18BD722d55";
const ABI = [
    "function contentCount() view returns (uint256)",
    "function contents(uint256) view returns (uint256 id, string title, string description, string previewUrl, string contentHash, uint256 price, address creator, uint256 royaltyPercentage, bool isActive)",
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
            for (let i = 1; i <= Number(count); i++) {
                const item = await contract.contents(i);
                if (item.isActive) fetchedItems.push(item);
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

            const tx = await contract.purchaseContent(id, {
                value: price,
                maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
                maxFeePerGas: ethers.parseUnits("35", "gwei"),
            });
            await tx.wait();
            alert("Node Successfully Synchronized!");
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
        <div className="max-w-7xl mx-auto space-y-16 pb-20">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                        <BookOpen className="text-primary w-10 h-10" />
                        Knowledge Base
                    </h2>
                    <p className="text-gray-500 font-medium">Browse and acquire decentralized educational nodes.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 w-full md:w-auto"
                >
                    <div className="relative group flex-grow md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search nodes..."
                            className="w-full glass bg-white/[0.02] border-white/10 py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                        />
                    </div>
                    <button className="p-4 glass rounded-2xl text-gray-400 hover:text-white transition-colors">
                        <Filter className="w-6 h-6" />
                    </button>
                </motion.div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card h-80 animate-pulse bg-white/5" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, idx) => (
                            <motion.div
                                layout
                                key={Number(item.id)}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="glass-card flex flex-col group !p-0 overflow-hidden !rounded-[2.5rem] bg-white/[0.01]"
                            >
                                {/* Item Image */}
                                <div className="relative h-56 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                                    <img
                                        src={item.previewUrl || "/placeholder.jpg"}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 z-20 glass px-4 py-2 rounded-full text-xs font-black text-white border-white/10 backdrop-blur-xl">
                                        {ethers.formatEther(item.price)} POL
                                    </div>
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-md border border-primary/20">
                                            Node #{Number(item.id)}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-grow flex flex-col">
                                    <h3 className="text-2xl font-black mb-3 tracking-tighter uppercase italic">{item.title}</h3>
                                    <p className="text-gray-500 text-sm font-medium line-clamp-3 mb-6 flex-grow leading-relaxed">
                                        {item.description}
                                    </p>

                                    <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] uppercase font-bold text-gray-600 tracking-widest">Architect</span>
                                            <span className="text-[10px] font-mono text-gray-400">
                                                {item.creator.slice(0, 6)}...{item.creator.slice(-4)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => buyContent(Number(item.id), item.price)}
                                            className="btn-primary flex items-center gap-3 px-6 py-3 rounded-2xl group/btn"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            <span className="text-sm">Acquire</span>
                                            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-all" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!loading && filteredItems.length === 0 && (
                <div className="text-center py-40 glass rounded-[3rem]">
                    <div className="p-6 bg-white/5 rounded-full w-fit mx-auto mb-6">
                        <Search className="w-10 h-10 text-gray-700" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-500 italic uppercase">No Node Data Found</h3>
                    <p className="text-gray-600 font-medium italic">Adjust your filters or try a different frequency.</p>
                </div>
            )}
        </div>
    );
}
