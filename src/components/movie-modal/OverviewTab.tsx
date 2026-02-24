import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Youtube, Popcorn, ListPlus, Clapperboard, Wallet } from "lucide-react";
import { SiThemoviedatabase, SiRottentomatoes, SiMetacritic } from "react-icons/si";
import { LiaImdb } from "react-icons/lia";
import { FcCalendar } from "react-icons/fc";
import type { Movie } from "@/lib/types";
import type { OmdbData } from "@/lib/omdb";
import type { ListType } from "@/hooks/useListManager";

interface OverviewTabProps {
    movie: Movie;
    omdb: OmdbData | null;
    aiExplanation?: string;
    inWatching: boolean;
    inWatchlist: boolean;
    inWatched: boolean;
    onListUpdate: (list: ListType) => void;
}

export function OverviewTab({
    movie,
    omdb,
    aiExplanation,
    inWatching,
    inWatchlist,
    inWatched,
    onListUpdate,
}: OverviewTabProps) {
    const releaseDate = movie.release_date || movie.first_air_date;

    const trailer = movie?.videos?.results.find(
        (video) => video.site === "YouTube" && video.type === "Trailer"
    );

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* AI Explanation */}
            {aiExplanation && (
                <div className="mb-6 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 border-l-4 border-primary shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary fill-primary/20 animate-pulse" />
                        <span className="text-xs font-bold text-primary tracking-wider uppercase">
                            Why we recommend this
                        </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed font-medium italic">
                        &quot;{aiExplanation}&quot;
                    </p>
                </div>
            )}

            {/* Ratings */}
            <div className="flex flex-wrap items-center space-x-4 text-sm">
                <div className="flex items-center gap-1">
                    <SiThemoviedatabase className="h-5 w-5 text-green-600" />
                    <span>{movie.vote_average.toFixed(1)} / 10</span>
                </div>
                {omdb?.imdbRating && omdb.imdbRating !== "N/A" && (
                    <div className="flex items-center gap-1">
                        <LiaImdb className="h-6 w-6 text-yellow-500" />
                        <span>{omdb.imdbRating} / 10</span>
                    </div>
                )}
                {omdb?.Ratings?.find((r) => r.Source === "Rotten Tomatoes") && (
                    <div className="flex items-center gap-1">
                        <SiRottentomatoes className="h-5 w-5 text-red-600" />
                        <span>
                            {omdb.Ratings.find((r) => r.Source === "Rotten Tomatoes")?.Value}
                        </span>
                    </div>
                )}
                {omdb?.Metascore && omdb.Metascore !== "N/A" && (
                    <div className="flex items-center gap-1">
                        <SiMetacritic className="h-5 w-5 text-green-700" />
                        <span>{omdb.Metascore} / 100</span>
                    </div>
                )}
            </div>

            {/* Metadata */}
            {(omdb?.BoxOffice && omdb.BoxOffice !== "N/A") || releaseDate ? (
                <div className="flex items-center space-x-4 text-sm">
                    {omdb?.BoxOffice && omdb.BoxOffice !== "N/A" && (
                        <div className="flex items-center gap-1">
                            <Wallet className="h-5 w-5 text-blue-700" />
                            <span>{omdb.BoxOffice}</span>
                        </div>
                    )}
                    {releaseDate && (
                        <span className="flex items-center gap-1">
                            <FcCalendar className="h-5 w-5" />
                            {releaseDate}
                        </span>
                    )}
                </div>
            ) : null}

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
                {movie.genres?.map((genre) => (
                    <Badge key={genre.id} variant="secondary">
                        {genre.name}
                    </Badge>
                ))}
            </div>

            {/* Overview */}
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <p className="text-justify text-muted-foreground text-sm leading-relaxed">
                    {movie.overview}
                </p>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
                {trailer && (
                    <Button
                        onClick={() =>
                            window.open(
                                `https://www.youtube.com/watch?v=${trailer.key}`,
                                "_blank"
                            )
                        }
                        variant="default"
                        className="flex-1 sm:flex-none"
                    >
                        <Youtube className="mr-2 h-4 w-4" />
                        Trailer
                    </Button>
                )}
                <Button
                    variant={inWatching ? "default" : "secondary"}
                    onClick={() => onListUpdate("watching")}
                    className="flex-1 sm:flex-none"
                >
                    <Popcorn className="mr-2 h-4 w-4" />
                    {inWatching ? "Watching" : "Watching"}
                </Button>
                <Button
                    variant={inWatchlist ? "default" : "secondary"}
                    onClick={() => onListUpdate("watchlist")}
                    className="flex-1 sm:flex-none"
                >
                    <ListPlus className="mr-2 h-4 w-4" />
                    {inWatchlist ? "In List" : "List"}
                </Button>
                <Button
                    variant={inWatched ? "default" : "secondary"}
                    onClick={() => onListUpdate("watched")}
                    className="flex-1 sm:flex-none"
                >
                    <Clapperboard className="mr-2 h-4 w-4" />
                    {inWatched ? "Watched" : "Watched"}
                </Button>
            </div>
        </div>
    );
}
