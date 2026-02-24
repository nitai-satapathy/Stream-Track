import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Movie } from "@/lib/types";

interface EpisodesTabProps {
    seasons: number[];
    selectedSeason: number;
    setSelectedSeason: (val: number) => void;
    currentSeasonEpisodes: any[];
    loadingEpisodes: boolean;
    userMovie?: Movie;
    onClearSeasonWatched: () => void;
    onMarkSeasonWatched: () => void;
    onEpisodeToggle: (seasonNum: number, episodeNum: number) => void;
}

export function EpisodesTab({
    seasons,
    selectedSeason,
    setSelectedSeason,
    currentSeasonEpisodes,
    loadingEpisodes,
    userMovie,
    onClearSeasonWatched,
    onMarkSeasonWatched,
    onEpisodeToggle,
}: EpisodesTabProps) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between gap-4">
                <Select
                    value={selectedSeason.toString()}
                    onValueChange={(val) => setSelectedSeason(parseInt(val))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Season" />
                    </SelectTrigger>
                    <SelectContent>
                        {seasons.map((s) => (
                            <SelectItem key={s} value={s.toString()}>
                                Season {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onClearSeasonWatched}
                        disabled={
                            !userMovie || loadingEpisodes || currentSeasonEpisodes.length === 0
                        }
                    >
                        Clear
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={onMarkSeasonWatched}
                        disabled={
                            !userMovie || loadingEpisodes || currentSeasonEpisodes.length === 0
                        }
                    >
                        Mark All
                    </Button>
                </div>
            </div>

            <ScrollArea className="h-[400px] w-full pr-4">
                {loadingEpisodes ? (
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square w-full rounded-md" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {currentSeasonEpisodes.map((episode) => {
                            const isWatched = userMovie?.watched_episodes?.some(
                                (e) =>
                                    e.season_number === episode.season_number &&
                                    e.episode_number === episode.episode_number
                            );

                            return (
                                <button
                                    key={episode.id}
                                    onClick={() =>
                                        onEpisodeToggle(episode.season_number, episode.episode_number)
                                    }
                                    title={`${episode.episode_number}. ${episode.name}`}
                                    aria-label={`Mark Season ${episode.season_number} Episode ${episode.episode_number} as ${isWatched ? "unwatched" : "watched"}`}
                                    className={`
                    aspect-square flex items-center justify-center rounded-md text-sm font-medium transition-all
                    hover:scale-105 active:scale-95 border
                    ${isWatched
                                            ? "bg-green-600 border-green-700 text-white hover:bg-green-500"
                                            : "bg-secondary/50 border-transparent hover:bg-secondary hover:border-primary/20 text-foreground"
                                        }
                  `}
                                >
                                    {episode.episode_number}
                                </button>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
