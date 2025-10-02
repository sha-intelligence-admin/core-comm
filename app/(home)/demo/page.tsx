"use client";

import CountUp from '@/components/home/countUp';
import Footer from '@/components/home/Footer';
import Header from '@/components/home/header';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react'
import React from 'react'

const DemoPage = () => {
    const stats = [
        { value: 10, suffix: "M+", text: "Calls Handled Seamlessly" },
        { value: 50, suffix: "+", text: "Countries using CoreComm" },
        { value: 99.9, suffix: "%", text: "Uptime Reliable Infrastructure" },
        { value: 60, suffix: "%", text: "Cost Saving for Businesses" },
    ];

    const containerVariants = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: 0.2, // delay between cards
            },
        },
    }

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
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.3, duration: 0.5 }
        }),
    }

    return (
        <div className='bg-deepBlue'>
            <Header />
            <section id='hero' className="relative w-full overflow-hidden px-4 flex flex-col lg:flex-row space-x-4 justify-center items-center text-start">
                <div className='w-full max-w-7xl justify-center items-center flex flex-col lg:flex-row lg:space-x-8'>
                    <div className='flex-1 flex flex-col text-start'>
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl font-medium font-montserrat text-start z-10 py-4">
                            Unlock 10x Efficiency with AI-Powered Customer Service
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-start text-gray-200 mb-8">
                            Book a free strategy session with our AI experts and see how you can scale support, cut costs, and boost customer satisfaction across every channel.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-start my-2 text-gray-200 mb-8">
                            What You’ll Get in Your Session:
                        </motion.p>
                        <div>
                            <ul className="space-y-1 text-gray-300">
                                {[
                                    "Audit of your current support stack (voice, chat, email, and more)",
                                    "Custom AI adoption roadmap tailored to your industry",
                                    "Benchmarks & case studies from companies like yours",
                                    "ROI calculator preview so you can see cost savings instantly",
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
                    </div>
                    <div className='flex-1 w-full'>
                        <form action="" className='w-full my-8 backdrop-blur-3xl bg-gradient-to-tl from-neonPurple/20 to-electricBlue/20 rounded-3xl p-4 sm:py-12 border-hidden space-y-4'>
                            <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 animate-gradient shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                            <h1 className="pb-2 text-lg font-medium text-white font-montserrat">Our AI delivers the most impact for businesses managing high-volume customer interactions (300,000+ per year).</h1>
                            <div className='flex space-x-2'>
                                <input type="text" placeholder="Business Email*" className="w-full bg-deepBlue/60 border border-electricBlue/30 
             text-white placeholder-gray-400 px-4 py-3 rounded-xl 
             focus:outline-none focus:ring-2 focus:ring-aquaGlow focus:border-aquaGlow
             transition-all duration-300" />
                                <input type="email" placeholder="Company name*" className="w-full bg-deepBlue/60 border border-electricBlue/30 
             text-white placeholder-gray-400 px-4 py-3 rounded-xl 
             focus:outline-none focus:ring-2 focus:ring-aquaGlow focus:border-aquaGlow
             transition-all duration-300" />
                            </div>

                            <input type="text" placeholder="Industry*" className="w-full bg-deepBlue/60 border border-electricBlue/30 
             text-white placeholder-gray-400 px-4 py-3 rounded-xl 
             focus:outline-none focus:ring-2 focus:ring-aquaGlow focus:border-aquaGlow
             transition-all duration-300" />
                            <input type="text" placeholder="Number of support agents*" className="w-full bg-deepBlue/60 border border-electricBlue/30 
             text-white placeholder-gray-400 px-4 py-3 rounded-xl 
             focus:outline-none focus:ring-2 focus:ring-aquaGlow focus:border-aquaGlow
             transition-all duration-300" />
                            <p className="text-gray-400 text-sm">By clicking submit, you acknowledge our Privacy Policy and agree to receive email communications from us. You can unsubscribe at any time.</p>
                            <button className=" bg-blue-500 hover:bg-aquaGlow hover:text-deepBlue text-white px-1 pl-4 py-1 rounded-full font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl">
                                Consult with an expert
                                <div className="flex items-center justify-center rounded-full bg-deepBlue p-2 transition-colors duration-200">
                                    <ArrowUpRight className="w-4 h-4 text-white group-hover:text-white" />
                                </div>
                            </button>
                        </form>
                    </div>
                </div>

            </section>
            <section id='stats' className='w-full py-8 flex justify-center px-8'>
                <div className='w-full flex flex-col space-y-5 lg:flex-row max-w-5xl items-center justify-center'>
                    {/* <div className=''>
                        <h1 className='text-gray-300 font-montserrat'>
                            Stats in Action
                        </h1>
                        <h1 className='text-3xl font-bold font-poppins text-aquaGlow'>
                            Trusted. Scalable. Proven.
                        </h1>
                        <p className='font-montserrat lg:max-w-lg'>
                            CoreComm is powering smarter conversations across industries, delivering measurable impact every day.
                        </p>
                    </div> */}
                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={cardVariants}
                                className="flex aspect-square bg-gradient-to-br from-electricBlue to-neonPurple 
          rounded-2xl flex-col items-center justify-center text-center 
          shadow-xl"
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
                                    {stat.suffix}
                                </h1>
                                <p className="text-sm text-gray-200">{stat.text}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
            <Footer />
        </div>
    )
}

export default DemoPage