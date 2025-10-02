"use client"
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "How does CoreComm ensure call quality?",
        answer:
            "CoreComm uses advanced codecs and adaptive bitrate streaming to maintain high call quality even on fluctuating network conditions.",
    },
    {
        question: "Is my data secure with CoreComm?",
        answer:
            "Absolutely. CoreComm employs end-to-end encryption and complies with industry standards to protect your data.",
    },
    {
        question: "Can I integrate CoreComm with other tools?",
        answer:
            "Yes, CoreComm offers a variety of integrations with popular CRM and productivity tools to streamline your workflow.",
    },
    {
        question: "What kind of customer support does CoreComm offer?",
        answer:
            "We provide 24/7 customer support through chat, email, and phone to assist you whenever you need help.",
    },
    {
        question: "How can I get started with CoreComm?",
        answer:
            "Getting started is easy! Sign up for a free trial on our website, and our onboarding team will guide you through the setup process.",
    },
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-deepBlue ">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-medium text-white mb-4 text-center font-montserrat">
                Still have questions?
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-gray-400 text-center">
                Find answers to common questions about CoreComm's features
            </motion.p>

            <div className="mt-8 grid grid-cols-1 gap-4 max-w-5xl mx-auto">
                {faqs.map((faq, index) => (
                    <motion.div
                        key={index}
                        className="rounded-2xl bg-gradient-to-br from-neonPurple/15 to-electricBlue/15 p-4 cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        viewport={{ once: true, amount: 0.5 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        onClick={() => toggleFAQ(index)}
                    >
                        {/* Question Row */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-white">{faq.question}</h2>
                            <motion.div
                                animate={{ rotate: openIndex === index ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronDown className="text-white" />
                            </motion.div>
                        </div>

                        {/* Expandable Answer */}
                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    key="content"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <p className="text-gray-300 mt-2">{faq.answer}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
