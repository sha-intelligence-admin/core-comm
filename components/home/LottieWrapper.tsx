// @/components/home/LottieWrapper.tsx
import React, { lazy, Suspense, useEffect, useState } from 'react';

const LottieComponent = lazy(() => import("lottie-react"));

// Animation loaders
const loadAnimationData = () => import("../../public/Clock_loop.json").catch(() => ({ default: null }));
const loadChartAnimation = () => import("../../public/line.json").catch(() => ({ default: null }));
const loadSecureAnimation = () => import('../../public/secure.json').catch(() => ({ default: null }));

interface LottieWrapperProps {
    animationType: 'clock' | 'chart' | 'secure';
    className: string;
    loop?: boolean;
}

const LottieWrapper: React.FC<LottieWrapperProps> = ({ 
    animationType, 
    className, 
    loop = true 
}) => {
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        let animationLoader;
        
        switch (animationType) {
            case 'clock':
                animationLoader = loadAnimationData;
                break;
            case 'chart':
                animationLoader = loadChartAnimation;
                break;
            case 'secure':
                animationLoader = loadSecureAnimation;
                break;
            default:
                console.warn(`Unknown animation type: ${animationType}`);
                return;
        }

        animationLoader()
            .then(data => {
                setAnimationData(data.default || data);
            })
            .catch(() => {
                console.warn(`Failed to load animation: ${animationType}`);
            });
    }, [animationType]);

    if (!animationData) {
        return <div className={`bg-gray-800 rounded animate-pulse ${className}`} />;
    }

    return (
        <Suspense fallback={<div className={`bg-gray-800 rounded animate-pulse ${className}`} />}>
            <LottieComponent
                animationData={animationData}
                loop={loop}
                className={className}
            />
        </Suspense>
    );
};

export default React.memo(LottieWrapper);