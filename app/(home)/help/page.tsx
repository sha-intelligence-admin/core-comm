"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, MessageSquare, Mail, Phone, Globe, Shield, Zap, Settings, HelpCircle, Rocket } from "lucide-react";
import Header from "@/components/home/header";
import Footer from "@/components/home/Footer";

const helpCategories = [
    {
        icon: Rocket,
        title: "Getting Started",
        items: [
            {
                question: "What is Core Comm AI?",
                answer: "Core Comm is an intelligent AI agent that handles customer support across voice, text, and knowledge channels—24/7. It's designed to provide human-like responses while learning and improving from every interaction."
            },
            {
                question: "Who is it for?",
                answer: "Customer-first startups, digital service platforms, and enterprises looking to automate and scale their support while maintaining quality and personal touch."
            },
            {
                question: "How do I sign up?",
                answer: "Visit shaintelligence.com and choose a plan (Basic, Professional, or Enterprise). Our onboarding team will guide you through the setup process."
            },
            {
                question: "Is there a free trial?",
                answer: "Yes, we offer free trials so your team can test Core Comm before committing. Experience the power of AI-driven support risk-free."
            }
        ]
    },
    {
        icon: MessageSquare,
        title: "Using Core Comm",
        items: [
            {
                question: "How does Core Comm answer questions?",
                answer: "It pulls answers from your FAQs, help docs, past chats, and CRM to give human-like, context-aware responses. The AI understands intent and provides relevant solutions."
            },
            {
                question: "What channels are supported?",
                answer: "Live chat (web & in-app), Email, Voice (with add-on), and Multilingual support active across 4 regions. Coming soon: WhatsApp & IVR."
            },
            {
                question: "Does Core Comm hand off to humans?",
                answer: "Yes. Smart human handoff ensures smooth transitions when complex issues require human expertise, creativity, or deep empathy."
            },
            {
                question: "Can I customize responses?",
                answer: "Absolutely! Core Comm adapts to your brand voice and can be personalized with specific terminology, tone, and knowledge base content."
            }
        ]
    },
    {
        icon: Zap,
        title: "Plans & Pricing",
        items: [
            {
                question: "What plans are available?",
                answer: "Basic ($99/month): Core AI agent with essential features. Professional ($399/month): Advanced support with multilingual, analytics, and integrations. Enterprise (Custom): Tailored for large-scale deployments."
            },
            {
                question: "What add-ons are available?",
                answer: "Voice Assistant: +$99/month, Analytics Dashboard: +$49/month. CRM Integrations (Salesforce, HubSpot, Zendesk) are included free with all plans."
            },
            {
                question: "Can I upgrade or downgrade my plan?",
                answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades apply at the next billing cycle."
            }
        ]
    },
    {
        icon: Shield,
        title: "Security & Privacy",
        items: [
            {
                question: "Is Core Comm secure?",
                answer: "Absolutely. Core Comm is privacy-first by design, built on Sha Intelligence's secure infrastructure with end-to-end encryption and industry-standard compliance."
            },
            {
                question: "Where is my data stored?",
                answer: "Data is encrypted and stored in compliance with global privacy standards (GDPR-ready). We treat security as a foundation, not just a feature."
            },
            {
                question: "Who has access to my customer data?",
                answer: "Only authorized personnel within your organization. We never share, sell, or use your data for any purpose other than providing the service."
            }
        ]
    },
    {
        icon: Settings,
        title: "Troubleshooting",
        items: [
            {
                question: "Why isn't Core Comm responding correctly?",
                answer: "Make sure your knowledge base and FAQs are updated. The AI improves over time as it learns from conversations. You can also review and refine the training data."
            },
            {
                question: "Having integration issues?",
                answer: "Check your CRM/Helpdesk API credentials and ensure permissions are properly configured. Our support team is available 24/7 to assist."
            },
            {
                question: "Experiencing latency or slow replies?",
                answer: "While rare, if this occurs, check your server connection or contact our team. We monitor system performance continuously to maintain optimal speed."
            }
        ]
    },
    {
        icon: Globe,
        title: "Roadmap & Updates",
        items: [
            {
                question: "What's coming in Q3 2025?",
                answer: "Voice + Chat support, CRM integrations (Zendesk, HubSpot), Enhanced multilingual capabilities, and Smart human handoff improvements."
            },
            {
                question: "What's planned for Q4 2025?",
                answer: "WhatsApp & IVR support, Auto ticket summarization, Sentiment-based tone adaptation, and Feedback-based learning enhancements."
            },
            {
                question: "What about Q1 2026?",
                answer: "On-premise deployment options, Advanced analytics dashboard, Brand-personalized responses, and Contact center integrations."
            }
        ]
    }
];

const HelpCenter = () => {
    const [openIndex, setOpenIndex] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const toggleFAQ = (id: string) => {
        setOpenIndex(openIndex === id ? null : id);
    };

    const filteredCategories = helpCategories.map(category => ({
        ...category,
        items: category.items.filter(item => 
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.items.length > 0);

    return (
        <div className="bg-deepBlue min-h-screen">
            <Header />
            {/* Hero Section */}
            <section className="relative w-full overflow-hidden px-4 flex flex-col justify-center items-center pt-20 pb-16">
                <div className="w-full max-w-7xl justify-center items-center flex flex-col text-center font-montserrat">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-5xl font-bold bg-gradient-to-br from-electricBlue to-neonPurple bg-clip-text text-transparent mb-4 font-inter"
                    >
                        How Can We Help You?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-gray-400 text-lg mb-8"
                    >
                        Find everything you need to get started and make the most of Core Comm
                    </motion.p>
                    
                    {/* Search Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white p-1 pl-6 border rounded-full w-full max-w-2xl flex justify-between items-center"
                    >
                        <input 
                            type="text" 
                            placeholder="Search for help..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-black placeholder-gray-500 w-full"
                        />
                        <button className="group bg-electricBlue hover:bg-aquaGlow hover:text-deepBlue text-white p-3 rounded-full transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl">
                            <Search className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Help Categories */}
            <section className="px-4 pb-20">
                <div className="max-w-5xl mx-auto">
                    {filteredCategories.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-gray-400 py-20"
                        >
                            <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-xl">No results found for "{searchQuery}"</p>
                            <p className="text-sm mt-2">Try different keywords or browse all categories</p>
                        </motion.div>
                    ) : (
                        filteredCategories.map((category, categoryIndex) => (
                            <motion.div
                                key={categoryIndex}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                                className="mb-12"
                            >
                                {/* Category Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-electricBlue/20 to-aquaGlow/20">
                                        <category.icon className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-semibold text-white">{category.title}</h2>
                                </div>

                                {/* FAQ Items */}
                                <div className="grid grid-cols-1 gap-4">
                                    {category.items.map((item, itemIndex) => {
                                        const id = `${categoryIndex}-${itemIndex}`;
                                        return (
                                            <motion.div
                                                key={id}
                                                className="rounded-2xl bg-gradient-to-br from-neonPurple/15 to-electricBlue/15 p-4 cursor-pointer border border-transparent transition-all duration-300"
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.2, delay: itemIndex * 0.05 }}
                                                onClick={() => toggleFAQ(id)}
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <h3 className="text font-semibold text-white flex-1">
                                                        {item.question}
                                                    </h3>
                                                    <motion.div
                                                        animate={{ rotate: openIndex === id ? 180 : 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="flex-shrink-0"
                                                    >
                                                        <ChevronDown className=" w-5 h-5" />
                                                    </motion.div>
                                                </div>

                                                <AnimatePresence>
                                                    {openIndex === id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <p className="text-gray-300 mt-4 leading-relaxed">
                                                                {item.answer}
                                                            </p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </section>

            {/* Contact Support Section */}
            <section className="px-4 pb-20">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-3xl  text-center"
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">Still Need Help?</h2>
                        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                            Our support team is available 24/7 to assist you with any questions or issues
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                            {/* `<a href="https://shaintelligence.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-electricBlue/50 transition-all duration-300">
                                <Globe className="w-5 h-5 text-aquaGlow" />
                                <span className="text-white font-medium">Visit Website</span>
                            </a>` */}
                            
                            <a href="mailto:support@shaintelligence.com" className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10  transition-all duration-300">
                                <Mail className="w-5 h-5 text-aquaGlow" />
                                <span className="text-white font-medium">Email Support</span>
                            </a>
                            
                            <a href="tel:+447853257472" className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300">
                                <Phone className="w-5 h-5 text-aquaGlow" />
                                <span className="text-white font-medium">+44 7853 257472</span>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HelpCenter;