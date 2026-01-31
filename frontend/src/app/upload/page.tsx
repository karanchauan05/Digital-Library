"use client";
import { useState } from "react";
import { uploadToIPFS, getGatewayUrl } from "../../lib/pinata";
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

            // Fetch dynamic gas data to avoid "Failed to fetch" on congested networks
            const feeData = await provider.getFeeData();

            const tx = await contract.registerContent(
                title,
                description,
                getGatewayUrl(previewHash),
                contentHash,
                ethers.parseEther(price),
                BigInt(royalty),
                {
                    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? ethers.parseUnits("30", "gwei"),
                    maxFeePerGas: feeData.maxFeePerGas ?? ethers.parseUnits("35", "gwei"),
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
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-40 pt-10 px-4 sm:px-8">
            {/* Deployment Header */}
            <div className="space-y-4 border-b border-white/10 pb-8 md:pb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.3em]">
                    NODE_VIVIFICATION_PROCEDURE
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8]">
                    Deploy<br />
                    <span className="text-accent italic">Module</span>
                </h1>
                <p className="text-neutral-500 font-bold text-sm max-w-sm uppercase tracking-tight">
                    Register encrypted educational data on the decentralized ledger.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 bg-white/5 border border-white/10 p-1 relative overflow-hidden">
                <AnimatePresence>
                    {status !== "idle" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center space-y-8 text-center p-6 md:p-10"
                        >
                            {status === "success" ? (
                                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-6">
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-accent rounded-sm flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                                        <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-black" />
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Protocol_Link_Success</h3>
                                    <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Asset registered on Polygon Protocol</p>
                                    <button onClick={() => setStatus("idle")} className="btn-secondary !py-4 !px-10">ACKNOWLEDGE</button>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-accent border-t-transparent rounded-sm animate-spin" />
                                    <div className="space-y-2">
                                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter animate-pulse text-accent">
                                            {status === "ipfs-preview" && "Streaming_Preview_Metadata..."}
                                            {status === "ipfs-full" && "Uploading_Core_Payload..."}
                                            {status === "blockchain" && "Linking_Neural_Contract..."}
                                        </h3>
                                        <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-[0.3em]">Network_Confirmation_Pending</p>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="lg:col-span-2 bg-neutral-900 p-6 md:p-10 space-y-12">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1 italic">Module_Identity</label>
                                <input
                                    type="text"
                                    placeholder="..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-black border border-white/10 p-5 md:p-6 font-mono text-sm outline-none focus:border-accent transition-all text-white uppercase tracking-tight"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1 italic">Description_Payload</label>
                                <textarea
                                    placeholder="..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-black border border-white/10 p-5 md:p-6 font-mono text-sm outline-none focus:border-accent transition-all text-white h-40 uppercase tracking-tight leading-relaxed"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 bg-white/5 border border-white/10">
                                <div className="bg-black p-6 space-y-2">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1 italic">Access_Cost (POL)</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700" />
                                        <input
                                            type="number"
                                            step="0.001"
                                            placeholder="0.00"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full bg-transparent p-4 pl-10 font-mono text-lg font-black outline-none text-white tracking-tighter"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="bg-black p-6 space-y-2">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1 italic">Royalty_Dist (%)</label>
                                    <div className="relative">
                                        <Percent className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700" />
                                        <input
                                            type="number"
                                            placeholder="10"
                                            value={royalty}
                                            onChange={(e) => setRoyalty(e.target.value)}
                                            className="w-full bg-transparent p-4 pl-10 font-mono text-lg font-black outline-none text-white tracking-tighter"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Resource Binding */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-white/5 border border-white/10">
                                <div className="bg-black p-8 sm:p-10 flex flex-col items-center text-center space-y-6 group">
                                    <div className="w-16 h-16 rounded-sm bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-700 group-hover:text-accent group-hover:border-accent/40 transition-all">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Preview_Metadata</p>
                                        <p className="text-[8px] font-mono text-neutral-700 uppercase truncate max-w-[150px]">{preview ? preview.name : "NO_RESOURCE_BOUND"}</p>
                                    </div>
                                    <label className="btn-secondary !py-3 !px-6 !text-[10px] cursor-pointer">
                                        BIND_IMAGE
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setPreview(e.target.files?.[0] || null)} required />
                                    </label>
                                </div>

                                <div className="bg-black p-8 sm:p-10 flex flex-col items-center text-center space-y-6 group">
                                    <div className="w-16 h-16 rounded-sm bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-700 group-hover:text-accent group-hover:border-accent/40 transition-all">
                                        <CloudUpload className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Core_Payload</p>
                                        <p className="text-[8px] font-mono text-neutral-700 uppercase truncate max-w-[150px]">{file ? file.name : "NO_RESOURCE_BOUND"}</p>
                                    </div>
                                    <label className="btn-secondary !py-3 !px-6 !text-[10px] cursor-pointer">
                                        BIND_DATA
                                        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full !py-8 md:!py-10 flex items-center justify-center gap-4 md:gap-6 group !bg-accent hover:!bg-white"
                        >
                            <Cpu className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-180 transition-transform duration-1000" />
                            <span className="text-lg md:text-xl">INITIALIZE_VIVIFICATION</span>
                        </button>
                    </form>
                </div>

                {/* Status Sidebar */}
                <div className="bg-neutral-900 border-l border-white/10 p-6 md:p-10 space-y-12">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600">Verification_Nodes</h4>
                            <div className="space-y-3">
                                {[
                                    { label: "Ownership_Check", id: "01" },
                                    { label: "IPFS_Handshake", id: "02" },
                                    { label: "Contract_Sync", id: "03" }
                                ].map(v => (
                                    <div key={v.id} className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <span className="text-[9px] font-bold text-neutral-500 uppercase italic">{v.label}</span>
                                        <CheckCircle2 className="w-3 h-3 text-accent transition-all animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 bg-black border border-white/5 space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-700">Protocol_Fee</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter">GAS</span>
                                <span className="text-xs font-black text-neutral-600 mb-1 tracking-widest">ONLY</span>
                            </div>
                        </div>

                        <div className="p-8 border border-white/10 bg-white/5 space-y-4">
                            <div className="flex items-center gap-3 text-neutral-400">
                                <Info className="w-4 h-4" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Deployment_Info</h4>
                            </div>
                            <p className="text-[9px] text-neutral-500 font-bold leading-relaxed uppercase tracking-widest">
                                Assets are hashed via IPFS CIDv1. Verification is handled by the decentralized validator subset.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
