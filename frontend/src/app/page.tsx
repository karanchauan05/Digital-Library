"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Coins, Binary, Globe, Lock, Sparkles } from "lucide-react";

const FloatingNode = ({ delay, x, y }: { delay: number; x: string; y: string }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
            opacity: [0.1, 0.3, 0.1],
            y: ["0%", "-10%", "0%"],
            scale: [1, 1.1, 1]
        }}
        transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay
        }}
        className="absolute w-24 h-24 bg-primary/10 rounded-full blur-3xl -z-10"
        style={{ left: x, top: y }}
    />
);

export default function Home() {
    return (
        <div className="relative isolate flex flex-col items-center space-y-32 overflow-hidden">
            {/* Background elements */}
            <FloatingNode delay={0} x="10%" y="20%" />
            <FloatingNode delay={2} x="80%" y="40%" />
            <FloatingNode delay={4} x="40%" y="70%" />

            {/* Hero Section */}
            <section className="relative w-full max-w-5xl px-4 pt-20 pb-10 text-center space-y-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border-white/10 text-xs font-black uppercase tracking-widest text-primary mb-4">
                        <Sparkles className="w-3 h-3" /> Powered by Polygon Amoy
                    </div>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.9] uppercase italic">
                        The Future of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-glow bg-[length:200%_auto] bg-animate-gradient drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            Smart Knowledge
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-gray-500 text-lg md:text-xl font-medium">
                        A decentralized vault for high-value educational content.
                        Protect your intellectual property with smart contract encryption and zero-middleman royalties.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link href="/library" className="btn-primary group flex items-center justify-center gap-3 px-10 py-5 rounded-2xl">
                        <span className="text-lg">Access Library</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/upload" className="btn-secondary flex items-center justify-center gap-3 px-10 py-5 rounded-2xl hover:border-primary/50 transition-colors">
                        <span className="text-lg font-bold">Deploy Node</span>
                        <Binary className="w-5 h-5 opacity-50" />
                    </Link>
                </motion.div>

                {/* Stat badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex flex-wrap items-center justify-center gap-8 pt-10"
                >
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-white">0%</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-600">Platform Fees</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/5" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-white">∞</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-600">IPFS Persistence</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/5" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-white">SECURE</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-600">Encrypted Nodes</span>
                    </div>
                </motion.div>
            </section>

            {/* Visual Break */}
            <div className="w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Core Protocols Section */}
            <section className="w-full max-w-7xl px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {
                        title: "Anti-Piracy Protocal",
                        desc: "Your full content is never exposed on the clear web. It stays locked in an encrypted IPFS node until a smart contract verify transaction is signed.",
                        icon: Lock,
                        color: "from-blue-600 to-indigo-500"
                    },
                    {
                        title: "Atomic Royalties",
                        desc: "Remove the bankers. Every single POL spent by a student is instantly routed to your personal wallet address by the Polygon blockchain network.",
                        icon: Coins,
                        color: "from-purple-600 to-pink-500"
                    },
                    {
                        title: "Decentralized Hosting",
                        desc: "Hosted on IPFS via Pinata gateways. Your educational legacy is distributed across thousands of nodes worldwide, immune to central server failure.",
                        icon: Globe,
                        color: "from-emerald-600 to-teal-500"
                    }
                ].map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.2 }}
                        whileHover={{ y: -5 }}
                        className="glass-card group relative p-8 !p-10 !rounded-[2.5rem]"
                    >
                        <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity`} />
                        <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-black/20 group-hover:scale-110 transition-transform`}>
                            <feature.icon className="text-white w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black mb-4 uppercase italic tracking-tighter">{feature.title}</h3>
                        <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
                    </motion.div>
                ))}
            </section>

            {/* Call to action */}
            <section className="w-full max-w-5xl px-4 py-20 pb-40">
                <div className="glass shadow-2xl rounded-[3rem] p-12 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                    <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-6">Ready to publish your first node?</h2>
                    <p className="text-gray-500 max-w-xl mx-auto mb-10 font-medium">Join the next generation of educators securing their knowledge on the blockchain.</p>
                    <Link href="/upload" className="btn-primary px-12 py-5 rounded-2xl inline-block text-lg">
                        Go to Upload Terminal
                    </Link>
                </div>
            </section>
        </div>
    );
}
