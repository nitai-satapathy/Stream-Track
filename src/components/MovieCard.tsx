import Image from "next/image";
import * as React from "react";
import type { Movie } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Check, X, Plus, Eye } from "lucide-react";
import { Badge } from "./ui/badge";
import { TMDB_IMAGE_BASE_URL_W500 } from "@/lib/constants";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
  // Quick Actions (only for Recommendation Page)
  onDismiss?: (e: React.MouseEvent) => void;
  onQuickAdd?: (e: React.MouseEvent) => void;
  onQuickWatched?: (e: React.MouseEvent) => void;
  isInWatchlist?: boolean;
  isWatched?: boolean;
}


export function MovieCard({
  movie,
  onClick,
  isEditing,
  isSelected,
  onToggleSelect,
  onDismiss,
  onQuickAdd,
  onQuickWatched,
  isInWatchlist,
  isWatched,
}: MovieCardProps & {
  isEditing?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (isEditing && onToggleSelect) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelect();
    } else {
      onClick();
    }
  };

  const hasQuickActions = onDismiss || onQuickAdd || onQuickWatched;

  return (
    <div className="relative group">
      <Card
        className={`w-[150px] shrink-0 cursor-pointer overflow-hidden transition-all duration-300 md:w-[200px] ${isEditing ? "animate-shake hover:none" : "hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
          }`}
        onClick={handleClick}
      >
        <CardContent className="p-0">
          <div className="relative h-[210px] w-full md:h-[300px]">
            <Image
              src={
                movie.poster_path
                  ? `${TMDB_IMAGE_BASE_URL_W500}${movie.poster_path}`
                  : "https://placehold.co/200x300.png?text=No+Image"
              }
              alt={movie.title || movie.name || "Movie poster"}
              fill
              className="rounded-t-lg object-cover"
              data-ai-hint="movie poster"
              sizes="(max-width: 768px) 140px, 200px"
            />

            {hasQuickActions && !isEditing && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-2 z-10">
                <div className="flex justify-between items-start">
                  {onQuickAdd && (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-full bg-black/40 backdrop-blur-md hover:bg-primary hover:text-white ${isInWatchlist ? 'text-primary' : 'text-white'}`}
                            onClick={(e) => { e.stopPropagation(); onQuickAdd(e); }}
                          >
                            {isInWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right"><p>{isInWatchlist ? "In Watchlist" : "Add to Watchlist"}</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {onDismiss && (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md hover:bg-destructive hover:text-white text-white/80"
                            onClick={(e) => { e.stopPropagation(); onDismiss(e); }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left"><p>Dismiss</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                <div className="flex justify-end">
                  {onQuickWatched && (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-full bg-black/40 backdrop-blur-md hover:bg-primary hover:text-white ${isWatched ? 'text-primary' : 'text-white'}`}
                            onClick={(e) => { e.stopPropagation(); onQuickWatched(e); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left"><p>{isWatched ? "Watched" : "Mark as Watched"}</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            )}

            {isEditing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                {isSelected ? (
                  <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                    <Check className="w-8 h-8 opacity-70 text-white" />
                  </div>
                ) : (
                  <div className="rounded-full bg-black/20 p-2 backdrop-blur-sm">
                    <X className="w-8 h-8 opacity-70 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="p-2 md:p-3">
            <h3 className="truncate text-sm font-semibold md:text-base">
              {movie.title || movie.name}
            </h3>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground md:mt-2 md:text-sm">
              <Badge
                variant="outline"
                className="flex h-5 items-center gap-1 px-1 py-0 md:h-auto"
              >
                <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </Badge>
              <span className="text-[10px] md:text-sm">
                {(movie.release_date || movie.first_air_date)?.substring(0, 4)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
