"use client";

import * as React from "react";
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Movie } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GenreChartProps {
    watchedMovies: Movie[];
    watchedShows: Movie[];
}

// TMDB Genre ID Map
const GENRE_MAP: Record<number, string> = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
    10759: "Action & Adventure",
    10762: "Kids",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics",
};

export function GenreChart({ watchedMovies, watchedShows }: GenreChartProps) {
    const [activeTab, setActiveTab] = React.useState<"movies" | "tv">("movies");
    const [hasAutoSwitched, setHasAutoSwitched] = React.useState(false);

    React.useEffect(() => {
        if (!hasAutoSwitched) {
            if (watchedMovies.length === 0 && watchedShows.length > 0) {
                setActiveTab("tv");
                setHasAutoSwitched(true);
            } else if (watchedMovies.length > 0) {
                setHasAutoSwitched(true);
            }
        }
    }, [watchedMovies.length, watchedShows.length, hasAutoSwitched]);

    const processData = (items: Movie[]) => {
        const genreCounts: Record<string, number> = {};

        items.forEach((item) => {
            let found = false;
            // Strategy 1: genre_ids (standard TMDB list)
            if (item.genre_ids && item.genre_ids.length > 0) {
                item.genre_ids.forEach((id) => {
                    const name = GENRE_MAP[Number(id)];
                    if (name) {
                        genreCounts[name] = (genreCounts[name] || 0) + 1;
                        found = true;
                    }
                });
            }

            // Strategy 2: genres array (full details)
            if (!found && item.genres && item.genres.length > 0) {
                item.genres.forEach((g) => {
                    const name = g.name;
                    if (name) {
                        genreCounts[name] = (genreCounts[name] || 0) + 1;
                        found = true;
                    }
                });
            }

            // Strategy 3: Legacy 'Genre' string (if present in some data sources)
            const legacyItem = item as Movie & { Genre?: string };
            if (!found && legacyItem.Genre && typeof legacyItem.Genre === 'string') {
                const genres = legacyItem.Genre.split(',').map(s => s.trim());
                genres.forEach(name => {
                    if (name) {
                        genreCounts[name] = (genreCounts[name] || 0) + 1;
                        found = true;
                    }
                });
            }
        });

        return Object.entries(genreCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8); // Top 8 genres for Radar readability
    };

    const movieData = React.useMemo(() => processData(watchedMovies), [watchedMovies]);
    const showData = React.useMemo(() => processData(watchedShows), [watchedShows]);

    const currentData = activeTab === "movies" ? movieData : showData;
    const currentCount = activeTab === "movies" ? watchedMovies.length : watchedShows.length;

    // Render check
    if (currentData.length === 0) {
        return (
            <Card className="col-span-1 min-h-[400px]">
                <CardHeader>
                    <CardTitle>Genre Distribution</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-[300px] items-center justify-center text-muted-foreground text-center p-4">
                    <p className="font-medium text-lg">No genre data available for {activeTab === "movies" ? "Movies" : "TV Shows"}</p>
                    <p className="text-sm mt-3 max-w-xs text-balance">
                        We found {currentCount} items, but could not determine their genres yet.
                        {currentCount > 0 && " The system is repairing this in the background. Refresh the page in a moment!"}
                    </p>
                    <div className="flex gap-2 mt-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab(activeTab === "movies" ? "tv" : "movies")}
                        >
                            View {activeTab === "movies" ? "TV Shows" : "Movies"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Genre Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <Tabs
                    defaultValue="movies"
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as "movies" | "tv")}
                    className="w-full"
                >
                    <TabsList className="mb-4 w-full grid grid-cols-2">
                        <TabsTrigger value="movies">Movies</TabsTrigger>
                        <TabsTrigger value="tv">TV Shows</TabsTrigger>
                    </TabsList>

                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={currentData}>
                                <PolarGrid stroke="hsl(var(--border))" />
                                <PolarAngleAxis
                                    dataKey="name"
                                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                />
                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="hsl(var(--border))" tick={false} axisLine={false} />
                                <Radar
                                    name={activeTab === "movies" ? "Movies" : "TV Shows"}
                                    dataKey="value"
                                    stroke="hsl(var(--primary))"
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.4}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        borderColor: "hsl(var(--border))",
                                        color: "hsl(var(--foreground))",
                                    }}
                                    itemStyle={{ color: "hsl(var(--foreground))" }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}
