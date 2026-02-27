"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, useAnimation } from "framer-motion";

interface PreloaderProps {
    onComplete?: () => void;
    isRedirecting?: boolean;
}

const Preloader = ({ onComplete, isRedirecting = false }: PreloaderProps) => {
    const wrapperControls = useAnimation();
    const svgControls = useAnimation();
    const textControls = useAnimation();

    const greetings = useMemo(
        () => [
            "Hello", "Hola", "Bonjour", "안녕하세요", "Ciao", "Hallo", "こんにちは", "Hej", "नमस्ते", "你好",
        ],
        []
    );
    const [greetingIndex, setGreetingIndex] = useState(0);

    // Initial mount animation (lifting the curtain)
    useEffect(() => {
        const animateIn = async () => {
            if (isRedirecting) return; // Skip if we are in redirect mode

            const curve = "M0 502S175 272 500 272s500 230 500 230V0H0Z";
            const flat = "M0 2S175 1 500 1s500 1 500 1V0H0Z";

            // Show greetings for a moment
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Fade out text
            await textControls.start({
                opacity: 0,
                y: -50,
                transition: { duration: 0.5, ease: "easeInOut" },
            });

            // Morphing path animation (lifts up)
            await svgControls.start({
                d: curve,
                transition: { duration: 0.5, ease: "easeIn" },
            });

            await svgControls.start({
                d: flat,
                transition: { duration: 0.5, ease: "easeOut" },
            });

            // Hide preloader completely
            await wrapperControls.start({
                y: "-100vh",
                transition: { duration: 0.5, ease: "easeInOut" },
            });

            await wrapperControls.start({
                display: "none",
                transition: { duration: 0.1 },
            });

            if (onComplete) onComplete();
        };

        animateIn();
    }, [wrapperControls, svgControls, textControls, isRedirecting, onComplete]);

    // Redirect animation (dropping the curtain)
    useEffect(() => {
        const animateOut = async () => {
            if (!isRedirecting) return;

            // Make sure the wrapper is visible and reset at top
            await wrapperControls.start({
                display: "flex",
                y: 0,
                transition: { duration: 0 },
            });

            const curve = "M0 502S175 272 500 272s500 230 500 230V0H0Z";
            const full = "M0,1005S175,995,500,995s500,5,500,5V0H0Z";
            const flat = "M0 2S175 1 500 1s500 1 500 1V0H0Z";

            // Start flat
            await svgControls.start({
                d: flat,
                transition: { duration: 0 }
            });

            // Drop down morph
            await svgControls.start({
                d: curve,
                transition: { duration: 0.4, ease: "easeIn" },
            });

            await svgControls.start({
                d: full,
                transition: { duration: 0.4, ease: "easeOut" },
            });

            // Show text
            await textControls.start({
                opacity: 1,
                y: 0,
                transition: { duration: 0.3, ease: "easeInOut" },
            });

            if (onComplete) onComplete();
        };

        animateOut();
    }, [isRedirecting, wrapperControls, svgControls, textControls, onComplete]);

    // Handle greeting text cycling
    useEffect(() => {
        const intervalMs = 250;
        const id = window.setInterval(() => {
            setGreetingIndex((prev) => (prev + 1) % greetings.length);
        }, intervalMs);

        return () => window.clearInterval(id);
    }, [greetings.length]);

    const greeting = greetings[greetingIndex] ?? "Hello";

    return (
        <motion.div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-transparent pointer-events-none"
            animate={wrapperControls}
            initial={isRedirecting ? { display: "none" } : { y: 0 }}
            role="status"
            aria-live="polite"
        >
            <svg
                className="absolute top-0 w-full h-[120vh] pointer-events-auto"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
            >
                <motion.path
                    id="preloaderSvg"
                    d="M0,1005S175,995,500,995s500,5,500,5V0H0Z"
                    fill="#0a0a16ff"
                    animate={svgControls}
                    initial={isRedirecting ? { d: "M0 2S175 1 500 1s500 1 500 1V0H0Z" } : { d: "M0,1005S175,995,500,995s500,5,500,5V0H0Z" }}
                />
            </svg>
            <motion.div
                className="relative z-10 flex flex-col items-center justify-center text-white"
                animate={textControls}
                initial={isRedirecting ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
            >
                <div className="flex items-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-medium tracking-wider">
                    <span className="mr-3 text-white/50">•</span>
                    {String(greeting)
                        .split("")
                        .map((ch, idx) => (
                            <span
                                key={`${greetingIndex}-${idx}-${ch}`}
                                className="inline-block"
                                aria-hidden="true"
                            >
                                {ch}
                            </span>
                        ))}
                    <span className="sr-only">{greeting}</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Preloader;
