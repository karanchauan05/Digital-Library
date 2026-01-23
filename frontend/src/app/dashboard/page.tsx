"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { LayoutDashboard, Package, TrendingUp, Eye, EyeOff, IndianRupee, Wallet } from "lucide-react";
import { getGatewayUrl } from "@/lib/pinata";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x146cEd605d2BfF0Eee901AE210a24B18BD722d55";
const ABI = [
    "function contentCount() view returns (uint256)",
    "function contents(uint256) view returns (uint256 id, string title, string description, string previewUrl, string contentHash, uint256 price, address creator, uint256 royaltyPercentage, bool isActive)",
    "function checkAccess(uint256 contentId, address user) view returns (bool)",
    "function toggleContentStatus(uint256 contentId) external",
    "function owner() view returns (address)"
];

export default function DashboardPage() {
    const [myUploads, setMyUploads] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalUploads: 0,
        totalPurchased: 0,
        balance: "0"
    });
    const [loading, setLoading] = useState(true);
    const [userAddress, setUserAddress] = useState("");

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        try {
            if (!window.ethereum) return;
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const address = accounts[0];
            setUserAddress(address);

            const balance = await provider.getBalance(address);
            setStats(prev => ({ ...prev, balance: ethers.formatEther(balance) }));

            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
            const count = await contract.contentCount();

            const uploads = [];
            let purchasedCount = 0;

            for (let i = 1; i <= Number(count); i++) {
                const item = await contract.contents(i);
                if (item.creator.toLowerCase() === address.toLowerCase()) {
                    uploads.push(item);
                }
                const hasAccess = await contract.checkAccess(i, address);
                // Creator has access by default, but shouldn't count as a "purchase" for dashboard purposes
                if (hasAccess && item.creator.toLowerCase() !== address.toLowerCase()) {
                    purchasedCount++;
                }
            }

            setMyUploads(uploads);
            setStats(prev => ({ ...prev, totalUploads: uploads.length, totalPurchased: purchasedCount }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: number) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            const tx = await contract.toggleContentStatus(id, {
                maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
                maxFeePerGas: ethers.parseUnits("35", "gwei"),
            });
            await tx.wait();
            init(); // Refresh data
        } catch (err) {
            console.error(err);
            alert("Failed to toggle status");
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <LayoutDashboard className="text-primary" />
                    Creator Dashboard
                </h2>
                <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                    <Wallet className="w-4 h-4 text-primary" />
                    <span>{stats.balance.slice(0, 6)} POL</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "My Uploads", value: stats.totalUploads, icon: Package, color: "text-blue-500" },
                    { label: "Assets Purchased", value: stats.totalPurchased, icon: TrendingUp, color: "text-green-500" },
                    { label: "Total Creations", value: myUploads.length, icon: LayoutDashboard, color: "text-purple-500" }
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 flex items-center gap-4">
                        <div className={`p-4 rounded-2xl bg-white/5 ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* My Content Area */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold">Manage My Content</h3>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {myUploads.map((item) => (
                            <div key={item.id} className="glass-card flex items-center justify-between p-4 group hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={item.previewUrl} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{item.title}</h4>
                                        <p className="text-gray-400 text-xs">Price: {ethers.formatEther(item.price)} POL</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs px-3 py-1 rounded-full ${item.isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                                        {item.isActive ? "Active" : "Hidden"}
                                    </span>
                                    <button
                                        onClick={() => toggleStatus(Number(item.id))}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        title={item.isActive ? "Hide Content" : "Show Content"}
                                    >
                                        {item.isActive ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-primary" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {myUploads.length === 0 && (
                            <div className="text-center py-20 glass rounded-3xl">
                                <p className="text-gray-500">You haven't uploaded any content yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
