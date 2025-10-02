// @/hooks/usePageLoading.ts
import { useState, useEffect } from 'react';

interface UsePageLoadingOptions {
    minLoadingTime?: number; // Minimum time to show loader (in ms)
    imageUrls?: string[]; // Array of critical images to preload
    additionalDelay?: number; // Additional delay for UX
}

export const usePageLoading = ({
    minLoadingTime = 1500,
    imageUrls = [],
    additionalDelay = 500
}: UsePageLoadingOptions = {}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let mounted = true;
        const startTime = Date.now();

        // Function to complete loading
        const completeLoading = () => {
            if (!mounted) return;
            
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
            
            setTimeout(() => {
                if (mounted) {
                    setIsLoading(false);
                }
            }, remainingTime + additionalDelay);
        };

        // Simulate progress updates
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 200);

        // Preload critical images
        if (imageUrls.length > 0) {
            let loadedImages = 0;
            const totalImages = imageUrls.length;

            const imagePromises = imageUrls.map(url => {
                return new Promise<void>((resolve) => {
                    const img = new Image();
                    img.onload = img.onerror = () => {
                        loadedImages++;
                        setProgress(prev => Math.min(90, prev + (70 / totalImages)));
                        resolve();
                    };
                    img.src = url;
                });
            });

            Promise.all(imagePromises).then(() => {
                setProgress(100);
                completeLoading();
            });
        } else {
            // If no images to preload, just use timer
            setTimeout(() => {
                setProgress(100);
                completeLoading();
            }, minLoadingTime * 0.8);
        }

        // Cleanup
        return () => {
            mounted = false;
            clearInterval(progressInterval);
        };
    }, [minLoadingTime, imageUrls, additionalDelay]);

    return { isLoading, progress };
};