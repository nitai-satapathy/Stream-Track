import React from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star } from "lucide-react";

interface RelatedTabProps {
    recommendations?: any[];
    mediaType: string | null;
    onNavigation: (id: number, type: "movie" | "tv") => void;
}

export function RelatedTab({ recommendations, mediaType, onNavigation }: RelatedTabProps) {
    if (!recommendations || recommendations.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No recommendations available
            </div>
        );
    }

    return (
        <ScrollArea className="h-[400px] w-full pr-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {recommendations.map((item) => (
                    <div
                        key={item.id}
                        className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 hover:ring-2 hover:ring-primary/20 rounded-md group"
                        onClick={() => onNavigation(item.id, item.media_type || mediaType || 'movie')}
                        role="button"
                        tabIndex={0}
                        aria-label={`View details for ${item.title || item.name}`}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onNavigation(item.id, item.media_type || mediaType || 'movie');
                            }
                        }}
                    >
                        <div className="aspect-[2/3] w-full rounded-md overflow-hidden bg-muted">
                            {item.poster_path ? (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                    alt={item.title || item.name || "Poster"}
                                    width={140}
                                    height={210}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                                    No Poster
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-xs font-medium line-clamp-1 px-1" title={item.title || item.name}>
                            {item.title || item.name}
                        </p>
                        {item.vote_average > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground px-1 pb-1">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                <span>{item.vote_average.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
