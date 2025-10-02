"use client";
import Footer from '@/components/home/Footer';
import Header from '@/components/home/header';
import PageLoader from '@/components/home/PageLoader';
import { usePageLoading } from '@/hooks/usePageLoading';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, CheckIcon } from 'lucide-react'
import React from 'react'

const PricingPage = () => {

    const { isLoading } = usePageLoading({
        minLoadingTime: 100,
        additionalDelay: 50
    });

    if (isLoading) {
        return (
            <PageLoader />
        );
    }

    return (
        <div className='bg-deepBlue'>
            <Header />
            <section id='pricing' className='w-full py-8 flex flex-col justify-center items-center px-4'>
                <div className='max-w-5xl w-full px-4'>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl font-medium font-montserrat text-center z-10 py-4">
                        Simple, Transparent Pricing
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center text-gray-300 mb-8">
                        Choose the plan that's right for your business.
                    </motion.p>
                    <div className='flex flex-col md:flex-row w-full max-w-5xl justify-center md:space-x-8'>
                        <motion.div
                            className='my-4 h-full flex-1 w-full backdrop-blur-3xl bg-gradient-to-tl from-neonPurple/20 to-electricBlue/20 rounded-3xl p-4 md:p-8 py-8 border-hidden shadow-2xl flex flex-col gap-4 justify-between'
                            initial={{
                                opacity: 0,
                            }}
                            viewport={{ once: true, amount: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1.05 }}
                            transition={{ duration: 1 }}
                        >
                            {/* Inner glow effect */}
                            <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 animate-gradient shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                            <div className='pb-2 w-full border-b border-white text-start items-start'>
                                <h1 className='font-medium text-lg'>Growth</h1>
                                <h1 className='font-bold text-xl'>$199/month</h1>
                            </div>
                            <p className='text-sm text-gray-300'>For scaling businesses, up to 5,000 calls.</p>
                            <div>
                                <ul className='space-y-2'>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Multi-Language Support</li>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> 24/7 AI Support</li>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Advanced Support</li>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Advanced Analytics</li>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Priority Customer Care</li>
                                </ul>
                            </div>
                            <button className='bg-electricBlue rounded-full text-sm py-2'>
                                Get Started
                            </button>
                        </motion.div>

                        <motion.div
                            className='my-4 h-full flex-1 w-full backdrop-blur-3xl bg-gradient-to-tl from-aquaGlow/20 to-electricBlue/20 animate-gradient rounded-3xl p-4 md:p-8 py-8 border-hidden shadow-2xl flex flex-col gap-4 justify-between'
                            initial={{
                                opacity: 0,
                            }}
                            viewport={{ once: true, amount: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1.05 }}
                            transition={{ duration: 1 }}
                        >
                            {/* Inner glow effect */}
                            <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                            <div className='pb-2 w-full border-b border-white text-start items-start'>
                                <h1 className='font-medium text-lg'>Growth</h1>
                                <h1 className='font-bold text-xl'>$199/month</h1>
                            </div>
                            <p className='text-sm text-gray-300'>For scaling businesses, up to 5,000 calls.</p>
                            <div>
                                <ul className='space-y-2'>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Multi-Language Support</li>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> 24/7 AI Support</li>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Advanced Support</li>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Advanced Analytics</li>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Priority Customer Care</li>
                                </ul>
                            </div>
                            <button className='bg-electricBlue rounded-full text-sm py-2'>
                                Get Started
                            </button>
                        </motion.div>

                        <motion.div
                            className='my-4 h-full flex-1 w-full backdrop-blur-3xl bg-gradient-to-tl from-neonPurple/20 to-electricBlue/20 animate-gradient rounded-3xl p-4 md:p-8 py-8 border-hidden shadow-2xl flex flex-col gap-4 justify-between'
                            initial={{
                                opacity: 0,
                            }}
                            viewport={{ once: true, amount: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1.05 }}
                            transition={{ duration: 1 }}
                        >
                            {/* Inner glow effect */}
                            <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                            <div className='pb-2 w-full border-b border-white text-start items-start'>
                                <h1 className='font-medium text-lg'>Growth</h1>
                                <h1 className='font-bold text-xl'>$199/month</h1>
                            </div>
                            <p className='text-sm text-gray-300'>For scaling businesses, up to 5,000 calls.</p>
                            <div>
                                <ul className='space-y-2'>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Multi-Language Support</li>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> 24/7 AI Support</li>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Advanced Support</li>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Advanced Analytics</li>
                                    <li className='flex text-sm'><CheckIcon className='text-aquaGlow size-4 pr-2' /> Priority Customer Care</li>
                                </ul>
                            </div>
                            <button className='bg-electricBlue rounded-full text-sm py-2'>
                                Get Started
                            </button>
                        </motion.div>
                    </div>

                    {/* Comparison Table */}
                    <motion.div
                        className='mt-16 w-full max-w-5xl'
                        initial={{ opacity: 0, y: 20 }}
                        viewport={{ once: true, amount: 0.3 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl font-medium font-montserrat text-center mb-8">
                            Compare Plans
                        </h2>
                        <div className='backdrop-blur-3xl overflow-x-auto'>
                            <table className='w-full text-white'>
                                <thead>
                                    <tr className='border-b border-white/20'>
                                        <th className='text-left py-4 px-4 font-medium'>Features</th>
                                        <th className='text-center py-4 px-4 font-medium'>Starter</th>
                                        <th className='text-center py-4 px-4 font-medium'>Growth</th>
                                        <th className='text-center py-4 px-4 font-medium'>Enterprise</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className='border-b border-white/10'>
                                        <td className='py-4 px-4 text-gray-300'>Monthly Calls</td>
                                        <td className='py-4 px-4 text-center'>1,000</td>
                                        <td className='py-4 px-4 text-center'>5,000</td>
                                        <td className='py-4 px-4 text-center'>Unlimited</td>
                                    </tr>
                                    <tr className='border-b border-white/10'>
                                        <td className='py-4 px-4 text-gray-300'>Multi-Language Support</td>
                                        <td className='py-4 px-4 text-center'><CheckIcon className='text-aquaGlow size-4 mx-auto' /></td>
                                        <td className='py-4 px-4 text-center'><CheckIcon className='text-aquaGlow size-4 mx-auto' /></td>
                                        <td className='py-4 px-4 text-center'><CheckIcon className='text-aquaGlow size-4 mx-auto' /></td>
                                    </tr>
                                    <tr className='border-b border-white/10'>
                                        <td className='py-4 px-4 text-gray-300'>24/7 AI Support</td>
                                        <td className='py-4 px-4 text-center'>—</td>
                                        <td className='py-4 px-4 text-center'><CheckIcon className='text-aquaGlow size-4 mx-auto' /></td>
                                        <td className='py-4 px-4 text-center'><CheckIcon className='text-aquaGlow size-4 mx-auto' /></td>
                                    </tr>
                                    <tr className='border-b border-white/10'>
                                        <td className='py-4 px-4 text-gray-300'>Advanced Analytics</td>
                                        <td className='py-4 px-4 text-center'>Basic</td>
                                        <td className='py-4 px-4 text-center'><CheckIcon className='text-aquaGlow size-4 mx-auto' /></td>
                                        <td className='py-4 px-4 text-center'><CheckIcon className='text-aquaGlow size-4 mx-auto' /></td>
                                    </tr>
                                    <tr className='border-b border-white/10'>
                                        <td className='py-4 px-4 text-gray-300'>Priority Customer Care</td>
                                        <td className='py-4 px-4 text-center'>—</td>
                                        <td className='py-4 px-4 text-center'><CheckIcon className='text-aquaGlow size-4 mx-auto' /></td>
                                        <td className='py-4 px-4 text-center'><CheckIcon className='text-aquaGlow size-4 mx-auto' /></td>
                                    </tr>
                                    <tr className='border-b border-white/10'>
                                        <td className='py-4 px-4 text-gray-300'>Custom Integrations</td>
                                        <td className='py-4 px-4 text-center'>—</td>
                                        <td className='py-4 px-4 text-center'>—</td>
                                        <td className='py-4 px-4 text-center'><CheckIcon className='text-aquaGlow size-4 mx-auto' /></td>
                                    </tr>
                                    <tr>
                                        <td className='py-4 px-4 text-gray-300'>Dedicated Account Manager</td>
                                        <td className='py-4 px-4 text-center'>—</td>
                                        <td className='py-4 px-4 text-center'>—</td>
                                        <td className='py-4 px-4 text-center'><CheckIcon className='text-aquaGlow size-4 mx-auto' /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </section>
            <Footer />
        </div>
    )
}

export default PricingPage