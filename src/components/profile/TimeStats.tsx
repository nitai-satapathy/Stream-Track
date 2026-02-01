"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock } from "lucide-react";
import type { Movie } from "@/lib/types";

interface TimeStatsProps {
    watchedMovies: Movie[];
    watchedShows: Movie[];
}

const formatTime = (totalMinutes: number) => {
    const years = Math.floor(totalMinutes / 525600);
    const remainingAfterYears = totalMinutes % 525600;

    const months = Math.floor(remainingAfterYears / 43200);
    const remainingAfterMonths = remainingAfterYears % 43200;

    const days = Math.floor(remainingAfterMonths / 1440);
    const remainingAfterDays = remainingAfterMonths % 1440;

    const hours = Math.floor(remainingAfterDays / 60);

    return { years, months, days, hours };
};

export function TimeStats({ watchedMovies, watchedShows }: TimeStatsProps) {
    const [activeTab, setActiveTab] = React.useState<"movies" | "tv">("movies");

    const movieMinutes = React.useMemo(() => {
        return watchedMovies.reduce((acc, m) => {
            const duration = m.runtime && m.runtime > 0 ? m.runtime : 120;
            return acc + duration;
        }, 0);
    }, [watchedMovies]);

    const tvMinutes = React.useMemo(() => {
        return watchedShows.reduce((acc, s) => {
            // Calculate total runtime: episodes * runtime_per_episode
            // If data missing, assume: 10 eps * 45 mins = 450 mins
            let showDuration = 0;
            if (
                s.number_of_episodes &&
                s.number_of_episodes > 0 &&
                s.episode_run_time &&
                s.episode_run_time.length > 0
            ) {
                // Average episode runtime
                const avgRunTime = s.episode_run_time.reduce((a, b) => a + b, 0) / s.episode_run_time.length;
                showDuration = s.number_of_episodes * avgRunTime;
            } else if (s.number_of_episodes && s.number_of_episodes > 0) {
                // Fallback: 45 min per episode
                showDuration = s.number_of_episodes * 45;
            } else {
                // Absolute fallback for a "show": 450 min (approx 1 short season)
                showDuration = 450;
            }
            return acc + showDuration;
        }, 0);
    }, [watchedShows]);

    const currentMinutes = activeTab === "movies" ? movieMinutes : tvMinutes;
    const stats = formatTime(currentMinutes);

    return (
        <Card className="col-span-1 flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Time &quot;Lost&quot;
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <Tabs
                    defaultValue="movies"
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as "movies" | "tv")}
                    className="w-full"
                >
                    <TabsList className="mb-6 w-full grid grid-cols-2">
                        <TabsTrigger value="movies">Movies</TabsTrigger>
                        <TabsTrigger value="tv">TV Shows</TabsTrigger>
                    </TabsList>

                    <div className="flex flex-col items-center justify-center space-y-6 py-4">
                        <div className="grid grid-cols-4 gap-4 w-full">
                            <StatBox value={stats.years} label="Years" />
                            <StatBox value={stats.months} label="Months" />
                            <StatBox value={stats.days} label="Days" />
                            <StatBox value={stats.hours} label="Hours" />
                        </div>

                        <div className="text-center text-sm text-muted-foreground mt-4 px-4">
                            {activeTab === "movies" ? (
                                <p>
                                    Total time spent watching <span className="font-bold text-foreground">{watchedMovies.length}</span> movies.
                                    {!watchedMovies.some(m => m.runtime) && (
                                        <span className="block text-xs mt-1 italic text-yellow-500/80">
                                            *Some runtimes missing, estimates used.
                                        </span>
                                    )}
                                </p>
                            ) : (
                                <p>
                                    Total time spent watching <span className="font-bold text-foreground">{watchedShows.length}</span> shows.
                                </p>
                            )}
                        </div>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function StatBox({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-lg border border-border/50">
            <span className="text-3xl md:text-4xl font-black text-primary tabular-nums">
                {value}
            </span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {label}
            </span>
        </div>
    );
}
