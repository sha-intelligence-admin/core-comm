"use client";
import CountUp from '@/components/home/countUp';
import Footer from '@/components/home/Footer';
import Header from '@/components/home/header';
import { motion } from 'framer-motion';
import { CheckCircle2, Globe, Lock, MessageSquare, RefreshCw, Zap } from 'lucide-react';
import React from 'react';

const STATS_DATA = [
    { value: 10, suffix: "M+", text: "Calls Handled Seamlessly" },
    { value: 50, suffix: "+", text: "Countries using CoreComm" },
    { value: 99.9, suffix: "%", text: "Uptime Reliable Infrastructure" },
    { value: 60, suffix: "%", text: "Cost Saving for Businesses" },
];

const DIFFERENTIATORS = [
    {
        icon: Globe,
        title: "Truly Multilingual & Voice-Ready",
        description: "We support customers in their preferred language and communication channel, breaking down barriers to excellent service."
    },
    {
        icon: Zap,
        title: "API-First Architecture",
        description: "Built on an API-first architecture, ensuring seamless integration with your existing systems and workflows."
    },
    {
        icon: MessageSquare,
        title: "Always Available",
        description: "24/7 support ensuring that your customers receive assistance whenever they need it."
    },
    {
        icon: Lock,
        title: "Privacy-First by Design",
        description: "Built on secure infrastructure that protects your data and your customers' trust."
    },
    {
        icon: CheckCircle2,
        title: "Omnichannel Support",
        description: "Seamless support across all channels, ensuring a consistent and unified customer experience."
    },
    {
        icon: RefreshCw,
        title: "Continuous Learning Loop",
        description: "Our AI doesn't just respond—it learns from every conversation, constantly refining its understanding."
    }
];

const RESULTS = [
    { metric: 40, description: "reduction in ticket volume during pilot programs", prefix: "~", suffix: "%" },
    { metric: 5, description: "faster resolution times", prefix: "", suffix: "" },
    { metric: 4, description: "with multilingual support active", prefix: "", suffix: "" },
    { metric: 150, description: "in revenue generated to date", prefix: "$", suffix: "K" }
];

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

const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const About = () => {
    return (
        <div className='bg-deepBlue text-start font-montserrat'>
            <Header />

            {/* Hero Section */}
            <section id="hero" className='min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-20'>
                <div className='max-w-5xl mx-auto text-center mb-20'>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold font-montserrat z-10 mb-8 
                        bg-gradient-to-br from-electricBlue to-neonPurple bg-clip-text text-transparent">
                        Transforming Customer Support with Intelligent AI
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto">
                        Core Comm is an advanced AI agent designed to revolutionize how businesses handle customer support. Born from the recognition that traditional support systems are failing both companies and customers, we've built a solution that delivers fast, human-like assistance across voice, text, and knowledge channels—24 hours a day, 7 days a week.
                    </motion.p>
                </div>

                {/* Trusted By Section */}
                <div className="w-full max-w-7xl mx-auto">
                    <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-deepBlue to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-deepBlue to-transparent z-10 pointer-events-none" />
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
                                {[...Array(2)].map((_, setIndex) => (
                                    <div key={setIndex} className="flex gap-16 items-center flex-shrink-0">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                            <div
                                                key={num}
                                                className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                                                style={{ minWidth: '140px' }}
                                            >
                                                <div className="bg-gradient-to-br from-aquaGlow/5 via-electricBlue/5 to-neonPurple/5 backdrop-blur-sm rounded-xl p-6 border border-electricBlue/20 h-20 w-full flex items-center justify-center hover:border-electricBlue/40 transition-all">
                                                    <span className="text-white/60 font-semibold text-sm whitespace-nowrap">
                                                        Company {num}
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
                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
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

            {/* Challenge Section */}
            <section id="challenge" className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className=""
                >
                    <h2 className="text-3xl md:text-4xl font-medium font-montserrat mb-6">
                        The Challenge We're Solving
                    </h2>
                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                        Support teams today face an impossible burden. Long response times frustrate customers, operational costs spiral upward, and repetitive questions clog systems while teams struggle to keep up. Meanwhile, customers have grown to expect instant, intelligent service. Traditional chatbots, with their rigid scripts and limited understanding, simply can't meet these demands or scale effectively.
                    </p>
                    <div className="bg-gradient-to-r from-electricBlue/10 to-neonPurple/10 border-l-4 border-electricBlue p-6 rounded-r-lg">
                        <p className="text-gray-200 text-lg">
                            We saw this pain point clearly: <span className="text-electricBlue font-bold">61% of customers leave after just one bad experience.</span> In an era where AI-native users expect immediate, thoughtful responses, businesses need more than automation—they need intelligence.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Solution Section */}
            <section id="solution" className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-medium font-montserrat mb-6 ">
                        Our Solution
                    </h2>
                    <div className="space-y-6">
                        <p className="text-gray-300 text-lg leading-relaxed">
                            Core Comm is an AI agent that's been specifically trained, optimized, and programmed to think and act like your best support representative. Unlike conventional chatbots, our agent understands what customers are truly asking and delivers helpful, natural responses whether they reach out via chat, voice, or email.
                        </p>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            The system pulls answers from your help documentation, FAQs, and past conversations, ensuring customers never have to repeat themselves. Every interaction makes Core Comm smarter, continuously improving response speed and quality over time.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* What Makes Us Different */}
            <section id="differentiators" className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-medium font-montserrat mb-4 ">
                        What Makes Us Different
                    </h2>
                    <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                        Built with cutting-edge technology and a customer-first approach
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                >
                    {DIFFERENTIATORS.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={index}
                                variants={cardVariants}
                                className="bg-gradient-to-br from-aquaGlow/5 via-electricBlue/5 to-neonPurple/5 p-6 rounded-2xl border border-electricBlue/20 hover:border-electricBlue/40 transition-all duration-300 hover:shadow-xl hover:shadow-electricBlue/10"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-electricBlue/30 to-neonPurple/30 rounded-xl flex items-center justify-center mb-4">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{item.description}</p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </section>

            {/* Proven Results */}
            <section id="proven-results" className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className=""
                >
                    <h2 className="text-3xl md:text-4xl font-medium font-montserrat mb-8 text-center ">
                        Proven Results
                    </h2>
                    <p className="text-gray-300 text-lg text-center mb-12">
                        Our early implementations speak for themselves
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {RESULTS.map((result, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-gradient-to-br from-electricBlue/10 to-transparent p-6 rounded-xl border border-electricBlue/30"
                            >
                                <h3 className="text-4xl font-bold text-electricBlue mb-2">
                                    <span>{result.prefix}</span>
                                    <CountUp
                                        from={0}
                                        to={result.metric}
                                        separator=","
                                        direction="up"
                                        duration={1}
                                        className="count-up-text"
                                    />
                                    <span>{result.suffix}</span>
                                </h3>
                                <p className="text-gray-300">{result.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Who We Serve */}
            <section id="who-we-serve" className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-medium font-montserrat mb-8 ">
                        Who We Serve
                    </h2>
                    <p className="text-gray-300 text-lg mb-8">
                        Core Comm is built for forward-thinking organizations that prioritize customer experience:
                    </p>
                    <div className="space-y-6">
                        {[
                            {
                                title: "Customer-first startups",
                                desc: "Digital service platforms seeking to scale support without sacrificing quality"
                            },
                            {
                                title: "Large organizations",
                                desc: "Requiring multilingual, 24/7 support capabilities"
                            },
                            {
                                title: "Enterprises",
                                desc: "Transitioning from traditional helpdesks to AI-driven support systems"
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="flex items-start space-x-4 bg-gradient-to-r from-electricBlue/5 to-transparent p-6 rounded-xl border-l-4 border-electricBlue"
                            >
                                {/* <CheckCircle2 className="w-6 h-6 text-electricBlue flex-shrink-0 mt-1" /> */}
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                                    <p className="text-gray-400">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Sha Intelligence */}
            <section id="sha-intelligence" className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row-reverse"
                >
                    <img src="sha_intell.png" alt="sha_intell" className='mx-auto mb-12 invert w-[50%] object-contain' />
                    <div>
                        <h2 className="text-3xl md:text-4xl font-medium font-montserrat mb-6 w-[50%]">
                            A Product of Sha Intelligence
                        </h2>
                        <p className="text-gray-300 text-lg mb-6 leading-relaxed max-w-4xl mx-auto">
                            Core Comm is proudly developed by Sha Intelligence, a company dedicated to building intelligent solutions that solve real business challenges. We believe that AI should enhance human capabilities, not replace them—and that great customer service should be accessible to businesses of all sizes.
                        </p>
                        <p className="text-gray-300 text-lg leading-relaxed max-w-4xl mx-auto">
                            As we continue to expand our capabilities with voice and WhatsApp support, advanced analytics, sentiment-based responses, and enterprise-grade integrations, our mission remains constant: to help businesses save time, reduce costs, and boost customer satisfaction with every message.
                        </p>
                    </div>

                </motion.div>
            </section>

            <Footer />
        </div>
    );
};

export default About;