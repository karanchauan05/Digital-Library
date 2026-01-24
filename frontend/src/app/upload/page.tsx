"use client";
import { useState } from "react";
import { uploadToIPFS, getGatewayUrl } from "@/lib/pinata";
import { ethers } from "ethers";
import { CloudUpload, FileText, Percent, Info, Shield, CheckCircle2, Binary, HardDrive, Cpu, IndianRupee } from "lucide-react";
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
        if (!file || !preview) return alert("Please select both content and preview files");
        if (!window.ethereum) return alert("Please install MetaMask");

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
                    <div className="space-y-4 text-center lg:text-left">
                        <h2 className="text-4xl font-black tracking-tighter">
                            Upload <br /> <span className="text-primary">Content</span>
                        </h2>
                        <p className="text-gray-500 font-medium tracking-tight">Protect your educational IP with blockchain encryption and earn automated royalties.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { icon: Shield, title: "Anti-Piracy", desc: "Files accessible only via authenticated Smart Contract ownership." },
                            { icon: Binary, title: "Millisecond Chunking", desc: "Videos are rendered in encrypted chunks to prevent screen recording and ripping." },
                            { icon: HardDrive, title: "Decentralized Hosting", desc: "Permanently stored on IPFS node network." },
                            { icon: IndianRupee, title: "Automated Royalties", desc: "Direct peer-to-peer payments on the blockchain." }
                        ].map((stat, i) => (
                            <div key={i} className="glass border-slate-200 p-4 rounded-xl flex gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg h-fit">
                                    <stat.icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold tracking-tight">{stat.title}</h4>
                                    <p className="text-xs text-gray-500 font-medium">{stat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Form Area */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-grow"
                >
                    <form onSubmit={handleSubmit} className="glass-card !p-10 space-y-8 !rounded-xl relative overflow-hidden">
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
                                            <h3 className="text-2xl font-black uppercase">Upload Successful!</h3>
                                            <p className="text-gray-500 font-medium">Your content is now live on the Polygon Amoy Testnet.</p>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold tracking-widest animate-pulse">
                                                    {status === "ipfs-preview" && "Uploading Preview..."}
                                                    {status === "ipfs-full" && "Uploading Full Content..."}
                                                    {status === "blockchain" && "Registering on Blockchain..."}
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
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Content Title</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-4 px-6 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all font-bold"
                                        placeholder="Enter Title..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Description</label>
                                    <textarea
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-4 px-6 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all font-bold h-32"
                                        placeholder="Describe your content..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Price (POL)</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-4 px-6 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all font-bold"
                                            placeholder="0.05"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Royalty (%)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-4 px-6 outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all font-bold"
                                            placeholder="10"
                                            value={royalty}
                                            onChange={(e) => setRoyalty(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Preview Image</label>
                                        <div className="relative group/file">
                                            <input
                                                type="file"
                                                onChange={(e) => setPreview(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                accept="image/*"
                                                required
                                            />
                                            <div className="bg-slate-50 border-slate-200 rounded-lg p-4 flex items-center justify-between group-hover/file:bg-slate-100 transition-colors border-dashed border-2">
                                                <span className="text-xs font-bold text-gray-400">{preview ? preview.name : "Select Preview"}</span>
                                                <FileText className="w-5 h-5 text-primary opacity-50" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Full Asset (PDF/Video)</label>
                                        <div className="relative group/file">
                                            <input
                                                type="file"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                required
                                            />
                                            <div className="bg-slate-50 border-slate-200 rounded-lg p-4 flex items-center justify-between group-hover/file:bg-slate-100 transition-colors border-dashed border-2">
                                                <span className="text-xs font-bold text-gray-400">{file ? file.name : "Select Data"}</span>
                                                <CloudUpload className="w-5 h-5 text-primary opacity-50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-primary !py-6 !rounded-lg text-xl font-bold uppercase tracking-widest"
                        >
                            Publish Content
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
