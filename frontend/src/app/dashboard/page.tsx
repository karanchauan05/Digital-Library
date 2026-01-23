"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
    LayoutDashboard,
    Package,
    TrendingUp,
    Eye,
    EyeOff,
    Trash2,
    ArrowUpRight,
    Wallet,
    AlertCircle,
    CheckCircle2,
    Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x146cEd605d2BfF0Eee901AE210a24B18BD722d55";
const ABI = [
    "function contentCount() view returns (uint256)",
    "function contents(uint256) view returns (uint256 id, string title, string description, string previewUrl, string contentHash, uint256 price, address creator, uint256 royaltyPercentage, bool isActive)",
    "function checkAccess(uint256 contentId, address user) view returns (bool)",
    "function toggleContentStatus(uint256 contentId) external"
];

const StatCard = ({ label, value, icon: Icon, color, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="glass-card relative overflow-hidden group p-6"
    >
        <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-white/5 ${color.split(' ')[0]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-gray-400 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
    </motion.div>
);

export default function DashboardPage() {
    const [myUploads, setMyUploads] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalUploads: 0,
        totalPurchased: 0,
        balance: "0",
        activeCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [userAddress, setUserAddress] = useState("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => { init(); }, []);

    const init = async () => {
        try {
            if (!window.ethereum) return;
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const address = accounts[0];
            setUserAddress(address);

            const balance = await provider.getBalance(address);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
            const count = await contract.contentCount();

            const uploads = [];
            let purchasedCount = 0;
            let active = 0;

            for (let i = 1; i <= Number(count); i++) {
                const item = await contract.contents(i);
                if (item.creator.toLowerCase() === address.toLowerCase()) {
                    uploads.push({
                        ...item,
                        id: Number(item.id),
                        price: ethers.formatEther(item.price)
                    });
                    if (item.isActive) active++;
                }
                const hasAccess = await contract.checkAccess(i, address);
                if (hasAccess && item.creator.toLowerCase() !== address.toLowerCase()) {
                    purchasedCount++;
                }
            }

            setMyUploads(uploads.reverse()); // Latest first
            setStats({
                totalUploads: uploads.length,
                totalPurchased: purchasedCount,
                balance: parseFloat(ethers.formatEther(balance)).toFixed(4),
                activeCount: active
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: number) => {
        try {
            setActionLoading(id);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            const tx = await contract.toggleContentStatus(id, {
                maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
                maxFeePerGas: ethers.parseUnits("35", "gwei"),
            });
            await tx.wait();
            await init();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary pb-2">
                        System Overview
                    </h1>
                    <p className="text-gray-400 mt-1 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Wallet Active: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass px-6 py-4 rounded-3xl flex items-center gap-6 border border-white/10"
                >
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Network Balance</span>
                        <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-primary" />
                            <span className="text-xl font-mono font-bold">{stats.balance} POL</span>
                        </div>
                    </div>
                    <div className="w-[1px] h-10 bg-white/10" />
                    <button onClick={init} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <Clock className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </motion.div>
            </div>

            {/* Stats Visualization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Active Assets"
                    value={stats.activeCount}
                    icon={Package}
                    color="from-blue-500 to-cyan-500 text-blue-400"
                    delay={0.1}
                />
                <StatCard
                    label="Volume Generated"
                    value={`${stats.totalPurchased} Sales`}
                    icon={TrendingUp}
                    color="from-green-500 to-emerald-500 text-green-400"
                    delay={0.2}
                />
                <StatCard
                    label="Account Health"
                    value="100%"
                    icon={CheckCircle2}
                    color="from-purple-500 to-pink-500 text-purple-400"
                    delay={0.3}
                />
                <StatCard
                    label="Total Inventory"
                    value={stats.totalUploads}
                    icon={LayoutDashboard}
                    color="from-orange-500 to-yellow-500 text-orange-400"
                    delay={0.4}
                />
            </div>

            {/* Management Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        Inventory Management
                    </h2>
                    <div className="flex gap-2">
                        <span className="glass px-3 py-1 rounded-full text-[10px] uppercase font-bold text-gray-400">Sort: Newest</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-gray-500 font-medium animate-pulse">Syncing with Polygon Amoy...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence mode="popLayout">
                            {myUploads.map((item, idx) => (
                                <motion.div
                                    layout
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-primary/30 transition-all ${!item.isActive ? 'opacity-60 saturate-50' : ''}`}
                                >
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden glass border border-white/5 flex-shrink-0">
                                            <img src={item.previewUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                            {!item.isActive && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <EyeOff className="w-6 h-6 text-white/50" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{item.title}</h4>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase ${item.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {item.isActive ? 'Live' : 'Archived'}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 text-sm line-clamp-1 max-w-md">{item.description}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-lg">
                                                    {item.price} POL
                                                </span>
                                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">
                                                    ID: #{item.id.toString().padStart(4, '0')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <button
                                            disabled={actionLoading === item.id}
                                            onClick={() => toggleStatus(item.id)}
                                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${item.isActive
                                                ? 'bg-white/5 text-gray-300 hover:bg-orange-500/10 hover:text-orange-500'
                                                : 'bg-primary/20 text-primary hover:bg-primary/30'
                                                } disabled:opacity-50`}
                                        >
                                            {actionLoading === item.id ? (
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : item.isActive ? (
                                                <><EyeOff className="w-4 h-4" /> Archive</>
                                            ) : (
                                                <><Eye className="w-4 h-4" /> Restore</>
                                            )}
                                        </button>

                                        <button
                                            disabled={actionLoading === item.id}
                                            onClick={() => toggleStatus(item.id)} // In logic, archiving is the closest we have to deleting safely
                                            className="p-3 bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
                                            title="Permanently Archive"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {myUploads.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-32 glass rounded-[2.5rem] border-dashed border-2 border-white/5"
                            >
                                <div className="p-4 bg-white/5 rounded-full w-fit mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-gray-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-400">No Assets Detected</h3>
                                <p className="text-gray-600 mt-2 max-w-xs mx-auto">Start by uploading your first educational resource to build your library.</p>
                                <button className="btn-primary mt-6 px-8">Initialize First Upload</button>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
