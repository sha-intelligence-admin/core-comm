// @/components/home/PageLoader.tsx
import React from 'react';
import { motion } from 'framer-motion';

const PageLoader: React.FC = () => {
    return (
        <div
            className="fixed inset-0 bg-deepBlue z-50 flex items-center justify-center"
        >
            {/* Background gradient animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-deepBlue via-electricBlue/10 to-neonPurple/10 animate-gradient" />
            
            {/* Main content */}
            <div className="relative z-10 text-center">
                {/* Logo with pulse animation */}
                {/* <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="mb-8"
                >
                    <img 
                        src="logo.png" 
                        alt="CoreComm Logo" 
                        className="w-20 h-20 mx-auto"
                        loading="eager"
                    />
                </motion.div> */}

                {/* Loading text */}
                {/* <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-2xl font-bold text-white mb-4 font-montserrat"
                >
                    CoreComm
                </motion.h1> */}

                {/* Loading dots */}
                <div className="flex justify-center space-x-1 mb-8">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                            }}
                            className="w-2 h-2 bg-aquaGlow rounded-full"
                        />
                    ))}
                </div>

                {/* Progress bar */}
                {/* <div className="w-64 mx-auto">
                    <div className="w-full bg-gray-700 rounded-full h-1">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 3, ease: "easeOut" }}
                            className="h-1 bg-gradient-to-r from-electricBlue to-aquaGlow rounded-full"
                        />
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-sm text-gray-400 mt-2 font-montserrat"
                    >
                        Preparing your experience...
                    </motion.p>
                </div> */}
            </div>

            {/* Floating particles */}
            {/* {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-aquaGlow/20 rounded-full"
                    style={{
                        left: `${20 + (i * 10)}%`,
                        top: `${20 + (i * 8)}%`,
                    }}
                    animate={{
                        y: [-20, 20, -20],
                        opacity: [0.2, 0.8, 0.2],
                    }}
                    transition={{
                        duration: 3 + (i * 0.5),
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))} */}
        </div>
    );
};

export default React.memo(PageLoader);