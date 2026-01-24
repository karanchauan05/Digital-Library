"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Coins, Globe, Lock, Sparkles } from "lucide-react";

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
                    <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border-white/10 text-xs font-semibold text-primary mb-4">
                        <Sparkles className="w-3 h-3" /> Powered by Polygon Amoy
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9]">
                        EDUCATE & <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-glow bg-[length:200%_auto] bg-animate-gradient drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            EARN SECURELY
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium">
                        The first blockchain-powered educational library on Polygon.
                        Protect your IP, earn royalties, and share knowledge with the world.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link href="/library" className="btn-primary group flex items-center justify-center gap-3 px-10 py-5 rounded-2xl">
                        <span className="text-lg">Explore Library</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/upload" className="btn-secondary flex items-center justify-center gap-3 px-10 py-5 rounded-2xl">
                        <span className="text-lg font-bold">Start Uploading</span>
                    </Link>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="w-full max-w-7xl px-4 grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">
                {[
                    {
                        title: "Anti-Piracy",
                        desc: "Content hashes are encrypted and gated by smart contracts. Only owners can access the full content.",
                        icon: ShieldCheck,
                        color: "from-blue-600 to-indigo-500"
                    },
                    {
                        title: "Automated Royalties",
                        desc: "Smart contracts ensure creators get paid instantly for every purchase without any middleman.",
                        icon: Coins,
                        color: "from-purple-600 to-pink-500"
                    },
                    {
                        title: "Global Library",
                        desc: "Decentralized storage powered by IPFS ensures your educational legacy lives forever on the web.",
                        icon: Zap,
                        color: "from-emerald-600 to-teal-500"
                    }
                ].map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.2 }}
                        className="glass-card group relative p-8 !rounded-[2.5rem]"
                    >
                        <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-black/20 group-hover:scale-110 transition-transform`}>
                            <feature.icon className="text-white w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                        <p className="text-gray-400 leading-relaxed font-medium">{feature.desc}</p>
                    </motion.div>
                ))}
            </section>
        </div>
    );
}
