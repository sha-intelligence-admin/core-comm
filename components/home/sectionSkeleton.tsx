// @/components/home/SectionSkeleton.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface SectionSkeletonProps {
    variant?: 'default' | 'card' | 'hero' | 'grid';
    className?: string;
}

const SectionSkeleton: React.FC<SectionSkeletonProps> = ({ 
    variant = 'default', 
    className = '' 
}) => {
    const baseClass = "animate-pulse bg-gray-800/50 rounded-3xl";
    
    switch (variant) {
        case 'hero':
            return (
                <div className={`relative w-full h-[600px] ${className}`}>
                    <div className={`${baseClass} w-full h-full`}>
                        <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
                            <div className="h-8 bg-gray-700 rounded w-3/4 max-w-2xl"></div>
                            <div className="h-6 bg-gray-700 rounded w-1/2 max-w-xl"></div>
                            <div className="flex space-x-4 mt-6">
                                <div className="h-12 bg-gray-700 rounded-full w-48"></div>
                                <div className="h-12 bg-gray-700 rounded-full w-36"></div>
                            </div>
                        </div>
                    </div>
                </div>
            );
            
        case 'card':
            return (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`${baseClass} p-6 ${className}`}
                >
                    <div className="space-y-3">
                        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                        <div className="h-10 bg-gray-700 rounded w-1/3 mt-4"></div>
                    </div>
                </motion.div>
            );
            
        case 'grid':
            return (
                <div className={`grid grid-cols-1 lg:grid-cols-6 gap-4 ${className}`}>
                    <div className={`${baseClass} lg:col-span-4 lg:row-span-1 h-64`}></div>
                    <div className={`${baseClass} lg:col-span-2 lg:row-span-2 h-96`}></div>
                    <div className={`${baseClass} lg:col-span-2 lg:row-span-2 h-96`}></div>
                    <div className={`${baseClass} lg:col-span-2 lg:row-span-1 h-32`}></div>
                    <div className={`${baseClass} lg:col-span-4 lg:row-span-1 h-64`}></div>
                </div>
            );
            
        default:
            return (
                <div className={`${baseClass} ${className}`}>
                    <div className="p-6 space-y-4">
                        <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            <div className="h-20 bg-gray-700 rounded"></div>
                            <div className="h-20 bg-gray-700 rounded"></div>
                            <div className="h-20 bg-gray-700 rounded"></div>
                        </div>
                    </div>
                </div>
            );
    }
};

export default React.memo(SectionSkeleton);