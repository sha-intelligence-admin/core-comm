// @/components/home/IntegrationsHero.tsx
import React, { useRef, useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { Check } from 'lucide-react';

// Static data for integrations
const LOGOS = [
    { name: 'Salesforce', src: 'salesforce.png', style: 'top-[10%] left-[10%]' },
    { name: 'Zoho', src: 'zoho.png', style: 'top-[10%] right-[10%]' },
    { name: 'freshdesk', src: 'freshdesk.png', style: 'top-1/4 left-[5%]' },
    { name: 'hubspot', src: 'hubspot.png', style: 'top-1/4 right-[5%]' },
    { name: 'zendesk', src: 'zendesk.png', style: 'bottom-1/4 left-[5%]' },
    { name: 'API', src: 'api.png', style: 'bottom-1/4 right-[5%]' },
    { name: 'Webflow', src: 'https://placehold.co/100x100/F0F0F0/000000?text=Webflow', style: 'bottom-[10%] left-[10%]' },
    { name: 'Asana', src: 'https://placehold.co/100x100/F0F0F0/000000?text=Asana', style: 'bottom-[10%] right-[10%]' },
];

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.3, duration: 0.5 }
    }),
}

const SVG_PATHS = [
    // Top-left logos
    "M 500 250 C 400 150, 200 150, 150 100",
    "M 500 250 C 450 200, 250 150, 125 225",
    // Top-right logos
    "M 500 250 C 600 150, 800 150, 850 100",
    "M 500 250 C 550 200, 750 150, 875 225",
    // Bottom-left logos
    "M 500 250 C 450 300, 250 350, 125 275",
    "M 500 250 C 400 350, 200 350, 150 400",
    // Bottom-right logos
    "M 500 250 C 550 300, 750 350, 875 275",
    "M 500 250 C 600 350, 800 350, 850 400",
];

const IntegrationsHero: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.1,
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, []);

    const animateClass = isVisible ? 'animate-[dash-draw_2s_ease-out_forwards_running]' : '';
    const logoAnimateClass = isVisible ? 'animate-[pop-up-and-fade_0.8s_ease-out_forwards]' : '';

    return (
        <div

            className="lg:col-span-4 lg:row-span-1 relative"
        >
            <div className="bg-transparent flex flex-col lg:flex-row h-full justify-between items-center rounded-3xl p-6 text-start">
                <div ref={containerRef} className='flex-1 w-full flex-shrink-0 rounded-2xl'>
                    <div className="text-white items-start justify-start flex flex-col rounded-3xl text-center">
                        <style>
                            {`
                                @keyframes dash-draw {
                                    from {
                                        stroke-dashoffset: 1000;
                                    }
                                    to {
                                        stroke-dashoffset: 0;
                                    }
                                }
                                @keyframes pop-up-and-fade {
                                    0% {
                                        opacity: 0;
                                        transform: scale(0.5) translateY(20px);
                                    }
                                    100% {
                                        opacity: 1;
                                        transform: scale(1) translateY(0);
                                    }
                                }
                            `}
                        </style>
                        <div className="relative w-full h-[300px]">
                            {/* SVG for the connection lines */}
                            <svg
                                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                                viewBox="0 0 1000 500"
                                preserveAspectRatio="xMidYMid slice"
                            >
                                <defs>
                                    <radialGradient id="neonGradient" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#8A2BE2" />
                                        <stop offset="100%" stopColor="#8A2BE2" stopOpacity="0" />
                                    </radialGradient>
                                </defs>
                                {SVG_PATHS.map((d, index) => (
                                    <path
                                        key={index}
                                        d={d}
                                        stroke="url(#neonGradient)"
                                        strokeWidth="2"
                                        fill="none"
                                        strokeDasharray="1000"
                                        strokeDashoffset="1000"
                                        className={animateClass}
                                        style={{ animationDelay: `${0.8 + (index * 0.1)}s` }}
                                    />
                                ))}
                            </svg>

                            {/* Central Content Block */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center max-w-xl text-center">
                                <img src="logo.png" alt="Logo" className="mb-4 w-20" loading="lazy" />
                            </div>

                            {/* Logo elements arranged around the center */}
                            {LOGOS.map((logo, index) => (
                                <div
                                    key={index}
                                    className={`absolute p-2 flex items-center justify-center rounded-full border-gray-200 bg-white shadow-md opacity-0 ${logoAnimateClass} ${logo.style}`}
                                    style={{ animationDelay: `${1.5 + (index * 0.05)}s` }}
                                >
                                    <img src={logo.src} alt={logo.name} className="max-w-20 h-10 w-15" loading="lazy" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default React.memo(IntegrationsHero);