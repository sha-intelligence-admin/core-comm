import React, { lazy, Suspense, useState, useEffect, memo } from 'react';
import { motion } from "framer-motion";
import { Clock } from 'lucide-react';

const LottieComponent = lazy(() => import("lottie-react"));

// Optimized animation loaders
const loadAnimationData = () =>
    import("../../public/Clock_loop.json").catch(() => ({ default: null }));

const loadChartAnimation = () =>
    import("../../public/line.json").catch(() => ({ default: null }));

const loadSecureAnimation = () =>
    import("../../public/secure.json").catch(() => ({ default: null }));

// Optimized Lottie wrapper component
const LottieWrapper: React.FC<{
    animationLoader: () => Promise<any>;
    className: string;
    loop?: boolean;
}> = ({ animationLoader, className, loop = true }) => {
    const [animationData, setAnimationData] = useState(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    // Intersection observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        const element = document.getElementById(`lottie-${className}`);
        if (element) {
            observer.observe(element);
        }

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [className]);

    useEffect(() => {
        if (!shouldLoad) return;

        let isMounted = true;
        animationLoader().then(data => {
            if (isMounted && (data.default || data)) {
                setAnimationData(data.default || data);
            }
        }).catch(() => {
            // Handle loading errors gracefully
        });

        return () => {
            isMounted = false;
        };
    }, [shouldLoad, animationLoader]);

    if (!shouldLoad) {
        return (
            <div 
                id={`lottie-${className}`}
                className={`bg-gray-800/20 rounded animate-pulse ${className}`} 
            />
        );
    }

    if (!animationData) {
        return <div className={`bg-gray-800/50 rounded animate-pulse ${className}`} />;
    }

    return (
        <Suspense fallback={<div className={`bg-gray-800/50 rounded animate-pulse ${className}`} />}>
            <LottieComponent
                animationData={animationData}
                loop={loop}
                className={className}
                renderer="svg"
            />
        </Suspense>
    );
};

const AnimationSection: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 24/7 Availability Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                viewport={{ once: true, amount: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className='relative h-[40vh] md:col-span-1 md:row-span-1 rounded-3xl backdrop-blur-sm bg-gradient-to-tl from-neonPurple/15 via-electricBlue/15 to-aquaGlow/15 p-6 flex flex-col justify-end items-start text-start overflow-hidden'
            >
                <div className="absolute inset-0 rounded-3xl pointer-events-none border border-white/10" />
                
                {/* Animation Background */}
                <div className="absolute top-4 right-4 pointer-events-none">
                    <LottieWrapper 
                        animationLoader={loadAnimationData} 
                        loop={true} 
                        className="w-20 h-20 sm:w-24 sm:h-24 opacity-70" 
                    />
                </div>

                {/* Content */}
                <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-white mb-2">Always Available — 24/7</h3>
                    <p className="text-sm text-gray-200">
                        Never miss a customer call again. CoreComm ensures your business is always open, 
                        even on weekends and holidays.
                    </p>
                </div>
            </motion.div>

            {/* Human-Like Conversations Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                viewport={{ once: true, amount: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className='relative h-[40vh] md:col-span-2 md:row-span-1 rounded-3xl backdrop-blur-sm bg-gradient-to-tl from-neonPurple/15 via-electricBlue/15 to-aquaGlow/15 p-6 flex flex-col justify-end items-start text-start overflow-hidden'
            >
                <div className="absolute inset-0 rounded-3xl pointer-events-none border border-white/10" />
                
                {/* Conversation Bubbles Background */}
                <div className="absolute inset-0 flex flex-col justify-center items-end p-6 space-y-3 pointer-events-none opacity-30">
                    <div className='max-w-[70%] bg-gradient-to-tr from-neonPurple/30 via-electricBlue/30 to-aquaGlow/30 rounded-2xl p-4 text-sm text-white'>
                        Hi there! How can I assist you today?
                    </div>
                    <div className='max-w-[70%] self-start bg-gradient-to-tr from-aquaGlow/30 via-electricBlue/30 to-neonPurple/30 rounded-2xl p-4 text-sm text-white'>
                        I have a question about my order.
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <div className='absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-electricBlue/20 to-aquaGlow/20 rounded-full blur-xl' />
                
                {/* Content */}
                <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-white mb-2">Human-Like Conversations</h3>
                    <p className="text-sm text-gray-200">
                        Engage customers in natural dialogue. Our AI understands context and responds 
                        like a human, creating seamless interactions.
                    </p>
                </div>
            </motion.div>

            {/* Cost Savings Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                viewport={{ once: true, amount: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative h-[40vh] md:col-span-2 md:row-span-1 rounded-3xl backdrop-blur-sm bg-gradient-to-tl from-neonPurple/15 via-electricBlue/15 to-aquaGlow/15 p-6 flex flex-col justify-end items-start text-start overflow-hidden"
            >
                <div className="absolute inset-0 rounded-3xl pointer-events-none border border-white/10" />
                
                {/* Animation Background */}
                <div className="absolute top-0 right-0 w-full h-full flex justify-end items-center pointer-events-none opacity-60">
                    <LottieWrapper 
                        animationLoader={loadChartAnimation} 
                        loop={true} 
                        className="w-[80%] h-[80%]" 
                    />
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-white mb-2">Cut Costs, Not Quality</h3>
                    <p className="text-sm text-gray-200">
                        Save up to 60% on call center operations while improving customer satisfaction scores. 
                        CoreComm delivers enterprise-quality service at a fraction of the cost.
                    </p>
                </div>
            </motion.div>

            {/* Security Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                viewport={{ once: true, amount: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className='relative h-[40vh] md:col-span-1 md:row-span-1 rounded-3xl backdrop-blur-sm bg-gradient-to-tl from-neonPurple/15 via-electricBlue/15 to-aquaGlow/15 p-6 flex flex-col justify-end items-start text-start overflow-hidden'
            >
                <div className="absolute inset-0 rounded-3xl pointer-events-none border border-white/10" />
                
                {/* Animation Background */}
                <div className="absolute top-4 right-4 pointer-events-none opacity-70">
                    <LottieWrapper 
                        animationLoader={loadSecureAnimation} 
                        loop={true} 
                        className="w-20 h-20 sm:w-24 sm:h-24" 
                    />
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-white mb-2">Enterprise-Grade Security</h3>
                    <p className="text-sm text-gray-200">
                        Protect your data with industry-leading security measures. GDPR, HIPAA, and SOC2 compliant.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default memo(AnimationSection);