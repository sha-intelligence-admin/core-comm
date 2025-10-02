"use client";

import Header from '@/components/home/header'
import Orb from '@/components/home/Orb'
import {
    ArrowUpRight,
    Play,
    Phone,
    Brain,
    ArrowRight,
    Users,
    Check,
    CheckIcon,
    User,
    MessageSquare,
    Mail,
    Bot,
    Briefcase,
    Landmark,
    Truck,
    Building2,
    Signal,
    ShoppingBag,
} from 'lucide-react';
import React, { lazy, Suspense, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import Footer from '@/components/home/Footer';
import { Analytics } from '@/components/home/analytics';
import Globe from '@/components/home/Globe1';
import ScalingCard from '@/components/home/ScalingCard1';
import LottieWrapper from '@/components/home/LottieWrapper';
import IntegrationsSection from '@/components/home/IntegrationSection';
import SecuritySection from '@/components/home/SecuritySection';
import PageLoader from '@/components/home/PageLoader';
import { usePageLoading } from '@/hooks/usePageLoading';
import FAQ from '@/components/home/FAQ';
import CountUp from '@/components/home/countUp';
import { Button } from '@/components/ui/button';

// Lazy load heavy components
const ElevenLabsTTSForm = lazy(() => import('@/components/home/voiceSection'));

// Static data moved outside component
const STATS_DATA = [
    { value: 10, suffix: "M+", text: "Calls Handled Seamlessly" },
    { value: 50, suffix: "+", text: "Countries using CoreComm" },
    { value: 99.9, suffix: "%", text: "Uptime Reliable Infrastructure" },
    { value: 60, suffix: "%", text: "Cost Saving for Businesses" },
];



const CASE_STUDY_DATA = [
    {
        id: "case1",
        title: "E-commerce Giant Boosts Sales with CoreComm",
        headline: "Transforming Customer Engagement",
        content: "An e-commerce leader integrated CoreComm to handle peak call volumes during sales events, resulting in a 30% increase in conversions and a 25% reduction in customer service costs.",
        ceoAvatar: "https://res.cloudinary.com/dn2tbatgr/image/upload/v1758102002/296fe121-5dfa-43f4-98b5-db50019738a7_m8btm0.jpg",
        ceoComment: 'CoreComm became our most reliable agent. Customers love the experience." — Jane, CEO of ShopEase',
        link: "#"
    },
    {
        id: "case2",
        title: "Fintech Startup Streamlines Support",
        headline: "Revolutionizing Customer Interactions",
        content: "A fintech startup adopted CoreComm to manage customer inquiries, leading to a 40% decrease in response times and a 50% boost in customer satisfaction.",
        ceoAvatar: "https://res.cloudinary.com/dn2tbatgr/image/upload/v1758102002/296fe121-5dfa-43f4-98b5-db50019738a7_m8btm0.jpg",
        ceoComment: 'With CoreComm, our support is faster and smarter. Customers love it." — Sarah, CEO of FinTechX',
        link: "#"
    },
    {
        id: "case3",
        title: "Healthcare Provider Enhances Patient Experience",
        headline: "Reimagining Patient Engagement",
        content: "A leading healthcare provider implemented CoreComm to streamline patient interactions, resulting in a 35% increase in appointment bookings and a 20% reduction in no-show rates.",
        ceoAvatar: "https://res.cloudinary.com/dn2tbatgr/image/upload/v1758102002/296fe121-5dfa-43f4-98b5-db50019738a7_m8btm0.jpg",
        ceoComment: 'CoreComm has been a game-changer for us. Our patients love the seamless experience." — Michael, CEO of HealthCo',
        link: "#"
    },
];

export const products = [
    {
        title: "Moonbeam",
        link: "https://gomoonbeam.com",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/moonbeam.png",
    },
    {
        title: "Cursor",
        link: "https://cursor.so",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/cursor.png",
    },
    {
        title: "Rogue",
        link: "https://userogue.com",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/rogue.png",
    },
    {
        title: "Editorially",
        link: "https://editorially.org",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/editorially.png",
    },
    {
        title: "Editrix AI",
        link: "https://editrix.ai",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/editrix.png",
    },
    {
        title: "Pixel Perfect",
        link: "https://app.pixelperfect.quest",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/pixelperfect.png",
    },
    {
        title: "Algochurn",
        link: "https://algochurn.com",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/algochurn.png",
    },
    {
        title: "Aceternity UI",
        link: "https://ui.aceternity.com",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/aceternityui.png",
    },
    {
        title: "Tailwind Master Kit",
        link: "https://tailwindmasterkit.com",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/tailwindmasterkit.png",
    },
    {
        title: "SmartBridge",
        link: "https://smartbridgetech.com",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/smartbridge.png",
    },
    {
        title: "Renderwork Studio",
        link: "https://renderwork.studio",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/renderwork.png",
    },
    {
        title: "Creme Digital",
        link: "https://cremedigital.com",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/cremedigital.png",
    },
    {
        title: "Golden Bells Academy",
        link: "https://goldenbellsacademy.com",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/goldenbellsacademy.png",
    },
    {
        title: "Invoker Labs",
        link: "https://invoker.lol",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/invoker.png",
    },
    {
        title: "E Free Invoice",
        link: "https://efreeinvoice.com",
        thumbnail: "https://aceternity.com/images/products/thumbnails/new/efreeinvoice.png",
    },
];

// Animation variants
const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.3, duration: 0.5 }
    }),
}

const containerVariants1 = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.25 }, // delay between each item
    },
}

const stepVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: "easeOut" },
    },
}

const arrowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3 },
    },
}

export function AnalyticsSection() {
    return <Analytics products={products} />;
}

const Home = () => {
    // Critical images to preload
    const criticalImages = useMemo(() => [
        'logo.png',
        'call.png',
        'talk.png',
        'dollar.png',
        'secure.png',
        'gdpr.png',
        'hipaa.png',
        'soc2.png'
    ], []);

    const { isLoading } = usePageLoading({
        minLoadingTime: 500,
        imageUrls: criticalImages,
        additionalDelay: 200
    });

    const handleDemoClick = useCallback(() => {
        window.location.href = '/demo';
    }, []);

    const handleWatchDemo = useCallback(() => {
        // Add your watch demo logic here
    }, []);

    // Don't render main content while loading
    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className='bg-deepBlue'
            >
                <Header />

                {/* Hero Section */}
                <section id="hero" className="relative w-full h-[600px] overflow-hidden px-8 flex justify-center items-center border-none">
                    <div className='w-full flex max-w-5xl items-center justify-center border-none'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 z-0 border-none">
                            <Orb
                                hoverIntensity={0.5}
                                rotateOnHover={true}
                                hue={0}
                                forceHoverState={false}
                            />
                        </motion.div>

                        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="text-2xl sm:text-4xl font-medium text-white leading-relaxed py-4 font-montserrat">
                                Revolutionize Customer Service with CoreComm.
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="my-4 text sm:text-lg text-gray-200 font-montserrat">
                                Answer calls, handle queries, and support customers — 24/7 with human-like precision.
                            </motion.p>
                            <div className='flex flex-col sm:flex-row gap-4 mt-6'>
                                <button
                                    className="group bg-electricBlue hover:bg-aquaGlow hover:text-deepBlue text-white p-1 pl-3 rounded-full font-medium transition-all duration-200 flex items-center justify-between gap-2 shadow-lg hover:shadow-xl"
                                    onClick={handleDemoClick}
                                >
                                    Consult with an expert
                                    <div className="flex items-center justify-center rounded-full bg-deepBlue transition-colors duration-200 px-3 py-3">
                                        <ArrowUpRight className="w-5 h-5 text-white group-hover:text-white" />
                                    </div>
                                </button>
                                <button
                                    className="group bg-neonPurple hover:bg-aquaGlow hover:text-deepBlue text-white p-1 pl-3 rounded-full font-medium transition-all duration-200 flex items-center justify-between gap-2 shadow-lg hover:shadow-xl"
                                    onClick={handleWatchDemo}
                                >
                                    Watch Demo
                                    <div className="flex items-center justify-center rounded-full bg-deepBlue transition-colors duration-200 px-3 py-3">
                                        <Play className="w-5 h-5 text-white group-hover:text-white fill-white" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trusted By Section - Auto Scrolling Logos */}
                <section className="py-16 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4">
                        {/* Auto-scrolling container */}
                        <div className="relative">
                            {/* Gradient overlays for fade effect */}
                            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-deepBlue to-transparent z-10 pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-deepBlue to-transparent z-10 pointer-events-none" />

                            {/* Scrolling wrapper */}
                            <div className="overflow-hidden">
                                <motion.div
                                    className="flex gap-16 items-center"
                                    animate={{
                                        x: [0, "-100%"],
                                    }}
                                    transition={{
                                        x: {
                                            repeat: Infinity,
                                            repeatType: "loop",
                                            duration: 30,
                                            ease: "linear",
                                        },
                                    }}
                                >
                                    {/* Duplicate the logos twice for seamless loop */}
                                    {[...Array(2)].map((_, setIndex) => (
                                        <div key={setIndex} className="flex gap-16 items-center flex-shrink-0">
                                            {[
                                                { name: 'Company 1', width: 140 },
                                                { name: 'Company 2', width: 140 },
                                                { name: 'Company 3', width: 140 },
                                                { name: 'Company 4', width: 140 },
                                                { name: 'Company 5', width: 140 },
                                                { name: 'Company 6', width: 140 },
                                                { name: 'Company 7', width: 140 },
                                                { name: 'Company 8', width: 140 },
                                            ].map((logo, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                                                    style={{ minWidth: `${logo.width}px` }}
                                                >
                                                    {/* Replace with actual logo images */}
                                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 h-20 w-full flex items-center justify-center">
                                                        <span className="text-white/60 font-semibold text-sm whitespace-nowrap">
                                                            {logo.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section id='stats' className='w-full py-8 flex justify-center px-8'>
                    <div className='w-full flex flex-col space-y-5 lg:flex-row max-w-5xl items-center justify-center'>
                        <div className=''>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className='text-gray-300 font-montserrat'>
                                Stats in Action
                            </motion.h1>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className='text-4xl font-bold font-inter bg-gradient-to-br from-electricBlue to-neonPurple bg-clip-text text-transparent mb-4'>
                                Trusted. Scalable. Proven.
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className='font-montserrat lg:max-w-lg'>
                                CoreComm is powering smarter conversations across industries, delivering measurable impact every day.
                            </motion.p>
                        </div>
                        <motion.div
                            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 max-w-3xl mx-auto"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            {STATS_DATA.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    variants={cardVariants}
                                    className="flex aspect-square bg-gradient-to-br from-electricBlue to-neonPurple rounded-2xl flex-col items-center justify-center text-center shadow-xl"
                                >
                                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                                        <CountUp
                                            from={0}
                                            to={stat.value}
                                            separator=","
                                            direction="up"
                                            duration={1}
                                            className="count-up-text"
                                        />
                                        {stat.suffix}</h1>
                                    <p className="text-sm text-gray-200">{stat.text}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section id='features' className='w-full py-8 flex justify-center px-2 sm:px-4'>
                    <div className='flex w-full flex-col space-y-5 text-center'>
                        <section className="py-20">
                            <div className="mx-auto">
                                <div className="text-center mb-16">
                                    <motion.h2
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6 }}
                                        className="text-4xl font-medium text-white mb-4 font-montserrat">
                                        Powerful Features Built for Modern Business
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6 }}
                                        className="text-lg text-gray-300">
                                        Everything you need to deliver exceptional customer experiences
                                    </motion.p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 p-2">
                                {/* Intelligent Call Handling */}
                                <div className="lg:col-span-4 lg:row-span-1 backdrop-blur-3xl bg-gradient-to-tl from-neonPurple/10 via-electricBlue/10 to-aquaGlow/10 rounded-3xl text-white relative">
                                    <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                                    <div className="bg-transparent rounded-3xl p-6 flex justify-center items-center">
                                        <div className="flex flex-col w-full lg:flex-row lg:space-x-8 justify-center items-center gap-4">
                                            <div className="flex flex-col w-full text-start space-y-2">
                                                <motion.h1
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.6 }}
                                                    className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium font-montserrat'>Intelligent Call Handling & Smart Escalation</motion.h1>
                                                <motion.p
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.6 }}
                                                    className="text-sm text-gray-300">AI-powered conversations that feel natural </motion.p>
                                                <ul className="space-y-1 text-gray-300">
                                                    {[
                                                        "Natural language understanding for accurate responses",
                                                        "Adaptive conversation flow (never feels scripted)",
                                                        "Smart escalation to human agents when needed",
                                                    ].map((text, i) => (
                                                        <motion.li
                                                            key={i}
                                                            custom={i}
                                                            initial="hidden"
                                                            whileInView="visible"
                                                            viewport={{ once: true }}
                                                            variants={itemVariants}
                                                        >
                                                            <Check className="w-4 h-4 text-aquaGlow inline-block" /> {text}
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <motion.div
                                                className="flex items-center w-full justify-center gap-4 my-4 lg:my-0"
                                                initial="hidden"
                                                whileInView="visible"
                                                viewport={{ once: true, amount: 0.5 }}
                                                variants={containerVariants1}
                                            >
                                                <motion.div className="flex flex-col items-center gap-2" variants={stepVariants}>
                                                    <Phone className="w-8 h-8 text-blue-500" />
                                                    <span className="text-xs text-gray-200">Incoming Call</span>
                                                </motion.div>

                                                <motion.div variants={arrowVariants}>
                                                    <ArrowRight className="text-gray-400" />
                                                </motion.div>

                                                <motion.div className="flex flex-col items-center gap-2" variants={stepVariants}>
                                                    <Brain className="w-8 h-8 text-purple-500" />
                                                    <span className="text-xs text-gray-200">AI Processing</span>
                                                </motion.div>

                                                <motion.div variants={arrowVariants}>
                                                    <ArrowRight className="text-gray-400" />
                                                </motion.div>

                                                <motion.div className="flex flex-col items-center gap-2" variants={stepVariants}>
                                                    <Users className="w-8 h-8 text-green-500" />
                                                    <span className="text-xs text-gray-200">Smart Handoff</span>
                                                </motion.div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Capabilities */}
                                <div className="lg:col-span-2 space-y-4 lg:row-span-2 backdrop-blur-3xl bg-gradient-to-tl from-electricBlue/10 via-neonPurple/10 to-aquaGlow/10 shadow rounded-3xl p-6 relative">
                                    <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                                    <div className="flex flex-col text-start space-y-2">
                                        <motion.h1
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6 }}
                                            className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium font-montserrat mb-2'>Action-Driven AI</motion.h1>
                                        <motion.p
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6 }}
                                            className="text-gray-300 mb-4">Executes tasks such as booking appointments, updating accounts, or
                                            processing payments.</motion.p>
                                        <ul className="space-y-1 text-gray-300">
                                            {[
                                                "Integrates with CRMs and databases",
                                                "Billing and payment systems integration",
                                                "And other business tools via API",
                                                "Customizable workflows to fit your needs",
                                            ].map((text, i) => (
                                                <motion.li
                                                    key={i}
                                                    custom={i}
                                                    initial="hidden"
                                                    whileInView="visible"
                                                    viewport={{ once: true }}
                                                    variants={itemVariants}
                                                >
                                                    <Check className="w-4 h-4 text-aquaGlow inline-block" /> {text}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6 }}
                                        className="bg-deepBlue rounded-3xl p-4 h-64">
                                        <div className="text-xs text-gray-100 mb-2">Call Transcript + AI Summary</div>
                                        <div className="bg-white rounded-lg p-3 mb-2 text-xs">
                                            <div className="text-gray-500">Customer: "I need help with my order..."</div>
                                            <div className="text-electricBlue">Agent: "I'd be happy to help..."</div>
                                        </div>
                                        <div className="bg-gradient-to-r from-electricBlue to-aquaGlow rounded-lg p-3 text-white text-xs">
                                            <div className="font-medium mb-1">AI Generated Summary:</div>
                                            <div>Order inquiry - Status check - Resolved ✓</div>
                                            <div>Sentiment: Satisfied • Duration: 3:42</div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Scalability */}
                                <div className="lg:col-span-2 lg:row-span-2 h-auto backdrop-blur-3xl bg-gradient-to-tl from-aquaGlow/10 via-electricBlue/10 to-neonPurple/10 shadow rounded-3xl relative">
                                    <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                                    <div className="bg-transparent rounded-3xl flex flex-col h-full justify-between overflow-hidden">
                                        <div className="text-start p-6">
                                            <motion.h1
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6 }}
                                                className="text-xl sm:text-2xl md:text-3xl font-medium mb-4 font-montserrat">Scalability & Reliability</motion.h1>
                                            <motion.p
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6 }}
                                                className="text-sm text-gray-200 mb-4">CoreComm is built to scale with your business, ensuring reliable performance even during peak times.</motion.p>
                                        </div>
                                        <div className="h-80 top-20 lg:top-0 relative w-full flex gap-2 text-xs text-gray-600 items-center justify-center">
                                            <Globe />
                                        </div>
                                    </div>
                                </div>

                                {/* Security */}
                                <div className="lg:col-span-2 lg:row-span-1 backdrop-blur-3xl bg-gradient-to-tl from-electricBlue to-neonPurple rounded-3xl text-white relative">
                                    <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                                    <div className="h-full w-full rounded-3xl p-6 flex items-center justify-center">
                                        <div className="text-start items-center justify-center w-full">
                                            <motion.h1
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6 }}
                                                className="text-xl sm:text-2xl font-medium mb-4 font-montserrat">Enterprise Grade Security. Built in.</motion.h1>
                                            <motion.p
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6, delay: 0.1 }}
                                                className="text-sm text-gray-200 mb-4">Protect your data with industry-leading security measures. CoreComm is compliant with global standards.</motion.p>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6 }}
                                                className="w-full flex gap-2 text-xs text-gray-600 items-center justify-center">
                                                <img src="gdpr.png" alt="GDPR" className='max-w-20 invert' loading='lazy' width="80" height="68" />
                                                <img src="hipaa.png" alt="HIPAA" className='max-w-20 h-17 invert' loading='lazy' width="80" height="68" />
                                                <img src="soc2.png" alt="SOC2" className='max-w-20 invert' loading='lazy' width="80" height="68" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>

                                {/* Integrations */}
                                <IntegrationsSection />

                                {/* Multilingual Support - NEW */}
                                <div className="lg:col-span-4 lg:row-span-1 backdrop-blur-3xl bg-gradient-to-tl from-aquaGlow/10 via-neonPurple/10 to-electricBlue/10 rounded-3xl text-white relative">
                                    <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                                    <div className="bg-transparent rounded-3xl p-6 h-full flex flex-col justify-between">
                                        <div className="text-start">
                                            <motion.h1
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6 }}
                                                className='text-xl sm:text-2xl md:text-3xl font-medium font-montserrat mb-2'>Multilingual Support</motion.h1>
                                            <motion.p
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6 }}
                                                className="text-sm text-gray-300 mb-4">Understands and communicates in multiple languages with accurate translation and intent recognition</motion.p>
                                            <ul className="space-y-1 text-gray-300 text-sm">
                                                {[
                                                    "Real-time translation across 20+ languages",
                                                    "Accurate intent recognition across cultures",
                                                    "Ideal for diverse customer bases",
                                                ].map((text, i) => (
                                                    <motion.li
                                                        key={i}
                                                        custom={i}
                                                        initial="hidden"
                                                        whileInView="visible"
                                                        viewport={{ once: true }}
                                                        variants={itemVariants}
                                                    >
                                                        <Check className="w-4 h-4 text-aquaGlow inline-block" /> {text}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6 }}
                                            className="flex flex-wrap gap-2 mt-4 justify-center">
                                            {[
                                                { lang: 'English', flag: 'en.jpeg' },
                                                { lang: 'Español', flag: 'es.jpeg' },
                                                { lang: '中文', flag: 'cn.jpeg' },
                                                { lang: 'العربية', flag: 'sa.jpeg' },
                                                { lang: 'Français', flag: 'fr.jpeg' },
                                                { lang: '日本語', flag: 'jp.jpeg' }
                                            ].map(({ lang, flag }, i) => (
                                                <span key={i} className="pr-4 p-1 bg-white/10 rounded-full text-xs backdrop-blur-sm border border-white/20 flex items-center gap-2">
                                                    <img src={`/${flag}`} alt={lang} className="w-4 h-4 rounded-full" />
                                                    {lang}
                                                </span>
                                            ))}
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Omnichannel Knowledge Retrieval - NEW */}
                                <div className="lg:col-span-2 lg:row-span-1 backdrop-blur-3xl bg-gradient-to-tl from-neonPurple/10 via-aquaGlow/10 to-electricBlue/10 rounded-3xl text-white relative">
                                    <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                                    <div className="bg-transparent rounded-3xl p-6 h-full flex flex-col justify-between">
                                        <div className="text-start">
                                            <motion.h1
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6 }}
                                                className='text-xl sm:text-2xl md:text-3xl font-medium font-montserrat mb-2'>Omnichannel Knowledge</motion.h1>
                                            <motion.p
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6 }}
                                                className="text-sm text-gray-300 mb-4">Accesses FAQs, help articles, and internal databases to provide accurate answers instantly</motion.p>
                                            <ul className="space-y-1 text-gray-300 text-sm">
                                                {[
                                                    "Instant access to knowledge bases",
                                                    "Consistency across phone, chat, and email",
                                                    "Always up-to-date information",
                                                ].map((text, i) => (
                                                    <motion.li
                                                        key={i}
                                                        custom={i}
                                                        initial="hidden"
                                                        whileInView="visible"
                                                        viewport={{ once: true }}
                                                        variants={itemVariants}
                                                    >
                                                        <Check className="w-4 h-4 text-aquaGlow inline-block" /> {text}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6 }}
                                            className="grid grid-cols-3 gap-2 mt-4">
                                            {[
                                                { icon: Phone, label: 'Phone' },
                                                { icon: MessageSquare, label: 'Chat' },
                                                { icon: Mail, label: 'Email' }
                                            ].map(({ icon: Icon, label }, i) => (
                                                <div key={i} className="flex flex-col items-center gap-1 p-2 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                                                    <Icon className="w-5 h-5 text-aquaGlow" />
                                                    <span className="text-xs text-gray-300">{label}</span>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </section>

                {/* Target Industries Section */}


                {/* Voices Section */}
                <section id='Voices' className='w-full py-8 flex justify-center px-4'>
                    <div className='w-full flex h-full flex-col lg:space-x-5 lg:flex-row max-w-7xl items-center justify-center'>
                        <div className="text-center lg:text-start mx-auto w-full h-full lg:w-1/2 items-center justify-center">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="text-4xl font-bold bg-gradient-to-br from-electricBlue to-neonPurple bg-clip-text text-transparent mb-4 font-montserrat"
                            >
                                Try Our Crystal-clear AI Voices
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-lg text-gray-200"
                            >
                                Experience the future of customer interactions with our advanced AI voices.
                            </motion.p>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className='w-full lg:w-1/2'>
                            <Suspense fallback={
                                <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl animate-pulse flex items-center justify-center">
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto animate-pulse"></div>
                                        <div className="h-4 bg-gray-600 rounded w-32 mx-auto"></div>
                                        <div className="h-3 bg-gray-600 rounded w-24 mx-auto"></div>
                                    </div>
                                </div>
                            }>
                                <ElevenLabsTTSForm />
                            </Suspense>
                        </motion.div>
                    </div>
                </section>

                <AnalyticsSection />

                {/* Benefits Section */}
                {/* <section id="benefits" className="w-full py-8 flex justify-center items-center px-4">
                    <div className="w-full">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl font-medium font-montserrat text-center mb-4 z-10 py-4">
                            Why Businesses Choose CoreComm
                        </motion.h1>
                        <div className="">
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                <motion.div
                                    initial={{ opacity: 0.5, scale: 0.9 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1 }}
                                    className='h-[40vh] md:col-span-1 md:row-span-1 rounded-3xl backdrop-blur-3xl bg-gradient-to-tl from-neonPurple/15 via-electricBlue/15 to-aquaGlow/15 animate-gradient p-6 flex flex-col justify-end items-start text-start m-0 w-full relative'
                                >
                                    <div className="absolute inset-0 flex justify-end items-start pointer-events-none">
                                        <LottieWrapper
                                            animationType="clock"
                                            className="w-[50%] sm:w-[30%] md:w-[50%] -z-10"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold">Always Available — 24/7</h3>
                                    <p className="text-sm text-gray-200">Never miss a customer call again. CoreComm ensures your business is always open, even on weekends and holidays.</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0.5, scale: 0.9 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1 }}
                                    className='relative h-[40vh] md:col-span-2 md:row-span-1 rounded-3xl backdrop-blur-3xl bg-gradient-to-tl from-neonPurple/15 via-electricBlue/15 to-aquaGlow/15 animate-gradient p-6 flex flex-col justify-end items-start text-start m-0 w-full overflow-hidden'
                                >
                                    <div className="mt-4 mr-6 w-full justify-start items-end flex flex-col space-y-2 absolute inset-0 text-sm text-white/80 p-4 leading-relaxed overflow-hidden pointer-events-none select-none">
                                        <div className='w-[70%] mr-12 bg-gradient-to-tr from-neonPurple/20 via-electricBlue/20 to-aquaGlow/20 rounded-full p-6 animate-gradient'>
                                            Hi there! How can I assist you today?
                                        </div>
                                        <div className='w-[70%] ml-12 bg-gradient-to-tr from-neonPurple/20 via-electricBlue/20 to-aquaGlow/20 rounded-full p-6 animate-gradient'>
                                            I have a question about my order.
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold relative z-10">Human-Like Conversations</h3>
                                    <p className="text-sm text-gray-200 relative z-10">
                                        Never miss a customer call again. CoreComm ensures your business is always open, even on weekends and holidays.
                                    </p>
                                    <div className='absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-electricBlue to-aquaGlow rounded-full opacity-20 blur-3xl animate-gradient' />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0.5, scale: 0.9 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1 }}
                                    className="relative h-[40vh] md:col-span-2 md:row-span-1 rounded-3xl backdrop-blur-3xl bg-gradient-to-tl from-neonPurple/15 via-electricBlue/15 to-aquaGlow/15 animate-gradient p-6 flex flex-col justify-end items-start text-start m-0 w-full"
                                >
                                    <div className="absolute inset-0 flex justify-end items-center pointer-events-none">
                                        <LottieWrapper
                                            animationType="chart"
                                            className="w-[80%]"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold z-10">Cut Costs, Not Quality</h3>
                                    <p className="text-sm text-gray-200 z-10">
                                        Save up to 60% on call center operations while improving customer satisfaction scores.
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0.5, scale: 0.9 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1 }}
                                    className='h-[40vh] md:col-span-1 md:row-span-1 rounded-3xl backdrop-blur-3xl bg-gradient-to-tl from-neonPurple/15 via-electricBlue/15 to-aquaGlow/15 animate-gradient p-6 flex flex-col justify-end items-start text-start m-0 w-full relative'
                                >
                                    <div className="absolute inset-0 flex justify-end items-start pointer-events-none">
                                        <LottieWrapper
                                            animationType="secure"
                                            className="w-[50%] sm:w-[30%] md:w-[50%]"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold">Enterprise-Grade Security</h3>
                                    <p className="text-sm text-gray-200">Get started quickly with our simple setup process.</p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section> */}

                {/* Demo Section */}
                <section id="demo" className="relative w-full h-[600px] overflow-hidden px-8 flex justify-center items-center">
                    <div className='w-full flex max-w-5xl items-center justify-center'>
                        <div className="absolute inset-0 -z-100">
                            <Suspense fallback={<div className="w-full h-full bg-gray-900 animate-pulse" />}>
                                <Orb
                                    hoverIntensity={0.5}
                                    rotateOnHover={true}
                                    hue={0}
                                    forceHoverState={false}
                                />
                            </Suspense>
                        </div>

                        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }} className="text-2xl sm:text-4xl font-medium text-white leading-relaxed py-4">See CoreComm in Action</motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="my-4 text sm:text-lg text-gray-200 font-montserrat">
                                Get a personalized demo and discover how CoreComm can transform your customer interactions.
                            </motion.p>
                            <div className='flex flex-col sm:flex-row gap-4 mt-6'>
                                <button
                                    className="group bg-electricBlue hover:bg-aquaGlow hover:text-deepBlue text-white p-1 pl-3 rounded-full font-medium transition-all duration-200 flex items-center justify-between gap-2 shadow-lg hover:shadow-xl"
                                    onClick={handleDemoClick}
                                >
                                    Book a Demo
                                    <div className="flex items-center justify-center rounded-full bg-deepBlue transition-colors duration-200 px-3 py-3">
                                        <Play className="w-5 h-5 text-white group-hover:text-white fill-white" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Case Studies Section */}
                <section id='case studies' className='w-full py-8 flex justify-center px-4'>
                    <div className="w-full max-w-8xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl font-medium font-montserrat text-center z-10 py-4">
                            Real Businesses, Real Results
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center text-gray-300 mb-8"
                        >
                            Discover how our clients have transformed their operations with CoreComm.
                        </motion.p>
                        <div className="w-[90%] mx-auto py-8">
                            <ul
                                id="cards"
                                className="grid grid-cols-1 lg:gap-[1vw]"
                                style={{
                                    paddingBottom: `calc(${CASE_STUDY_DATA.length} * 0em)`,
                                    marginBottom: "1vw",
                                }}
                            >
                                {CASE_STUDY_DATA.map((card, index) => (
                                    <ScalingCard key={card.id} card={card} index={index} />
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <SecuritySection />

                {/* Pricing Section */}
                <section id='pricing' className='w-full py-8 flex flex-col justify-center items-center px-4'>
                    <div className='max-w-5xl w-full px-4'>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl font-medium font-montserrat text-center z-10 py-4">
                            Simple, Transparent Pricing
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center text-gray-300 mb-8">
                            Choose the plan that's right for your business.
                        </motion.p>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl justify-center'>
                            <motion.div
                                className='my-4 w-full backdrop-blur-3xl bg-gradient-to-tl from-neonPurple/20 to-electricBlue/20 rounded-3xl p-4 md:p-8 py-8 border-hidden shadow-2xl flex flex-col gap-4 relative'
                                initial={{ opacity: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1.05 }}
                                transition={{ duration: 1 }}
                            >
                                <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 animate-gradient shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                                <div className='pb-2 w-full border-b border-white text-start items-start'>
                                    <h1 className='font-medium text-lg'>Starter</h1>
                                    <h1 className='font-bold text-xl'>$99/month</h1>
                                </div>
                                <p className='text-sm text-gray-300'>For small businesses, up to 1,000 calls.</p>
                                <div className="flex-1">
                                    <ul className='space-y-2'>
                                        <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Basic AI Support</li>
                                        <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Standard Analytics</li>
                                        <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Email Support</li>
                                        <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Basic Integrations</li>
                                    </ul>
                                </div>
                                <button className='bg-electricBlue rounded-full text-sm py-2 mt-auto'>
                                    Get Started
                                </button>
                            </motion.div>

                            <motion.div
                                className='my-4 w-full backdrop-blur-3xl bg-gradient-to-tl from-aquaGlow/20 to-electricBlue/20 animate-gradient rounded-3xl p-4 md:p-8 py-8 border-hidden shadow-2xl flex flex-col gap-4 relative'
                                initial={{ opacity: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1.05 }}
                                transition={{ duration: 1 }}
                            >
                                <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                                <div className='pb-2 w-full border-b border-white text-start items-start'>
                                    <h1 className='font-medium text-lg'>Growth</h1>
                                    <h1 className='font-bold text-xl'>$199/month</h1>
                                </div>
                                <p className='text-sm text-gray-300'>For scaling businesses, up to 5,000 calls.</p>
                                <div className="flex-1">
                                    <ul className='space-y-2'>
                                        <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Multi-Language Support</li>
                                        <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> 24/7 AI Support</li>
                                        <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Advanced Support</li>
                                        <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Advanced Analytics</li>
                                        <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Priority Customer Care</li>
                                    </ul>
                                </div>
                                <button className='bg-electricBlue rounded-full text-sm py-2 mt-auto'>
                                    Get Started
                                </button>
                            </motion.div>

                            <motion.div
                                className='my-4 w-full backdrop-blur-3xl bg-gradient-to-tl from-neonPurple/20 to-electricBlue/20 animate-gradient rounded-3xl p-4 md:p-8 py-8 border-hidden shadow-2xl flex flex-col gap-4 relative'
                                initial={{ opacity: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1.05 }}
                                transition={{ duration: 1 }}
                            >
                                <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                                <div className='pb-2 w-full border-b border-white text-start items-start'>
                                    <h1 className='font-medium text-lg'>Enterprise</h1>
                                    <h1 className='font-bold text-xl'>$499/month</h1>
                                </div>
                                <p className='text-sm text-gray-300'>For large enterprises, unlimited calls.</p>
                                <div className="flex-1">
                                    <ul className='space-y-2'>
                                        <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Custom AI Training</li>
                                        <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Dedicated Support Team</li>
                                        <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> White-label Options</li>
                                        <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Custom Integrations</li>
                                        <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> SLA Guarantees</li>
                                    </ul>
                                </div>
                                <button className='bg-electricBlue rounded-full text-sm py-2 mt-auto'>
                                    Contact Sales
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <section id='faq' className='w-full py-8 flex justify-center px-2'>
                    <div className="w-full max-w-5xl">
                        <FAQ />
                    </div>
                </section>

                <Footer />
            </motion.div>
        </AnimatePresence>
    )
}

export default React.memo(Home);