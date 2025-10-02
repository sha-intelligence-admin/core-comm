"use client";

import CountUp from '@/components/home/countUp';
import Footer from '@/components/home/Footer';
import Header from '@/components/home/header';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, Mail, Phone } from 'lucide-react'
import React from 'react'

const Contact = () => {
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
                            Let's Build the Future of Support Together.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-start text-gray-200 mb-8">
                            Ready to transform your customer experience with intelligent, secure AI? We're here to help you redefine what it means to be truly responsive.
                        </motion.p>
                    </div>
                    <div className='flex-1 w-full'>
                        <form action="" className='w-full my-8 backdrop-blur-3xl bg-gradient-to-tl from-neonPurple/20 to-electricBlue/20 rounded-3xl p-4 border-hidden space-y-4'>
                            <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 animate-gradient shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                            <h1 className="pb-2 text-lg font-medium text-white font-montserrat">Our AI delivers the most impact for businesses managing high-volume customer interactions (300,000+ per year).</h1>
                            <div className='flex space-x-2'>
                                <input type="text" placeholder="Name*" className="w-full bg-deepBlue/60 border border-electricBlue/30 
             text-white placeholder-gray-400 px-4 py-3 rounded-xl 
             focus:outline-none focus:ring-2 focus:ring-aquaGlow focus:border-aquaGlow
             transition-all duration-300" />
                                <input type="email" placeholder="Work Email*" className="w-full bg-deepBlue/60 border border-electricBlue/30 
             text-white placeholder-gray-400 px-4 py-3 rounded-xl 
             focus:outline-none focus:ring-2 focus:ring-aquaGlow focus:border-aquaGlow
             transition-all duration-300" />
                            </div>
                            <div className='flex space-x-2'>
                                <input type="text" placeholder="Company Name*" className="w-full bg-deepBlue/60 border border-electricBlue/30 
             text-white placeholder-gray-400 px-4 py-3 rounded-xl 
             focus:outline-none focus:ring-2 focus:ring-aquaGlow focus:border-aquaGlow
             transition-all duration-300" />
                                <input type="text" placeholder="Job Title*" className="w-full bg-deepBlue/60 border border-electricBlue/30 
             text-white placeholder-gray-400 px-4 py-3 rounded-xl 
             focus:outline-none focus:ring-2 focus:ring-aquaGlow focus:border-aquaGlow
             transition-all duration-300" />
                            </div>

                            <textarea placeholder="How can we help you?*" className="w-full bg-deepBlue/60 border border-electricBlue/30 
             text-white placeholder-gray-400 px-4 py-3 rounded-xl 
             focus:outline-none focus:ring-2 focus:ring-aquaGlow focus:border-aquaGlow
             transition-all duration-300 resize-none h-32" />
                            <p className="text-gray-400 text-sm">By clicking submit, you acknowledge our Privacy Policy and agree to receive email communications from us. You can unsubscribe at any time.</p>
                            <button className=" bg-blue-500 hover:bg-aquaGlow hover:text-deepBlue text-white px-1 pl-4 py-1 rounded-full font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl">
                                Send Us a Message
                                <div className="flex items-center justify-center rounded-full bg-deepBlue p-2 transition-colors duration-200">
                                    <ArrowUpRight className="w-4 h-4 text-white group-hover:text-white" />
                                </div>
                            </button>
                        </form>
                    </div>
                </div>

            </section>
            <div className='grid grid-cols-1 gap-12 max-w-7xl mx-auto px-4 py-8'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-3xl  text-center"
                >
                    <h2 className="text-3xl font-bold text-white mb-4">Speak to Sales</h2>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                        Our sales team is available 24/7 to assist you with any questions or issues
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-3xl  text-center"
                >
                    <h2 className="text-3xl font-bold text-white mb-4">General Inquiries</h2>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                        For questions about our services, partnerships, or other inquiries, reach out to our team.
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
                <div id='headquarters' className='w-full text-cen py-8 flex flex-col justify-center items-center px-8 max-w-7xl mx-auto'>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl font-medium font-montserrat text-start z-10">
                        Headquarters
                    </motion.h1>

                    <div className='mt-4 space-y-2'>
                        <p className=''>123 Innovation Drive, Suite 100<br />
                            Tech City, CA 94000<br />
                            United States</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Contact