"use client";
import { useState } from "react";
import { uploadToIPFS, getGatewayUrl } from "@/lib/pinata";
import { ethers } from "ethers";
import { CloudUpload, FileText, Percent } from "lucide-react";

// Add contract address and ABI here
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x146cEd605d2BfF0Eee901AE210a24B18BD722d55";
const ABI = [
    "function registerContent(string _title, string _description, string _previewUrl, string _contentHash, uint256 _price, uint256 _royaltyPercentage) external"
];

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [royalty, setRoyalty] = useState("10");
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!file || !preview) return alert("Please select both content and preview files");
        if (!window.ethereum) return alert("Please install MetaMask");

        try {
            setUploading(true);

            // 1. Upload to IPFS
            console.log("Uploading preview...");
            const previewHash = await uploadToIPFS(preview);
            console.log("Uploading content...");
            const contentHash = await uploadToIPFS(file);

            // 2. Blockchain Transaction
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();

            if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x...") {
                throw new Error("Contract address is not configured. Please add NEXT_PUBLIC_CONTRACT_ADDRESS to your deployment.");
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            const tx = await contract.registerContent(
                title,
                description,
                getGatewayUrl(previewHash),
                contentHash,
                ethers.parseEther(price),
                BigInt(royalty)
            );

            await tx.wait();
            alert("Content registered successfully!");
        } catch (err: any) {
            console.error(err);
            alert("Failed to upload/register content: " + (err.message || "Unknown error"));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <CloudUpload className="text-primary" />
                Upload Content
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 glass-card">
                <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Modern Web Development..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                        className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none h-32"
                        placeholder="Tell us about your content..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Price (POL/MATIC)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 font-bold text-gray-400">P</span>
                            <input
                                type="number"
                                step="0.001"
                                className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="0.05"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Royalty (%)</label>
                        <div className="relative">
                            <Percent className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="10"
                                value={royalty}
                                onChange={(e) => setRoyalty(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Preview Image</label>
                        <input
                            type="file"
                            onChange={(e) => setPreview(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                            accept="image/*"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Full Content (PDF/Video)</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={uploading}
                    className="w-full btn-primary py-4 disabled:opacity-50"
                >
                    {uploading ? "Uploading to IPFS & Blockchain..." : "Publish Content"}
                </button>
            </form>
        </div>
    );
}
