"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Zap, Ghost, Tv, Film, Medal, Smile, Rocket } from "lucide-react";
import type { Movie } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BadgeSectionProps {
    watchedMovies: Movie[];
    watchedShows: Movie[];
}

const BADGES_CONFIG = [
    {
        id: "movie_buff",
        name: "Movie Buff",
        description: "Watched 50+ Movies",
        icon: Film,
        condition: (m: Movie[], t: Movie[]) => m.length >= 50,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    {
        id: "century_club",
        name: "Century Club",
        description: "Watched 100+ items total",
        icon: Medal,
        condition: (m: Movie[], t: Movie[]) => m.length + t.length >= 100,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
    },
    {
        id: "horror_fan",
        name: "Horror Fanatic",
        description: "Watched 10+ Horror movies",
        icon: Ghost,
        condition: (m: Movie[]) => m.filter(i => i.genre_ids?.includes(27)).length >= 10,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
    },
    {
        id: "binge_watcher",
        name: "Binge Watcher",
        description: "Watched 10+ TV Shows",
        icon: Tv,
        condition: (m: Movie[], t: Movie[]) => t.length >= 10,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
    },
    {
        id: "newbie",
        name: "Just Starting",
        description: "Added your first item",
        icon: Zap,
        condition: (m: Movie[], t: Movie[]) => m.length + t.length > 0 && m.length + t.length < 10,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
    },
    {
        id: "scifi_explorer",
        name: "Sci-Fi Explorer",
        description: "Watched 5+ Sci-Fi items",
        icon: Rocket,
        condition: (m: Movie[]) => m.filter(i => i.genre_ids?.includes(878)).length >= 5,
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/10",
    },
    {
        id: "action_hero",
        name: "Action Hero",
        description: "Watched 10+ Action items",
        icon: Award,
        condition: (m: Movie[]) => m.filter(i => i.genre_ids?.includes(28)).length >= 10,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
    },
    {
        id: "comedy_gold",
        name: "Comedy Central",
        description: "Watched 5+ Comedy items",
        icon: Smile,
        condition: (m: Movie[]) => m.filter(i => i.genre_ids?.includes(35)).length >= 5,
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/10",
    },
    {
        id: "marathon_runner",
        name: "Marathon Runner",
        description: "Watched 1000+ minutes",
        icon: Tv,
        condition: (m: Movie[]) => {
            const totalRuntime = m.reduce((acc, curr) => acc + (curr.runtime || 0), 0);
            return totalRuntime >= 1000;
        },
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
    },
    {
        id: "dedicated_fan",
        name: "Dedicated Fan",
        description: "20+ items in collection",
        icon: Medal,
        condition: (m: Movie[]) => m.length >= 20,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
    },
];

export function BadgeSection({ watchedMovies, watchedShows }: BadgeSectionProps) {
    const unlockedBadges = BADGES_CONFIG.filter((badge) =>
        badge.condition(watchedMovies, watchedShows)
    );

    if (unlockedBadges.length === 0) return null;

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Achievements
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4">
                    {unlockedBadges.map((badge) => (
                        <TooltipProvider key={badge.id}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-lg border border-border/50 ${badge.bgColor} hover:scale-105 transition-transform cursor-default`}>
                                        <badge.icon className={`w-8 h-8 mb-2 ${badge.color}`} />
                                        <span className="text-xs font-bold text-center px-1 leading-tight">{badge.name}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{badge.description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
