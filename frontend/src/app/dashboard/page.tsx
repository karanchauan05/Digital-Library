"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAntiPiracy } from "../../lib/useAntiPiracy";
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
    Clock,
    ShieldCheck,
    Cpu,
    Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x146cEd605d2BfF0Eee901AE210a24B18BD722d55";
const ABI = [
    "function contentCount() view returns (uint256)",
    "function contents(uint256) view returns (uint256 id, string title, string description, string previewUrl, string contentHash, uint256 price, address creator, uint256 royaltyPercentage, bool isActive, bool isDeleted)",
    "function checkAccess(uint256 contentId, address user) view returns (bool)",
    "function toggleContentStatus(uint256 contentId) external",
    "function deleteContent(uint256 contentId) external"
];

const StatCard = ({ label, value, icon: Icon, color, delay, subValue }: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, type: "spring", stiffness: 100 }}
        className="glass-card relative overflow-hidden group p-6 border-slate-100"
    >
        <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.03] blur-3xl group-hover:opacity-10 transition-opacity duration-700`} />
        <div className="flex items-start justify-between">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} bg-opacity-10 backdrop-blur-md border border-slate-200 shadow-lg`}>
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">{label}</p>
                <p className="text-3xl font-black mt-1 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-500">{value}</p>
                {subValue && <p className="text-[10px] text-green-600 font-bold mt-1">{subValue}</p>}
            </div>
        </div>
    </motion.div>
);

export default function DashboardPage() {
    const [myUploads, setMyUploads] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalUploads: 0,
        totalPurchased: 0,
        balance: "0.0000",
        activeCount: 0,
        totalRevenue: "0.00"
    });
    const [loading, setLoading] = useState(true);
    const [userAddress, setUserAddress] = useState("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [latency, setLatency] = useState("0ms");
    const [platformLoad, setPlatformLoad] = useState("0.0%");

    // Enable Anti-Piracy features
    useAntiPiracy(true);

    useEffect(() => { init(); }, []);

    const init = async () => {
        try {
            if (!window.ethereum) return;
            const startTime = Date.now();
            const provider = new ethers.BrowserProvider(window.ethereum);

            // Measure Latency
            await provider.getBlockNumber();
            setLatency(`${Date.now() - startTime}ms`);

            const accounts = await provider.send("eth_requestAccounts", []);
            const address = accounts[0];
            setUserAddress(address);

            const balance = await provider.getBalance(address);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
            const count = await contract.contentCount();

            const uploads = [];
            let purchasedCount = 0;
            let active = 0;
            let revenue = BigInt(0);

            const forbiddenTitles = ["SS", "MANUSH", "VIDEO"];

            for (let i = 1; i <= Number(count); i++) {
                const item = await contract.contents(i);
                if (item.creator.toLowerCase() === address.toLowerCase()) {
                    if (!item.isDeleted) {
                        if (forbiddenTitles.includes(item.title.toUpperCase())) continue;

                        uploads.push({
                            id: Number(item.id),
                            title: item.title,
                            description: item.description,
                            previewUrl: item.previewUrl,
                            price: ethers.formatEther(item.price),
                            isActive: item.isActive,
                            isDeleted: item.isDeleted
                        });
                        if (item.isActive) active++;
                    }
                }

                const hasAccess = await contract.checkAccess(i, address);
                if (hasAccess && item.creator.toLowerCase() !== address.toLowerCase()) {
                    purchasedCount++;
                    revenue += item.price;
                }
                if (item.isActive) active++;
            }

            // Calculate Platform Load (Active Nodes / Total Slots)
            const load = (active / (Number(count) || 1)) * 100;
            setPlatformLoad(`${load.toFixed(1)}%`);

            setMyUploads(uploads.reverse());
            setStats({
                totalUploads: uploads.length,
                totalPurchased: purchasedCount,
                balance: parseFloat(ethers.formatEther(balance)).toFixed(4),
                activeCount: active,
                totalRevenue: ethers.formatEther(revenue)
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

            const feeData = await provider.getFeeData();

            const tx = await contract.toggleContentStatus(id, {
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? ethers.parseUnits("30", "gwei"),
                maxFeePerGas: feeData.maxFeePerGas ?? ethers.parseUnits("35", "gwei"),
            });
            await tx.wait();
            await init();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to permanently delete this content? This action cannot be undone.")) return;

        try {
            setActionLoading(id);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            const feeData = await provider.getFeeData();

            const tx = await contract.deleteContent(id, {
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? ethers.parseUnits("30", "gwei"),
                maxFeePerGas: feeData.maxFeePerGas ?? ethers.parseUnits("35", "gwei"),
            });
            await tx.wait();
            await init();
        } catch (err) {
            console.error(err);
            alert("Failed to delete content. Ensure you are the creator.");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 pb-32 pt-10 px-4 sm:px-8">
            {/* Header Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
                <div className="lg:col-span-2 glass-card !bg-neutral-900 border-white/10 p-8 md:p-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                            <Cpu className="w-3 h-3" /> Core_Interface_Active
                        </div>
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8]">
                            Creator<br />
                            <span className="text-primary italic">Terminal</span>
                        </h1>
                        <p className="text-neutral-500 font-bold text-sm max-w-sm uppercase tracking-tight">
                            Manage decentralized nodes and monitor real-time royalty streams within the protocol.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-1 h-full">
                    <div className="bento-card border-white/10 !bg-primary flex items-center justify-center group cursor-pointer p-6">
                        <div className="text-center group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-8 md:w-12 h-8 md:h-12 text-black mb-2 mx-auto" />
                            <p className="text-[10px] font-black uppercase text-black">Security</p>
                            <p className="text-lg md:text-xl font-black text-black">ENCRYPTED</p>
                        </div>
                    </div>
                    <div className="bento-card border-white/10 !bg-neutral-900 flex items-center justify-center p-6">
                        <div className="text-center">
                            <Zap className="w-8 md:w-12 h-8 md:h-12 text-secondary mb-2 mx-auto" />
                            <p className="text-[10px] font-black uppercase text-neutral-500">Latency</p>
                            <p className="text-lg md:text-xl font-black text-white">{latency}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 border border-white/10 bg-white/5">
                <StatCard
                    label="Active_Nodes"
                    value={stats.activeCount}
                    icon={Package}
                    color="from-orange-500 to-red-500"
                    delay={0.1}
                    subValue="SYNC_STABLE"
                />
                <StatCard
                    label="Stream_Vol"
                    value={`${stats.totalPurchased}`}
                    icon={TrendingUp}
                    color="from-cyan-500 to-blue-500"
                    delay={0.2}
                    subValue="REALTIME_DATA"
                />
                <StatCard
                    label="Platform_Load"
                    value={platformLoad}
                    icon={ShieldCheck}
                    color="from-emerald-500 to-green-500"
                    delay={0.3}
                />
                <StatCard
                    label="Total_Ops"
                    value={stats.totalUploads}
                    icon={LayoutDashboard}
                    color="from-purple-500 to-pink-500"
                    delay={0.4}
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 bg-white/5 border border-white/10">
                {/* Left Listing Column */}
                <div className="lg:col-span-2 p-8 space-y-8 bg-neutral-900">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-neutral-500 flex items-center gap-4">
                            <div className="w-2 h-2 bg-primary animate-pulse" /> Registered_Assets
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-600">Total Count: {myUploads.length}</span>
                    </div>

                    <div className="space-y-1">
                        {loading ? (
                            <div className="py-20 flex justify-center">
                                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : myUploads.length === 0 ? (
                            <div className="py-40 text-center space-y-4">
                                <p className="text-[10px] font-black text-neutral-700 uppercase tracking-widest">Zero_Uploads_Detected</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {myUploads.map((item, idx) => (
                                    <motion.div
                                        layout
                                        key={item.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 group relative border border-white/5 bg-black/40 hover:bg-neutral-800 transition-all ${!item.isActive ? 'opacity-40 grayscale' : ''}`}
                                    >
                                        <div className="w-full sm:w-20 h-40 sm:h-20 rounded-sm overflow-hidden border border-white/10 flex-shrink-0 relative">
                                            <img src={item.previewUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            {!item.isActive && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[8px] font-black text-white uppercase tracking-widest">OFFLINE</div>}
                                        </div>

                                        <div className="flex-grow w-full">
                                            <div className="flex items-center justify-between sm:justify-start gap-4">
                                                <h4 className="text-base md:text-lg font-black tracking-tight group-hover:text-primary transition-colors uppercase truncate">{item.title}</h4>
                                                <div className={`text-[8px] px-2 py-0.5 border font-black ${item.isActive ? 'border-accent/40 text-accent' : 'border-red-500/40 text-red-500'}`}>
                                                    {item.isActive ? 'ACTIVE' : 'LOCKED'}
                                                </div>
                                            </div>
                                            <p className="text-neutral-500 text-xs mt-1 font-bold line-clamp-1 uppercase tracking-tighter">{item.description}</p>

                                            <div className="flex items-center gap-8 mt-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">License</span>
                                                    <span className="text-xs font-mono font-bold text-white">{item.price} POL</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">ID_CHASH</span>
                                                    <span className="text-xs font-mono text-neutral-500">#{item.id.toString().padStart(4, '0')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-1 w-full sm:w-auto mt-4 sm:mt-0">
                                            <button
                                                onClick={() => toggleStatus(item.id)}
                                                className="flex-1 sm:flex-none p-4 bg-white/5 hover:bg-white text-white hover:text-black transition-all flex items-center justify-center"
                                            >
                                                {item.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                disabled={actionLoading === item.id}
                                                className="flex-1 sm:flex-none p-4 bg-white/5 hover:bg-red-500 text-white hover:text-white transition-all disabled:opacity-50 flex items-center justify-center"
                                            >
                                                <Trash2 className={`w-4 h-4 ${actionLoading === item.id ? 'animate-pulse' : ''}`} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Right Sidebar Info */}
                <div className="p-8 space-y-8 bg-neutral-900 border-l border-white/10">
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 mx-auto rounded-sm bg-neutral-800 border border-white/10 p-4 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                            <span className="text-4xl font-black text-primary relative z-10">
                                {userAddress ? userAddress.slice(2, 4).toUpperCase() : "??"}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 italic">User_Identifier</h3>
                            <p className="font-mono text-[10px] text-white break-all bg-black p-3 border border-white/5">{userAddress || "UNCONNECTED"}</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-white/10">
                        <div className="flex justify-between items-center bg-black/40 p-4 border border-white/5">
                            <span className="text-[10px] font-black uppercase text-neutral-500">Accrued_Rev</span>
                            <span className="font-black text-xl text-primary tracking-tighter">{stats.totalRevenue} POL</span>
                        </div>
                        <div className="flex justify-between items-center bg-black/40 p-4 border border-white/5">
                            <span className="text-[10px] font-black uppercase text-neutral-500">Protocol_Status</span>
                            <span className={`text-[10px] font-black tracking-[0.2em] ${userAddress ? 'text-accent' : 'text-red-500'}`}>
                                {userAddress ? 'VERIFIED_SECURE' : 'AUTH_REQUIRED'}
                            </span>
                        </div>
                    </div>

                    <button className="w-full btn-primary !py-6 flex items-center justify-center gap-4 group">
                        <TrendingUp className="w-5 h-5" />
                        ANALYTICS_HUB
                    </button>

                    <div className="p-6 border border-white/5 bg-black/20 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500">System_Logs</h4>
                        </div>
                        <div className="space-y-2 text-[8px] font-bold text-neutral-600 uppercase">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span>SYNC_NODE</span>
                                <span className="text-accent">SUCCESS</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span>AUTH_SIGNER</span>
                                <span className={userAddress ? "text-accent" : "text-red-500"}>
                                    {userAddress ? "RESOLVED" : "PENDING"}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span>CONTRACT_LINK</span>
                                <span className="text-accent">CONNECTED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}
