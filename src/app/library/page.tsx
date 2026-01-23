"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Search, ShoppingCart, Lock, Unlock } from "lucide-react";

const CONTRACT_ADDRESS = "0x..."; // Same as above
const ABI = [
    "function contentCount() view returns (uint256)",
    "function contents(uint256) view returns (uint256 id, string title, string description, string previewUrl, string contentHash, uint256 price, address creator, uint256 royaltyPercentage, bool isActive)",
    "function checkAccess(uint256 contentId, address user) view returns (bool)",
    "function purchaseContent(uint256 contentId) payable"
];

export default function LibraryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userAddress, setUserAddress] = useState("");

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        // In a real app, use a public RPC or the user's provider
        try {
            const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
            const count = await contract.contentCount();

            const fetchedItems = [];
            for (let i = 1; i <= Number(count); i++) {
                const item = await contract.contents(i);
                if (item.isActive) fetchedItems.push(item);
            }
            setItems(fetchedItems);
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

            const tx = await contract.purchaseContent(id, { value: price });
            await tx.wait();
            alert("Purchase successful!");
            fetchContent();
        } catch (err) {
            console.error(err);
            alert("Purchase failed");
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold">Discover Content</h2>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search for books, courses, videos..."
                        className="w-full glass py-3 pl-12 pr-4 rounded-full outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item) => (
                        <div key={item.id} className="glass-card flex flex-col group">
                            <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                                <img
                                    src={item.previewUrl || "/placeholder.jpg"}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-2 right-2 glass px-3 py-1 rounded-full text-xs font-bold text-primary">
                                    {ethers.formatEther(item.price)} POL
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">
                                {item.description}
                            </p>

                            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                    By {item.creator.slice(0, 6)}...{item.creator.slice(-4)}
                                </div>
                                <button
                                    onClick={() => buyContent(Number(item.id), item.price)}
                                    className="btn-primary text-xs px-4 py-2 flex items-center gap-2"
                                >
                                    <ShoppingCart className="w-3 h-3" />
                                    Buy Access
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {items.length === 0 && !loading && (
                <div className="text-center py-20 text-gray-500">
                    No content found. Be the first to upload!
                </div>
            )}
        </div>
    );
}
