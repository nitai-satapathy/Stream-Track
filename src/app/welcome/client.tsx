"use client";

import { motion, AnimatePresence, useAnimationFrame, useInView } from "framer-motion";
import { useEffect, useState, useRef, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import type { Movie } from "@/lib/types";
import Atropos from "atropos/react";
import "atropos/css";
import Preloader from "@/components/ui/Preloader";

interface WelcomeClientProps {
    carouselMovies: Movie[];
    trendingDay: Movie[];
    bentoWatchlist: Movie[];
    bentoTv: Movie[];
}

function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full min-h-screen"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

function CurvedCarousel({ initialMovies }: { initialMovies: Movie[] }) {
    const movies = initialMovies;
    const [scrollX, setScrollX] = useState(0);
    const [windowWidth, setWindowWidth] = useState(1200);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useAnimationFrame((t, delta) => {
        if (!isMounted) return;
        setScrollX((prev) => prev - (delta * 0.04));
    });

    const isMobile = windowWidth < 640;
    const isTablet = windowWidth >= 640 && windowWidth < 768;
    const ITEM_WIDTH = isMobile ? 150 : isTablet ? 210 : 260;
    const TOTAL_ITEMS = movies.length;

    if (!isMounted || TOTAL_ITEMS === 0) return <div className="h-[250px] sm:h-[300px] md:h-[400px]"></div>;

    const TOTAL_WIDTH = TOTAL_ITEMS * ITEM_WIDTH;
    const minX = -TOTAL_WIDTH / 2;
    const maxX = TOTAL_WIDTH / 2;

    const wrap = (value: number, min: number, max: number) => {
        const range = max - min;
        return ((((value - min) % range) + range) % range) + min;
    };

    return (
        <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] flex items-end justify-center pb-12 sm:pb-16 pt-10 pointer-events-none">
            <div className="relative w-full h-full flex items-end justify-center pointer-events-none">
                {movies.map((movie, i) => {
                    const x = wrap(i * ITEM_WIDTH + scrollX, minX, maxX);
                    const distanceFromCenter = x / ITEM_WIDTH;
                    const rotateAmount = distanceFromCenter * 8;
                    const dropAmount = Math.pow(Math.abs(distanceFromCenter), 1.6) * (isMobile ? 12 : 15);
                    const opacity = Math.max(0, 1 - Math.abs(distanceFromCenter) * (isMobile ? 0.25 : 0.15));

                    return (
                        <motion.div
                            key={`${movie.id}-${i}`}
                            className="absolute bottom-[-10px] sm:bottom-0 w-[120px] h-[180px] sm:w-[180px] sm:h-[260px] md:w-[240px] md:h-[360px] flex-shrink-0 pointer-events-auto"
                            style={{
                                transformOrigin: "bottom center",
                                x: x,
                                y: dropAmount,
                                rotate: rotateAmount,
                                opacity: opacity,
                                zIndex: Math.round(100 - Math.abs(distanceFromCenter)),
                            }}
                            whileHover={{ scale: 1.05, y: dropAmount - 20, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center rounded-xl md:rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden"
                                style={{
                                    backgroundImage: movie.poster_path ? `url(https://image.tmdb.org/t/p/w500${movie.poster_path})` : "none",
                                    backgroundColor: "#111"
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

function AIFeatureSection({ movies }: { movies: Movie[] }) {
    const [isGenerating, setIsGenerating] = useState(true);
    const [currentMovieIndex, setCurrentMovieIndex] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isGenerating && movies.length > 0) {
            interval = setInterval(() => {
                setCurrentMovieIndex(Math.floor(Math.random() * movies.length));
            }, 100);

            setTimeout(() => {
                setIsGenerating(false);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isGenerating, movies]);

    useEffect(() => {
        if (!isGenerating) {
            const restart = setTimeout(() => setIsGenerating(true), 6000);
            return () => clearTimeout(restart);
        }
    }, [isGenerating]);

    const activeMovie = movies[currentMovieIndex];

    return (
        <div id="ai-magic" className="w-full py-8 md:py-16 px-4 md:px-12 lg:px-24 relative z-10 overflow-hidden perspective-1000">
            <div className="absolute top-1/2 left-1/4 w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none -translate-y-1/2" />
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-semibold tracking-widest uppercase text-purple-300 mb-6 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>
                            Stream Track Magic
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-normal text-white mb-6 leading-tight">
                            Your <motion.span
                                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                transition={{ duration: 5, ease: "linear", repeat: Infinity }}
                                style={{ backgroundSize: "200% auto" }}
                                className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-400 pr-2"
                            >
                                AI-Powered
                            </motion.span> Cinema Concierge.
                        </h2>
                        <p className="text-white/50 text-base md:text-lg leading-relaxed mb-6 max-w-md">
                            Stop endlessly scrolling trying to find what to watch. Our recommendation engine analyzes your unique tastes, tracking history, and ratings to curate the perfect watchlist just for you.
                        </p>
                        <ul className="space-y-3 mb-6">
                            {[
                                "Learns from your 'Watched' history.",
                                "Discovers hidden gems you'll love.",
                                "Instant, hyper-personalized matching."
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-white/70">
                                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 ">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                    </div>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="relative flex items-center justify-center h-[500px]">
                        <div className={`absolute inset-0 rounded-full border border-purple-500/20 transition-all duration-1000 flex items-center justify-center pointer-events-none ${isGenerating ? 'animate-[spin_4s_linear_infinite] scale-100 opacity-50' : 'scale-[1.2] opacity-0'}`}>
                            <div className="w-4 h-4 rounded-full bg-purple-500 absolute -top-2 blur-[2px]" />
                        </div>
                        <div className={`absolute inset-12 rounded-full border border-indigo-500/20 transition-all duration-1000 flex items-center justify-center pointer-events-none ${isGenerating ? 'animate-[spin_3s_linear_infinite_reverse] scale-100 opacity-50' : 'scale-[1.1] opacity-0'}`}>
                            <div className="w-3 h-3 rounded-full bg-indigo-500 absolute -bottom-1 blur-[1px]" />
                        </div>

                        <Atropos className="w-[240px] h-[360px] z-20" activeOffset={40} shadow={true} shadowScale={1.1} rotateXMax={15} rotateYMax={15} highlight={false}>
                            <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-[#111] border border-white/10 flex flex-col items-center justify-center" data-atropos-offset="-2">
                                {isGenerating && (
                                    <motion.div
                                        className="absolute left-0 right-0 h-1 bg-purple-500 shadow-[0_0_15px_#a855f7] z-30 opacity-70"
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                                        data-atropos-offset="5"
                                    />
                                )}
                                <motion.div animate={{ scale: isGenerating ? 1 : 1.05 }} transition={{ duration: 0.8 }} className="absolute inset-0" data-atropos-offset="0">
                                    {activeMovie && (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${activeMovie.poster_path}`}
                                            alt={activeMovie.title || activeMovie.name || "Movie Poster"}
                                            fill
                                            className={`object-cover transition-opacity duration-300 ${isGenerating ? 'opacity-40 blur-[2px] grayscale' : 'opacity-100 blur-0 grayscale-0'}`}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/20 to-transparent" />
                                </motion.div>
                                <div className="absolute bottom-6 w-full px-6 flex flex-col items-center text-center z-40" data-atropos-offset="8">
                                    {isGenerating ? (
                                        <div className="bg-black/80 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 flex items-center gap-3">
                                            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-xs font-semibold tracking-wider text-white/90">ANALYZING TASTES...</span>
                                        </div>
                                    ) : (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col items-center">
                                            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full px-5 py-2 mb-2 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                                                <span className="text-xs font-bold tracking-wider text-white">99% MATCH</span>
                                            </div>
                                            <p className="text-xs text-white/90 font-medium tracking-wide drop-shadow-md bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">Based on your preferences</p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </Atropos>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function InteractiveSearchDemo() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Movie[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const { searchMulti } = await import('@/lib/tmdb');
                    const data = await searchMulti(query);
                    setResults(data.slice(0, 3));
                } catch (error) {
                    console.error("Search demo failed", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="w-full relative z-20">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for Batman, Interstellar..."
                    className="bg-transparent border-none outline-none text-white text-base sm:text-lg w-full placeholder:text-white/20 focus:ring-0"
                />
                {isSearching && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />}
            </div>

            <div className="space-y-4 flex-1 min-h-[200px]">
                {results.length > 0 ? (
                    results.map((item) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 items-center group cursor-pointer hover:bg-white/5 p-2 -ml-2 rounded-xl transition-colors">
                            <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-md bg-black flex-shrink-0 overflow-hidden shadow-md border border-white/5 relative">
                                {item.poster_path ? (
                                    <Image src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.title || item.name || ""} fill sizes="48px" className="object-cover group-hover:scale-105 transition-transform" />
                                ) : <div className="w-full h-full bg-white/5 relative"></div>}
                            </div>
                            <div className="flex-1 py-1">
                                <div className="text-base font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">{item.title || item.name}</div>
                                <div className="text-xs text-white/40 uppercase tracking-widest mt-1">{item.media_type === 'tv' ? 'TV Series' : 'Movie'} &bull; {(item.release_date || item.first_air_date || '').substring(0, 4)}</div>
                            </div>
                        </motion.div>
                    ))
                ) : query.length >= 2 && !isSearching ? (
                    <div className="text-sm text-white/40 text-center py-12">No results found for &quot;{query}&quot;</div>
                ) : (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4 opacity-20">
                            <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-md bg-white/10 flex-shrink-0" />
                            <div className="flex-1 space-y-3 py-2">
                                <div className="w-3/4 h-3 rounded bg-white/20" />
                                <div className="w-1/3 h-2 rounded bg-white/10" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function BentoFeatureSection({
    initialWatchlistItems,
    initialTvShows
}: {
    initialWatchlistItems: Movie[],
    initialTvShows: Movie[]
}) {
    const watchlistItems = initialWatchlistItems;
    const tvShows = initialTvShows;

    return (
        <div id="features" className="w-full py-16 md:py-24 px-4 md:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-16 lg:gap-24 relative">
                <div className="w-full lg:w-1/3 lg:sticky lg:top-40 z-10 self-start">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                        <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold tracking-widest uppercase text-white/70 mb-6">
                            Everything You Need
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-5xl font-playfair font-normal text-white mb-6 leading-tight">
                            Tracking is not a <br className="hidden lg:block" /><span className="italic text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 pr-2">chore</span> - it&apos;s an experience.
                        </h2>
                        <p className="text-white/50 text-sm sm:text-lg leading-relaxed">
                            We blend beautiful minimalism with powerful TMDB integration, comprehensive lists, and seamless tracking to meet your entertainment needs wherever you happen to be.
                        </p>
                    </motion.div>
                </div>

                <div className="w-full lg:w-2/3 space-y-24 lg:space-y-40">
                    <motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="bg-[#0a0a0a] rounded-[32px] p-6 sm:p-10 border border-white/10 shadow-2xl space-y-8 will-change-transform">
                        <div className="relative w-full h-48 sm:h-64 rounded-2xl bg-indigo-500/5 p-6 flex gap-4 overflow-hidden border border-indigo-500/10">
                            <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full" />
                            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />
                            {watchlistItems.length > 0 ? watchlistItems.map((item, i) => (
                                <div key={item.id} className="min-w-[100px] sm:min-w-[140px] h-full rounded-xl bg-black/50 border border-white/10 overflow-hidden flex-shrink-0 hover:-translate-y-2 transition-transform duration-500 shadow-xl relative" style={{ transitionDelay: `${i * 100}ms` }}>
                                    <Image src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} alt={item.title || item.name || "poster"} fill sizes="140px" className="object-cover opacity-90" />
                                </div>
                            )) : (
                                [1, 2, 3, 4].map(i => <div key={i} className="min-w-[100px] sm:min-w-[140px] h-full rounded-xl bg-white/5 animate-pulse flex-shrink-0" />)
                            )}
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-4">Beautiful Watchlists</h3>
                            <p className="text-white/50 text-lg leading-relaxed mb-6 max-w-lg">
                                Save movies and TV shows to watch later with a single click. Keep your future entertainment perfectly organized, highly visual, and always ready for movie night.
                            </p>
                            <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/70">Watchlists</div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="bg-[#0a0a0a] rounded-[32px] p-6 sm:p-10 border border-white/10 shadow-2xl space-y-8 will-change-transform">
                        <div className="relative w-full h-auto rounded-2xl bg-emerald-500/5 p-6 space-y-4 border border-emerald-500/10 overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full" />
                            {tvShows.length > 0 ? tvShows.map((show, idx) => (
                                <div key={show.id} className="relative z-10 p-4 rounded-xl bg-black/40 border border-white/10 flex items-center gap-5">
                                    <div className="w-10 h-14 sm:w-14 sm:h-20 rounded-lg overflow-hidden shadow-lg border border-white/5 relative">
                                        {show.poster_path && <Image src={`https://image.tmdb.org/t/p/w200${show.poster_path}`} alt={show.name || "poster"} fill sizes="56px" className="object-cover" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm sm:text-lg font-bold text-white line-clamp-1">{show.name}</span>
                                            <span className={`text-xs sm:text-sm font-semibold tracking-wider ${idx === 0 ? 'text-emerald-400' : 'text-white/40'}`}>S1 E3</span>
                                        </div>
                                        <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} whileInView={{ width: idx === 0 ? '75%' : '40%' }} transition={{ duration: 1, delay: 0.5 }} className={`h-full rounded-full ${idx === 0 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-white/20'}`} />
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                [1, 2].map(i => (
                                    <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center gap-5 animate-pulse">
                                        <div className="w-14 h-20 rounded-lg bg-white/10 flex-shrink-0" />
                                        <div className="flex-1 space-y-3"><div className="w-1/2 h-4 bg-white/20 rounded" /><div className="w-full h-2 bg-white/10 rounded-full" /></div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-4">Track Your Progress</h3>
                            <p className="text-white/50 text-lg leading-relaxed mb-6 max-w-lg">
                                Never forget which episode you left off on. Log seasons, rate individual episodes, and maintain a gorgeous visual history of everywhere your cinematic journey has taken you.
                            </p>
                            <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/70">TV Tracking</div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="bg-[#0a0a0a] rounded-[32px] p-6 sm:p-10 border border-white/10 shadow-2xl space-y-8 will-change-transform">
                        <div className="relative w-full rounded-2xl bg-blue-500/5 p-6 border border-blue-500/10 z-20">
                            <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full" />
                            <InteractiveSearchDemo />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-4">Blazing Fast Search</h3>
                            <p className="text-white/50 text-lg leading-relaxed mb-6 max-w-lg">
                                Try it right here in the demo. Type any movie or TV show to feel the immense speed of our <kbd className="px-2 py-1 mx-1 rounded-md bg-white/10 font-mono text-sm text-white/90 shadow-sm border border-white/20">Ctrl + K</kbd> global command palette that sits on top of every page.
                            </p>
                            <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/70">Discovery</div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="bg-[#0a0a0a] rounded-[32px] p-6 sm:p-10 border border-white/10 shadow-2xl space-y-8 will-change-transform">
                        <div className="relative w-full h-48 sm:h-64 rounded-2xl bg-rose-500/5 p-6 flex flex-col items-center justify-center border border-rose-500/10 overflow-hidden">
                            <div className="absolute inset-0 bg-rose-500/10 blur-[100px] rounded-full" />
                            <div className="relative z-10 w-24 h-24 rounded-full border-2 border-dashed border-rose-500/50 flex flex-col items-center justify-center mb-6 bg-rose-500/5">
                                <svg className="w-10 h-10 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <div className="relative z-10 text-white/40 font-semibold text-sm tracking-widest uppercase mb-2">Select Multiple to Import</div>
                            <motion.div className="absolute top-8 left-8 bg-emerald-500/10 text-emerald-400 text-sm font-medium px-4 py-2 rounded-full border border-emerald-500/20 backdrop-blur-sm shadow-xl z-20" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                                +142 Movies Synced
                            </motion.div>
                            <motion.div className="absolute bottom-8 right-8 bg-emerald-500/10 text-emerald-400 text-sm font-medium px-4 py-2 rounded-full border border-emerald-500/20 backdrop-blur-sm shadow-xl z-20" animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                                +56 Shows Migrated
                            </motion.div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-4">Migration Made Easy</h3>
                            <p className="text-white/50 text-lg leading-relaxed mb-6 max-w-lg">
                                Coming from Letterboxd or IMDB? Use our powerful <span className="text-rose-400 font-semibold">Bulk Add</span> tool to import your entire existing viewing history in seconds without breaking a sweat.
                            </p>
                            <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/70">Import</div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}

const steps = [
    {
        number: "01",
        title: "Search & Add",
        description: "Find any movie or TV show using our powerful TMDB-backed search and add it to your personalized watchlist.",
        icon: (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        )
    },
    {
        number: "02",
        title: "Watch & Log",
        description: "Track your progress, rate what you've seen, and keep a beautiful history of your cinematic journey.",
        icon: (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        )
    },
    {
        number: "03",
        title: "Discover Magic",
        description: "Let our AI engine analyze your tastes to serve up highly accurate recommendations for your next binge.",
        icon: (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        )
    }
];

function HowItWorksSection() {
    return (
        <div id="how-it-works" className="w-full py-12 md:py-20 px-4 md:px-12 lg:px-24 relative z-10 perspective-1000">
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-normal text-white mb-6 leading-tight">
                            How It <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 pr-2">Works</span>
                        </h2>
                        <p className="text-white/50 text-lg leading-relaxed">
                            A seamless three-step process to take control of your entertainment and never lose track of a show again.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
                    <div className="hidden md:block absolute top-[80px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0 pointer-events-none" />
                    {steps.map((step, index) => (
                        <motion.div key={step.number} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.15 }} className="relative z-10 w-full h-full will-change-transform">
                            <div className="flex flex-col items-center text-center group cursor-pointer w-full h-full p-6 sm:p-8 rounded-[32px] hover:bg-white/[0.03] border border-transparent hover:border-white/10 transition-transform hover:scale-[1.02] duration-500">
                                <div className="w-24 h-24 rounded-full bg-[#111] border border-white/10 flex items-center justify-center mb-8 relative shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:border-white/30 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                    <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                                    <div className="absolute -top-3 -right-3 text-sm font-bold text-white/20 font-playfair transition-colors duration-300 group-hover:text-white/40">{step.number}</div>
                                    {step.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 tracking-wide group-hover:text-blue-200 transition-colors">{step.title}</h3>
                                <p className="text-white/50 leading-relaxed max-w-[280px]">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatsSection() {
    return (
        <div className="w-full py-12 md:py-16 px-4 relative z-10 border-y border-white/5 bg-[#0a0a14]">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                    <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
                        <div className="text-4xl md:text-5xl font-playfair font-bold text-white mb-3">Infinite</div>
                        <div className="text-white/50 tracking-widest uppercase text-xs font-semibold">Movies & Shows</div>
                    </div>
                    <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
                        <div className="text-4xl md:text-5xl font-playfair font-bold text-white mb-3">Seamless</div>
                        <div className="text-white/50 tracking-widest uppercase text-xs font-semibold">Tracking Experience</div>
                    </div>
                    <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
                        <div className="text-4xl md:text-5xl font-playfair font-bold text-white mb-3">Tailored</div>
                        <div className="text-white/50 tracking-widest uppercase text-xs font-semibold">AI Recommendations</div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 bg-white/5">
                        <span className="text-white/40 text-sm">Powered by the massive database of</span>
                        <div className="flex items-center">
                            <div className="relative h-3 sm:h-4 w-12 sm:w-16 opacity-80">
                                <Image
                                    src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                                    alt="TMDB Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

const faqs = [
    { question: "How does Stream Track track what I watch?", answer: "Simply search for a movie or TV show, and click 'Watchlist', 'Watching', or 'Watched'. We organize it into your personalized tracking dashboard automatically." },
    { question: "Do I need technical skills to use Stream Track?", answer: "Not at all. Stream Track is designed to be as intuitive and seamless as possible. Browse, click, and track." },
    { question: "Can Stream Track recommend new movies for me?", answer: "Yes! Based on your tracking history and likes, we offer a dedicated Discovery tab to show you your next favorite story." },
    { question: "Is my tracking data secure?", answer: "Absolutely. Your watchlist data is securely tied to your Google authentication, keeping it private and accessible only to you across your devices." },
    { question: "Is Stream Track free to use?", answer: "Stream Track is completely free to use. Just login and begin your tracking journey." },
];

function FAQSection() {
    return (
        <div id="community" className="w-full py-16 md:py-24 px-4 md:px-12 lg:px-24 relative z-10">
            <div className="absolute top-0 right-[-20%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold tracking-widest uppercase text-white/70 mb-6">Help Center</div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair text-white mb-6">Your Personal <span className="italic font-normal text-purple-400">Tracking App</span></h2>
                    <p className="text-white/50 text-lg max-w-2xl mx-auto">Available 24/7, your tracker remembers your journey, understands your tastes, and organizes your entertainment life — from Sunday morning cartoons to late-night thrillers.</p>
                </motion.div>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <motion.details key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group bg-[#111118] border border-white/5 rounded-2xl p-6 cursor-pointer open:bg-[#151520] transition-colors">
                            <summary className="flex items-center justify-between text-white font-medium text-lg list-none focus:outline-none">
                                {faq.question}
                                <span className="text-white/40 group-open:rotate-45 transition-transform duration-300 text-2xl font-light">+</span>
                            </summary>
                            <p className="text-white/50 mt-4 leading-relaxed pr-12 animate-in fade-in slide-in-from-top-2 duration-300">{faq.answer}</p>
                        </motion.details>
                    ))}
                </div>
            </div>
        </div>
    );
}

function CTASection({ onNavigate }: { onNavigate?: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
    return (
        <div className="w-full py-16 md:py-24 px-4 relative z-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-r from-purple-600/20 to-indigo-600/20 blur-[120px] rounded-[100%] pointer-events-none" />
            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col items-center text-center p-12 md:p-20 rounded-[40px] bg-[#0c0c16] border border-white/10 shadow-2xl relative overflow-hidden will-change-transform">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                    <div className="inline-block px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-semibold tracking-widest uppercase text-purple-300 mb-6 shadow-[0_0_15px_rgba(168,85,247,0.15)]">100% Free. No Ads. No Paywalls.</div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-normal text-white mb-6 leading-tight">Ready to start <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 pr-3 pb-1">tracking?</span></h2>
                    <p className="text-white/50 text-lg md:text-md leading-relaxed mb-10 max-w-2xl mx-auto">Join Stream Track today. Stop searching, start discovering.<br /><br /><span className="text-white/80 font-medium">Start tracking immediately as a guest.</span> Your data will automatically sync when you create an account later.</p>
                    <Link href="/" onClick={onNavigate} className="inline-flex items-center justify-center bg-white text-black hover:bg-white/90 font-bold rounded-full px-10 py-5 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.25)] hover:scale-105 group">
                        <span>Start Your Journey</span>
                        <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}

export default function ClientWelcomePage({
    carouselMovies,
    trendingDay,
    bentoWatchlist,
    bentoTv
}: WelcomeClientProps) {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearRedirectTimeout = () => {
        if (redirectTimeoutRef.current) {
            clearTimeout(redirectTimeoutRef.current);
            redirectTimeoutRef.current = null;
        }
    };

    const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        if (isRedirecting) return;

        if (typeof window !== "undefined") {
            // Set a cookie that expires in 10 years (3650 days) so the server middleware can read it
            const secure = window.location.protocol === "https:" ? "; Secure" : "";
            document.cookie = `has_visited_welcome=true; path=/; max-age=315360000; SameSite=Lax${secure}`;
        }

        clearRedirectTimeout();
        setIsRedirecting(true);
    };

    // Fallback: if the preloader completion callback never fires, still navigate.
    useEffect(() => {
        if (!isRedirecting) return;

        redirectTimeoutRef.current = setTimeout(() => {
            router.push("/");
        }, 4000);

        return () => clearRedirectTimeout();
    }, [isRedirecting, router]);

    const handleRedirectComplete = () => {
        clearRedirectTimeout();
        router.push("/");
    };

    return (
        <PageTransition>
            <Preloader isRedirecting={isRedirecting} onComplete={isRedirecting ? handleRedirectComplete : undefined} />
            <div className="min-h-screen bg-[#070710] text-[#FAFAFA] selection:bg-purple-500/30 overflow-x-clip">
                <main className="relative w-full pt-12 sm:pt-24 pb-0">
                    <div id="journey" className="flex-none flex flex-col items-center justify-center text-center relative z-20 px-4 md:px-8 mt-4 sm:mt-0">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-center relative mb-4 sm:mb-8 md:mb-10">
                            <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tight leading-[1.05] mb-2 sm:mb-4 py-1">
                                <span className="pr-4 inline-block">Track What You</span> <br />
                                <span className="italic font-normal pr-3 inline-block">Watch.</span>
                            </h1>
                        </motion.div>
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-sm sm:text-base md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 md:mb-12 font-medium">
                            A haven for cinephiles and casual watchers alike. Track movies, log TV shows, and unlock personalized recommendations.
                        </motion.p>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                            <Link href="/" onClick={handleNavigate} className="inline-block bg-white hover:bg-white/90 text-black text-sm sm:text-base font-semibold rounded-full px-6 py-3 md:px-8 md:py-4 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:scale-105">
                                Begin your journey
                            </Link>
                        </motion.div>
                    </div>
                    <div className="w-full relative z-10 mt-12 md:mt-24 flex-none">
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#070710] to-transparent z-10 pointer-events-none" />
                        <CurvedCarousel initialMovies={carouselMovies} />
                    </div>
                </main>

                <AIFeatureSection movies={trendingDay} />
                <BentoFeatureSection initialWatchlistItems={bentoWatchlist} initialTvShows={bentoTv} />
                <HowItWorksSection />
                <StatsSection />
                <FAQSection />
                <CTASection onNavigate={handleNavigate} />
            </div>
        </PageTransition>
    );
}
