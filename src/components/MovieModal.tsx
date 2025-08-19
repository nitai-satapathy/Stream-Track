"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Movie } from "@/lib/types";
import { fetchMovieDetails } from "@/lib/tmdb";
import { Eye, ListPlus, Check, Star, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ListType = "watchlist" | "watching" | "watched";

interface MovieModalProps {
  movieId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onListUpdate: (movie: Movie, list: ListType) => void;
  isMovieInList: (movieId: number, list: ListType) => boolean;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

export function MovieModal({ movieId, isOpen, onClose, onListUpdate, isMovieInList }: MovieModalProps) {
  const [movie, setMovie] = React.useState<Movie | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (movieId) {
      const getMovieDetails = async () => {
        setIsLoading(true);
        try {
          const details = await fetchMovieDetails(movieId);
          setMovie(details);
        } catch (error) {
          console.error("Failed to fetch movie details:", error);
          toast({
            title: "Error",
            description: "Failed to load movie details. Please try again later.",
            variant: "destructive",
          });
          onClose();
        } finally {
          setIsLoading(false);
        }
      };
      getMovieDetails();
    } else {
      setMovie(null);
    }
  }, [movieId, onClose, toast]);

  const trailer = movie?.videos?.results.find(
    (video) => video.site === "YouTube" && video.type === "Trailer"
  );
  
  const handleListButtonClick = (list: ListType) => {
    if (movie) {
      onListUpdate(movie, list);
    }
  };

  const renderContent = () => {
    if (isLoading || !movie) {
      return (
        <>
        <DialogHeader>
            <DialogTitle className="sr-only">Loading movie details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-[450px] md:h-[350px] w-full col-span-1 md:col-span-1" />
          <div className="space-y-4 col-span-1 md:col-span-2">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        </>
      );
    }
    
    const inWatchlist = isMovieInList(movie.id, "watchlist");
    const inWatching = isMovieInList(movie.id, "watching");
    const inWatched = isMovieInList(movie.id, "watched");
    const releaseDate = movie.release_date || movie.first_air_date;


    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-foreground">
        <div className="col-span-1">
          <Image
            src={`${IMAGE_BASE_URL}${movie.poster_path}`}
            alt={movie.title || movie.name || "Poster"}
            width={500}
            height={750}
            className="rounded-lg shadow-lg"
            data-ai-hint="movie poster"
          />
        </div>
        <div className="col-span-2 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">
              {movie.title || movie.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
              <span>{movie.vote_average.toFixed(1)} / 10</span>
            </div>
            <span>{releaseDate}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {movie.genres?.map((genre) => (
              <Badge key={genre.id} variant="secondary">
                {genre.name}
              </Badge>
            ))}
          </div>
          <p className="text-muted-foreground">{movie.overview}</p>

          <div className="flex flex-wrap gap-2 pt-4">
             {trailer && (
              <Button
                onClick={() =>
                  window.open(
                    `https://www.youtube.com/watch?v=${trailer.key}`,
                    "_blank"
                  )
                }
                variant="default"
              >
                <Youtube className="mr-2" />
                Watch Trailer
              </Button>
            )}
            <Button
              variant={inWatching ? "default" : "secondary"}
              onClick={() => handleListButtonClick("watching")}
            >
              <Eye />
              {inWatching ? "Watching" : "Set as Watching"}
            </Button>
            <Button
              variant={inWatchlist ? "default" : "secondary"}
              onClick={() => handleListButtonClick("watchlist")}
            >
              <ListPlus />
              {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
            </Button>
            <Button
              variant={inWatched ? "default" : "secondary"}
              onClick={() => handleListButtonClick("watched")}
            >
              <Check />
              {inWatched ? "Watched" : "Mark as Watched"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
