"use client";
import { useState } from "react";
import { uploadToIPFS, getGatewayUrl } from "@/lib/pinata";
import { ethers } from "ethers";
import { CloudUpload, FileText, Percent, Info, Shield, CheckCircle2, Binary, HardDrive, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const [status, setStatus] = useState<"idle" | "ipfs-preview" | "ipfs-full" | "blockchain" | "success">("idle");

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!file || !preview) return alert("Select both files");
        if (!window.ethereum) return alert("MetaMask required");

        try {
            // 1. IPFS Preview
            setStatus("ipfs-preview");
            const previewHash = await uploadToIPFS(preview);

            // 2. IPFS Full
            setStatus("ipfs-full");
            const contentHash = await uploadToIPFS(file);

            // 3. Blockchain
            setStatus("blockchain");
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            const tx = await contract.registerContent(
                title,
                description,
                getGatewayUrl(previewHash),
                contentHash,
                ethers.parseEther(price),
                BigInt(royalty),
                {
                    maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
                    maxFeePerGas: ethers.parseUnits("35", "gwei"),
                }
            );

            await tx.wait();
            setStatus("success");
            setTimeout(() => setStatus("idle"), 5000);
        } catch (err: any) {
            console.error(err);
            alert("Error: " + (err.message || "Unknown error"));
            setStatus("idle");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-32">
            <div className="flex flex-col lg:flex-row gap-12">

                {/* Information Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-1/3 space-y-8"
                >
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter italic">
                            Node <br /> <span className="text-primary italic">Deployment</span>
                        </h2>
                        <p className="text-gray-500 font-medium">Broadcast your knowledge to the decentralized network. Securely, permanently, forever.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { icon: Shield, title: "Zero-Knowledge Storage", desc: "Full hashes are only revealed to verified licensors." },
                            { icon: HardDrive, title: "IPFS Redundancy", desc: "Distributed across Pinata's global edge network." },
                            { icon: Cpu, title: "Gas Optimized", desc: "Direct contract calls with EIP-1559 priority." }
                        ].map((stat, i) => (
                            <div key={i} className="glass border-white/5 p-4 rounded-2xl flex gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg h-fit">
                                    <stat.icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-tight">{stat.title}</h4>
                                    <p className="text-xs text-gray-500 font-medium">{stat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="glass-card !bg-primary/[0.03] !border-primary/20">
                        <div className="flex items-center gap-3 mb-2">
                            <Info className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Network Notice</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">Ensure you have balanced POL for gas fees. Each deployment generates 2 IPFS nodes and 1 Polygon transaction.</p>
                    </div>
                </motion.div>

                {/* Form Area */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-grow"
                >
                    <form onSubmit={handleSubmit} className="glass-card !p-10 space-y-8 !rounded-[3rem] relative overflow-hidden">
                        <AnimatePresence>
                            {status !== "idle" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-50 glass backdrop-blur-2xl flex flex-col items-center justify-center space-y-6 text-center"
                                >
                                    {status === "success" ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="space-y-4"
                                        >
                                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_#22c55e]">
                                                <CheckCircle2 className="w-10 h-10 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-black uppercase italic">Node Active</h3>
                                            <p className="text-gray-500 font-medium italic">Your resource is now live on the Polygon Amoy Testnet.</p>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-black uppercase italic tracking-widest animate-pulse">
                                                    {status === "ipfs-preview" && "Encrypting Preview..."}
                                                    {status === "ipfs-full" && "Uplink: Primary Data..."}
                                                    {status === "blockchain" && "Syncing with Blockchain..."}
                                                </h3>
                                                <p className="text-gray-500 font-medium text-xs">Awaiting Network Confirmation...</p>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Content Title</label>
                                    <input
                                        type="text"
                                        className="w-full glass bg-white/[0.02] border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                                        placeholder="Quantum Physics Core..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Specifications / Description</label>
                                    <textarea
                                        className="w-full glass bg-white/[0.02] border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold h-32"
                                        placeholder="Enter node payload details..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Price (POL)</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            className="w-full glass bg-white/[0.02] border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                                            placeholder="0.05"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Royalty (%)</label>
                                        <input
                                            type="number"
                                            className="w-full glass bg-white/[0.02] border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                                            placeholder="10"
                                            value={royalty}
                                            onChange={(e) => setRoyalty(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Preview Visual (Image)</label>
                                        <div className="relative group/file">
                                            <input
                                                type="file"
                                                onChange={(e) => setPreview(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                accept="image/*"
                                                required
                                            />
                                            <div className="glass bg-white/[0.02] border-white/10 rounded-2xl p-4 flex items-center justify-between group-hover/file:bg-white/[0.05] transition-colors border-dashed border-2">
                                                <span className="text-xs font-bold text-gray-400">{preview ? preview.name : "Select Preview Image"}</span>
                                                <Binary className="w-5 h-5 text-primary opacity-50" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Full Asset Data (PDF/Video)</label>
                                        <div className="relative group/file">
                                            <input
                                                type="file"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                required
                                            />
                                            <div className="glass bg-white/[0.02] border-white/10 rounded-2xl p-4 flex items-center justify-between group-hover/file:bg-white/[0.05] transition-colors border-dashed border-2">
                                                <span className="text-xs font-bold text-gray-400">{file ? file.name : "Select Asset Payload"}</span>
                                                <CloudUpload className="w-5 h-5 text-primary opacity-50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-primary !py-6 !rounded-3xl text-xl font-black uppercase italic tracking-widest flex items-center justify-center gap-4 group"
                        >
                            <Binary className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                            Initialize Deployment
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
