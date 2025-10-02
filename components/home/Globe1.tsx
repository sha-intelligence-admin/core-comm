// @/components/home/Globe.tsx
import React, { useEffect, useRef, useState } from 'react';
import createGlobe from "cobe";

interface GlobeProps {
    className?: string;
}

const Globe: React.FC<GlobeProps> = ({ className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [shouldRender, setShouldRender] = useState(false);

    // Intersection observer to only render when visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldRender(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        const currentCanvas = canvasRef.current;
        if (currentCanvas) {
            observer.observe(currentCanvas);
        }

        return () => {
            if (currentCanvas) {
                observer.unobserve(currentCanvas);
            }
        };
    }, []);

    // Globe rendering logic
    useEffect(() => {
        if (!shouldRender || !canvasRef.current) return;

        let phi = 0;
        let animationId: number;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 1,
            width: 300 * 2,
            height: 300 * 2,
            phi: 0,
            theta: 0,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 8000,
            mapBrightness: 4,
            baseColor: [0.10, 0.42, 0.98],     // Electric Blue
            markerColor: [0.54, 0.17, 0.89],  // Neon Purple 
            glowColor: [0.10, 0.42, 0.98],    // Electric Blue
            markers: [
                // San Francisco
                { location: [37.7595, -122.4367], size: 0.03 },
                // New York
                { location: [40.7128, -74.0060], size: 0.1 },
                // London
                { location: [51.5074, -0.1278], size: 0.07 },
                // Tokyo
                { location: [35.6895, 139.6917], size: 0.08 },
                // Lagos
                { location: [6.5244, 3.3792], size: 0.06 },
                // Istanbul
                { location: [41.0082, 28.9784], size: 0.05 },
                // São Paulo
                { location: [-23.5505, -46.6333], size: 0.07 },
                // Sydney
                { location: [-33.8688, 151.2093], size: 0.05 },
                // Cairo
                { location: [30.0444, 31.2357], size: 0.06 },
                // Paris
                { location: [48.8566, 2.3522], size: 0.05 }
            ],
            onRender: (state) => {
                state.phi = phi;
                phi += 0.005;
            },
        });

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            globe.destroy();
        };
    }, [shouldRender]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
            className={className}
        />
    );
};

Globe.displayName = 'Globe';
export default React.memo(Globe);