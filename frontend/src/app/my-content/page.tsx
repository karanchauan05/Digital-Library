"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Unlock, FileText, ExternalLink } from "lucide-react";
import { getGatewayUrl } from "@/lib/pinata";

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
            if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x...") {
                throw new Error("Contract address is not configured.");
            }
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
        <div className="space-y-8">
            <h2 className="text-3xl font-bold flex items-center gap-3">
                <Unlock className="text-green-500" />
                My Unlocked Assets
            </h2>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {purchasedItems.map((item) => (
                        <div key={item.id} className="glass-card flex gap-4">
                            <img
                                src={item.previewUrl}
                                className="w-24 h-24 rounded-lg object-cover"
                                alt=""
                            />
                            <div className="flex flex-col justify-between py-1 flex-grow">
                                <div>
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                    <p className="text-gray-400 text-xs mt-1">Status: Fully Unlocked</p>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={getGatewayUrl(item.fullHash)}
                                        target="_blank"
                                        className="flex items-center gap-2 text-primary hover:text-white transition-colors text-sm font-semibold"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open Content
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {purchasedItems.length === 0 && !loading && (
                <div className="text-center py-20 glass rounded-3xl border-dashed border-2 border-white/10">
                    <p className="text-gray-500">You haven't purchased any content yet.</p>
                    <a href="/library" className="text-primary hover:underline mt-2 inline-block">Visit Library</a>
                </div>
            )}
        </div>
    );
}
