"use client";
import Footer from '@/components/home/Footer';
import Header from '@/components/home/header';
import IntegrationHero from '@/components/home/IntegrationHero';
import IntegrationSection from '@/components/home/IntegrationSection';
import PageLoader from '@/components/home/PageLoader';
import { usePageLoading } from '@/hooks/usePageLoading';
import { Description } from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowUpRightFromCircle } from 'lucide-react';
import Link from 'next/link';
import { title } from 'process';

import React, { useEffect, useRef, useState } from 'react'

const IntegrationCard = ({ item }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2 }}
            className='bg-gradient-to-br from-aquaGlow/10 via-electricBlue/10 to-neonPurple/10 p-4 rounded-xl shadow-md flex flex-col justify-between h-full'>
            <div className='flex space-x-4 mb-4 items-center'>
                <img src={item.logo} alt="" className='w-12 h-12' />
                <h3 className='text-lg font-semibold text-white'>{item.title}</h3>
            </div>
            <p className='text-gray-400 line-clamp-4'>{item.Description}</p>
            <div className='w-full flex justify-between items-center mt-4'>

                <Link href={`/documentation?section=integrations&integration=${item.title}`} className='hover:text-aquaGlow w-full flex justify-between bg-transparent border-0 shadow-none'>
                    <h1>Documentation</h1>
                    <ArrowUpRight />
                </Link>
            </div>
        </motion.div>
    );
}

const IntegrationPage = () => {

    const integrations = [
        { title: "Salesforce", logo: "salesforce.png", Description: "Salesforce is a cloud-based software company that provides customer relationship management (CRM) services and a suite of enterprise applications focused on customer service, marketing automation, analytics, and application development." },
        { title: "HubSpot", logo: "hubspot.png", Description: "HubSpot is a leading inbound marketing, sales, and service software that helps businesses grow by attracting, engaging, and delighting customers." },
        { title: "Zoho", logo: "zoho.png", Description: "Zoho is a cloud-based software suite that offers a range of applications for businesses, including CRM, project management, and collaboration tools." },
        { title: "Freshdesk", logo: "freshdesk.png", Description: "Freshdesk is a cloud-based customer support platform that helps businesses manage customer inquiries and support tickets." },
        { title: "Zendesk", logo: "zendesk.png", Description: "Zendesk is a cloud-based customer service platform that provides businesses with tools to manage customer interactions and support tickets." },
        { title: "API", logo: "api.png", Description: "API (Application Programming Interface) is a set of rules and protocols for building and interacting with software applications." },
        { title: "Webflow", logo: "webflow.png", Description: "Webflow is a web design tool, CMS, and hosting platform in one, allowing users to design, build, and launch responsive websites visually." },
        { title: "Asana", logo: "asana.png", Description: "Asana is a web-based project management tool that helps teams organize, track, and manage their work." },
    ];

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
            <section className='w-full py-8 flex flex-col lg:flex-row lg:space-x-8 justify-center items-center px-2'>
                <div className='w-full max-w-6xl flex flex-col lg:flex-row lg:space-x-8 justify-center items-center lg:text-start'>
                    <div className='max-w-5xl w-full px-4 lg:text-start'>
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl font-bold font-montserrat text-center z-10 py-4 mb-4 
    bg-gradient-to-br from-electricBlue to-neonPurple bg-clip-text text-transparent">
                            Seamless. One Click. Powerful Integrations.
                        </motion.h1>
                    </div>
                    <div className='max-w-5xl w-full'>
                        <IntegrationHero />
                    </div>
                </div>


            </section>
            <section className='w-full py-8 flex flex-col justify-center items-center px-2'>
                <div className='max-w-7xl w-full'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        {integrations.map((item, index) => (
                            <IntegrationCard key={index} item={item} />
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    )
}

export default IntegrationPage