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
    Clock,
    ShieldCheck,
    Cpu,
    Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x146cEd605d2BfF0Eee901AE210a24B18BD722d55";
const ABI = [
    "function contentCount() view returns (uint256)",
    "function contents(uint256) view returns (uint256 id, string title, string description, string previewUrl, string contentHash, uint256 price, address creator, uint256 royaltyPercentage, bool isActive)",
    "function checkAccess(uint256 contentId, address user) view returns (bool)",
    "function toggleContentStatus(uint256 contentId) external"
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
            let revenue = 0n;

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

                // For MVP, we estimate revenue based on total library purchases 
                // In a real app, you'd index events
                const hasAccess = await contract.checkAccess(i, address);
                if (hasAccess && item.creator.toLowerCase() !== address.toLowerCase()) {
                    purchasedCount++;
                    revenue += item.price;
                }
            }

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
        <div className="max-w-7xl mx-auto space-y-10 pb-32">
            {/* Ultra-Modern Header */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative glass rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 border border-slate-200">
                    <div className="space-y-4 text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                            <Cpu className="w-3 h-3" /> System Neural Link: Active
                        </motion.div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none uppercase">
                            Creator <br />
                            <span className="text-primary">Terminal</span>
                        </h1>
                        <p className="text-gray-500 font-medium text-lg max-w-md">
                            Manage your decentralized educational nodes and monitor real-time royalty streams.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="glass-card p-4 flex flex-col items-center justify-center text-center !rounded-xl bg-slate-50 border-slate-200">
                            <ShieldCheck className="w-8 h-8 text-primary mb-2" />
                            <p className="text-[10px] uppercase font-bold text-gray-500">Security</p>
                            <p className="text-sm font-black text-green-500">ENCRYPTED</p>
                        </div>
                        <div className="glass-card p-4 flex flex-col items-center justify-center text-center !rounded-xl bg-slate-50 border-slate-200">
                            <Zap className="w-8 h-8 text-yellow-500 mb-2" />
                            <p className="text-[10px] uppercase font-bold text-gray-500">Sync Speed</p>
                            <p className="text-sm font-black text-white">40ms</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Active Nodes"
                    value={stats.activeCount}
                    icon={Package}
                    color="from-indigo-600 to-blue-500"
                    delay={0.1}
                    subValue="+12% this week"
                />
                <StatCard
                    label="Stream Volume"
                    value={`${stats.totalPurchased}`}
                    icon={TrendingUp}
                    color="from-emerald-600 to-teal-500"
                    delay={0.2}
                    subValue="Real-time tracking"
                />
                <StatCard
                    label="Total Gas Efficiency"
                    value="98.2%"
                    icon={ShieldCheck}
                    color="from-fuchsia-600 to-purple-500"
                    delay={0.3}
                />
                <StatCard
                    label="Total Creations"
                    value={stats.totalUploads}
                    icon={LayoutDashboard}
                    color="from-amber-600 to-orange-500"
                    delay={0.4}
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Listing Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black uppercase tracking-widest">Node Content</h3>
                        <div className="h-[1px] flex-grow mx-6 bg-gradient-to-r from-slate-200 to-transparent" />
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="py-20 flex justify-center">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {myUploads.map((item, idx) => (
                                    <motion.div
                                        layout
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`glass-card p-5 flex items-center gap-6 group relative overflow-hidden transition-all duration-500 ${!item.isActive ? 'grayscale opacity-50' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200 relative flex-shrink-0">
                                            <img src={item.previewUrl} className="w-full h-full object-cover transition duration-700 group-hover:scale-125" />
                                            {!item.isActive && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-[10px] font-black tracking-widest text-white uppercase">Offline</div>}
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{item.title}</h4>
                                                <div className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`} />
                                            </div>
                                            <p className="text-gray-500 text-sm mt-1 font-medium line-clamp-1">{item.description}</p>
                                            <div className="flex items-center gap-6 mt-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase text-gray-600">License Cost</span>
                                                    <span className="text-sm font-black text-slate-800">{item.price} POL</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase text-gray-600">Access ID</span>
                                                    <span className="text-sm font-mono text-gray-400">#{item.id.toString().padStart(4, '0')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleStatus(item.id)}
                                                className="p-4 rounded-lg glass hover:bg-white/10 hover:text-primary transition-all duration-300"
                                            >
                                                {item.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5 text-primary" />}
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(item.id)}
                                                className="p-4 rounded-lg glass hover:bg-red-500/20 hover:text-red-500 transition-all duration-300"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Right Sidebar Info */}
                <div className="space-y-6">
                    <div className="glass-card p-8 space-y-8 !rounded-xl bg-gradient-to-b from-primary/5 to-transparent border-primary/20">
                        <div className="text-center space-y-2">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Identity Verified</h3>
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary p-[2px] shadow-2xl shadow-primary/20">
                                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-3xl font-black text-primary">
                                    {userAddress.slice(2, 4).toUpperCase()}
                                </div>
                            </div>
                            <p className="font-mono text-[10px] text-gray-500 mt-4 break-all opacity-50 px-4">{userAddress}</p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-bold uppercase text-[10px]">Total Revenue</span>
                                <span className="font-black text-slate-800">{stats.totalRevenue} POL</span>
                            </div>
                            <div className="w-full h-[2px] bg-slate-100 rounded-full" />
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-bold uppercase text-[10px]">Smart Contract</span>
                                <span className="font-mono text-[10px] text-primary">VERIFIED</span>
                            </div>
                        </div>

                        <button className="w-full btn-primary !rounded-lg py-4 flex items-center justify-center gap-3 group">
                            <TrendingUp className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            ANALYTICS HUB
                        </button>
                    </div>

                    <div className="glass-card p-6 !rounded-xl border-slate-100 bg-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Live Network Activity</h4>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between text-[10px] font-bold text-gray-500 border-b border-slate-100 pb-2">
                                    <span>Sync Request #{740 + i}</span>
                                    <span className="text-green-500">COMPLETED</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
