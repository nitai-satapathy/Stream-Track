"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Clapperboard, History, Sparkles } from "lucide-react";
import Atropos from "atropos/react";
import "atropos/css";

import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { getLists, updateUserLists } from "@/actions/user";
import type { Movie } from "@/lib/types";

// Define ListType locally as it's not exported from types
type ListType = "watchlist" | "watching" | "watched";

export default function AboutPage() {
    const { user } = useAuth();
    const [watchlist, setWatchlist] = useState<Movie[]>([]);
    const [watching, setWatching] = useState<Movie[]>([]);
    const [watched, setWatched] = useState<Movie[]>([]);

    useEffect(() => {
        const loadLists = async () => {
            if (user) {
                try {
                    const { watchlist, watching, watched } = await getLists(user.uid);
                    setWatchlist(watchlist || []);
                    setWatching(watching || []);
                    setWatched(watched || []);
                } catch (error) {
                    console.error("Failed to load lists:", error);
                }
            } else {
                // Clear lists if user logs out or load from local storage
                setWatchlist([]);
                setWatching([]);
                setWatched([]);
                const storedWatchlist = localStorage.getItem("watchlist");
                const storedWatching = localStorage.getItem("watching");
                const storedWatched = localStorage.getItem("watched");
                if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist));
                if (storedWatching) setWatching(JSON.parse(storedWatching));
                if (storedWatched) setWatched(JSON.parse(storedWatched));
            }
        };
        loadLists();
    }, [user]);

    const updateLocalStorage = (key: ListType, data: Movie[]) => {
        if (!user) {
            localStorage.setItem(key, JSON.stringify(data));
        }
    };

    const handleListUpdate = useCallback(async (movie: Movie, list: ListType) => {
        let newWatchlist = [...watchlist];
        let newWatching = [...watching];
        let newWatched = [...watched];

        const lists: Record<
            ListType,
            { state: Movie[]; setter: React.Dispatch<React.SetStateAction<Movie[]>> }
        > = {
            watchlist: { state: newWatchlist, setter: setWatchlist },
            watching: { state: newWatching, setter: setWatching },
            watched: { state: newWatched, setter: setWatched },
        };

        const otherLists = (Object.keys(lists) as ListType[]).filter(
            (l) => l !== list,
        );

        // Remove from other lists
        otherLists.forEach((listName) => {
            const updatedList = lists[listName].state.filter(
                (m) => m.id !== movie.id,
            );
            lists[listName].setter(updatedList);
            if (listName === "watchlist") newWatchlist = updatedList;
            if (listName === "watching") newWatching = updatedList;
            if (listName === "watched") newWatched = updatedList;
        });

        const targetList = lists[list];
        const movieIndex = targetList.state.findIndex((m) => m.id === movie.id);

        if (movieIndex > -1) {
            // Remove from target list if it's already there (toggle off)
            const updatedList = targetList.state.filter((m) => m.id !== movie.id);
            targetList.setter(updatedList);
            if (list === "watchlist") newWatchlist = updatedList;
            if (list === "watching") newWatching = updatedList;
            if (list === "watched") newWatched = updatedList;
        } else {
            // Add to target list
            const updatedList = [...targetList.state, movie];
            targetList.setter(updatedList);
            if (list === "watchlist") newWatchlist = updatedList;
            if (list === "watching") newWatching = updatedList;
            if (list === "watched") newWatched = updatedList;
        }

        if (user) {
            await updateUserLists(user.uid, {
                watchlist: newWatchlist,
                watching: newWatching,
                watched: newWatched,
            });
        } else {
            updateLocalStorage("watchlist", newWatchlist);
            updateLocalStorage("watching", newWatching);
            updateLocalStorage("watched", newWatched);
        }
    }, [watchlist, watching, watched, user]);

    const headerLists = useMemo(() => ({ watchlist, watching, watched }), [watchlist, watching, watched]);

    const features = [
        {
            icon: <Clapperboard className="h-10 w-10 text-primary" />,
            title: "Track Your Watchlist",
            description:
                "Keep track of movies and TV shows you want to watch. Never forget a title again.",
            color: "from-blue-500/20 to-cyan-500/20",
        },
        {
            icon: <History className="h-10 w-10 text-primary" />,
            title: "History & Statistics",
            description:
                "Log what you've watched and get insights into your viewing habits over time.",
            color: "from-purple-500/20 to-pink-500/20",
        },
        {
            icon: <Sparkles className="h-10 w-10 text-primary" />,
            title: "AI Recommendations",
            description:
                "Get personalized recommendations based on your unique taste using advanced AI.",
            color: "from-amber-500/20 to-orange-500/20",
        },
    ];

    const faqs = [
        {
            question: "Where does the content come from?",
            answer:
                "We source our movie and TV show data from reputable third-party databases (like TMDB) to ensure accurate and up-to-date information on cast, crew, release dates, and more.",
        },
        {
            question: "Do I need to create an account to use this site?",
            answer:
                "No, you can use Stream Track without an account. However, creating an account allows you to save your data across devices so that you can access from any device.",
        },
        {
            question: "Will my data be saved if I don't create an account?",
            answer:
                "Yes, if you choose not to create an account, your data will be saved locally in your browser's local storage. However, this means your data will only be accessible on the device and browser you used to add it.",
        },
        {
            question: "How do I make an account?",
            answer:
                "Simply click on the 'Sign Up' or 'Get Started' button on our homepage. You can create an account using your email address.",
        },
        {
            question: "Is Stream Track free to use?",
            answer:
                "Yes! Stream Track is completely free to use. You can track movies, shows, and get AI recommendations without any cost.",
        },
        {
            question: "Can I import my data from other platforms?",
            answer:
                "Currently, we don't support direct automated imports from other files, but you can easily add all your TV shows and movies by clicking the '+' icon in the header.",
        },
        {
            question: "How do I add a missing TV show or movie?",
            answer:
                "No—since we don't host content, we cannot add or change what's available. The content list is based on what's publicly accessible through the search mechanism.",
        },
        {
            question: "I can't find the movie/show I'm searching for!",
            answer:
                "Make sure you are typing the exact title. Sometimes slightly different spellings or localized titles can affect search results. Try searching for the main English title.",
        },
        {
            question: "Can I remove a film from my watched list?",
            answer:
                "Absolutely. You can manage your lists at any time by navigating to the specific page and updating its status.",
        },
        {
            question: "What about my data and stuff?",
            answer:
                "We take privacy seriously. Your data is used solely to provide you with the tracking and recommendation services. We do not sell your personal data to third parties.",
        },
        {
            question: "How should I use Stream Track?",
            answer:
                "Use it as your digital entertainment diary. Log what you've seen to keep a history, add things you want to see to your watchlist so you never forget them, and check your dashboard for stats on your viewing habits.",
        },
        {
            question: "Tips and tricks",
            answer:
                "Rate movies to improve your recommendations! The more you rate, the better our AI understands your genuine taste. Also, check your statistics page to see cool insights about your favorite genres.",
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pb-12">
            <Header lists={headerLists} onListUpdate={handleListUpdate} />
            {/* Hero Section */}
            <section className="relative py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
                <div className="container mx-auto text-center max-w-4xl relative z-10">
                    <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-500">
                        v1.0 is now live
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Track Your <span className="text-primary">Entertainment</span> Journey
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        Stream Track is the ultimate companion for movie and TV show
                        enthusiasts. Discover, track, and relive your favorite moments in cinema
                        and television.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                        <Button asChild size="lg" className="rounded-full text-lg px-8 h-12 shadow-lg hover:shadow-primary/25 transition-all">
                            <Link href="/signup">Get Started</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full text-lg px-8 h-12">
                            <Link href="/login">Log In</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 md:px-6 lg:px-8 container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {features.map((feature, index) => (
                        <div key={index} className="h-full">
                            <Atropos
                                className="h-full rounded-xl"
                                highlight={true}
                                shadow={true}
                                shadowScale={1.05}
                                onEnter={() => console.log('Enter')}
                                onLeave={() => console.log('Leave')}
                                onRotate={(x, y) => console.log('Rotate', x, y)}
                            >
                                <Card className={`h-full bg-gradient-to-br ${feature.color} border-border/50 backdrop-blur-sm hover:border-primary/50 transition-colors flex flex-col justify-center items-center text-center p-6`}
                                    data-atropos-offset="0">
                                    <div className="mb-6 p-4 bg-background/50 rounded-full w-fit shadow-lg" data-atropos-offset="5">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-2xl mb-3" data-atropos-offset="2">{feature.title}</CardTitle>
                                    <CardDescription className="text-base leading-relaxed max-w-xs mx-auto" data-atropos-offset="0">
                                        {feature.description}
                                    </CardDescription>
                                </Card>
                            </Atropos>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 px-4 md:px-6 lg:px-8 bg-muted/20">
                <div className="container mx-auto max-w-4xl">
                    <div className="space-y-8 text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
                            Why We Built Stream Track
                        </h2>
                        <div className="prose dark:prose-invert max-w-none text-xl text-muted-foreground leading-loose space-y-6 text-center md:text-left">
                            <p>
                                We know the struggle of endlessly scrolling through streaming services, trying to find something to watch. We wanted a single place where you could keep track of everything you’ve watched and everything you want to watch—no matter which platform it’s on.
                            </p>
                            <p>
                                Stream Track is a media tracking web application designed to help you organize TV shows and movies you are currently watching, have already completed, or plan to watch in the future.
                            </p>
                            <p>
                                We built Stream Track because many streaming platforms mix watched and unwatched content together, making it difficult to clearly see what you’ve already finished. With Stream Track, your viewing status is always clear, thanks to simple and well-defined categories that make managing your media effortless.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-4 md:px-6 lg:px-8 container mx-auto max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
                    Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4 bg-card/40 data-[state=open]:bg-card/80 transition-all duration-200">
                            <AccordionTrigger className="text-lg text-left font-medium py-4 hover:no-underline hover:text-primary transition-colors">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-4 text-center">
                <div className="container mx-auto relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-20 transform -translate-y-1/2 pointer-events-none" />
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 relative z-10">Ready to start tracking?</h2>
                    <Button asChild size="lg" className="px-10 py-8 text-xl rounded-full shadow-2xl hover:shadow-primary/50 transition-all relative z-10">
                        <Link href="/signup">Join Stream Track Now</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
