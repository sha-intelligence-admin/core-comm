// @/components/home/ScalingCard.tsx
import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { motion, useScroll, useTransform } from "framer-motion";

interface Card {
    ceoComment: ReactNode;
    headline: ReactNode;
    id: string;
    title: string;
    content: string;
    ceoAvatar: string;
    link: string;
}

interface ScalingCardProps {
    card: Card;
    index: number;
}

const ScalingCard: React.FC<ScalingCardProps> = ({ card, index }) => {
    const ref = useRef<HTMLLIElement>(null);
    const videoRefMobile = useRef<HTMLVideoElement>(null);
    const videoRefDesktop = useRef<HTMLVideoElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["0.2 1", "0.8 0"],
    });

    const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1.05]);
    const [paddingTop, setPaddingTop] = useState("1em");

    useEffect(() => {
        if (window.innerWidth >= 1024) {
            setPaddingTop(`calc(${index + 1} * 2em)`);
        }
    }, [index]);

    // Video play/pause observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    videoRefMobile.current?.play();
                    videoRefDesktop.current?.play();
                } else {
                    videoRefMobile.current?.pause();
                    videoRefDesktop.current?.pause();
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, []);

    return (
        <motion.li
            ref={ref}
            id={card.id}
            className="sm:sticky sm:top-20"
            style={{ paddingTop, scale }}
        >
            {/* Mobile View */}
            <div className="mt-4 relative lg:hidden flex-col box-border rounded-3xl h-auto max-h-[80vh] flex justify-between items-start transition-all duration-500 bg-gradient-to-tr from-[#0A2434] via-[#112341] to-[#1A2140] animate-gradient">
                <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />
                <div className="h-[40%] w-full overflow-hidden">
                    <video
                        ref={videoRefMobile}
                        src="https://res.cloudinary.com/dn2tbatgr/video/upload/v1758031259/vecteezy_business-meetings-to-analyze-investment-strategies-and_48672877_vssl4y.mp4"
                        loop
                        muted
                        playsInline
                        preload='metadata'
                        className="w-full h-full object-cover rounded-t-3xl"
                    />
                </div>
                <div className='h-[60%] p-6 flex flex-col justify-between space-y-4'>
                    <h2 className="text-xl sm:text-2xl font-medium text-white font-montserrat">{card.title}</h2>
                    <p className="text-3xl font-bold text-electricBlue font-poppins">{card.headline}</p>
                    <p className="text-sm text-white">{card.content}</p>
                    <div className='w-full space-x-4 flex justify-end'>
                        <img src={card.ceoAvatar} alt="CEO Avatar" className='w-10 h-10 rounded-full' loading='lazy' />
                        <p className="text-xs text-white">{card.ceoComment}</p>
                    </div>
                </div>
            </div>

            {/* Desktop View */}
            <div className="relative hidden lg:flex box-border rounded-3xl h-[70vh] justify-between items-start transition-all duration-500 bg-gradient-to-tr from-[#0A2434] via-[#112341] to-[#1A2140] animate-gradient">
                <div className='absolute inset-0 rounded-3xl pointer-events-none border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' />

                <div className="w-[70%] h-full overflow-hidden">
                    <video
                        ref={videoRefDesktop}
                        src="https://res.cloudinary.com/dn2tbatgr/video/upload/v1758031259/vecteezy_business-meetings-to-analyze-investment-strategies-and_48672877_vssl4y.mp4"
                        loop
                        muted
                        playsInline
                        preload='metadata'
                        className="w-full h-full object-cover rounded-l-3xl"
                    />
                </div>
                <div className='w-[30%] p-6 flex flex-col h-full justify-between space-y-4'>
                    <h2 className="text-xl sm:text-2xl font-medium text-white font-montserrat">{card.title}</h2>
                    <p className="text-3xl font-bold text-electricBlue font-poppins">{card.headline}</p>
                    <p className="text-sm text-white">{card.content}</p>
                    <div className='pt-8 border-t border-white w-full space-x-4 flex justify-end'>
                        <img src={card.ceoAvatar} alt="CEO Avatar" className='w-10 h-10 rounded-full' loading='lazy' />
                        <p className="text-xs text-white">{card.ceoComment}</p>
                    </div>
                </div>
            </div>
        </motion.li>
    );
};

ScalingCard.displayName = 'ScalingCard';
export default React.memo(ScalingCard);