// @/components/home/SecuritySection.tsx
import React from 'react';
import { motion } from "framer-motion";

// Static data for security cards
const SECURITY_CARDS = [
    { id: 1, text: "End-to-End Encryption", desc: "Every call and transcript is protected with bank-level encryption." },
    { id: 2, text: "High Performance", desc: "Optimized for low latency and fast connections." },
    { id: 3, text: "Scalable", desc: "Works seamlessly for teams of any size." },
    { id: 4, text: "Secure Storage", desc: "All data is stored with enterprise-grade security." },
    { id: 5, text: "AI Powered", desc: "Enhance workflows with built-in intelligence." },
];

const SecuritySection: React.FC = () => {
    return (
        <section
            id="security"
            className="w-full py-8 flex flex-col justify-center items-center"
        >
            <div className="w-full max-w-5xl">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl font-medium font-montserrat text-center z-10 py-4">
                    Enterprise-Grade Security, Built In
                </motion.h1>
                <motion.p

                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }} className="text-center text-gray-300 mb-8">
                    CoreComm protects every call with the highest standards of encryption
                    and compliance, so your business and customers stay safe.
                </motion.p>
            </div>
            <div className="w-full flex justify-center overflow-x-auto overflow-y-hidden">
                <div className="flex max-w-6xl w-full lg:justify-center items-center space-x-4 px-4">
                    {SECURITY_CARDS.map((card) => (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: card.id * 0.1 }}
                            viewport={{ once: true, amount: 0.2 }}
                            key={card.id}
                            className="flex-shrink-0 w-56 aspect-square p-6 bg-gradient-to-tl from-neonPurple to-electricBlue rounded-3xl flex flex-col justify-end"
                        >
                            <div>
                                <p className="text-xs text-white mb-2">{card.desc}</p>
                                <h3 className="text-2xl font-bold text-white">{card.text}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default React.memo(SecuritySection);