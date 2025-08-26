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
import { fetchCredits, CastMember } from "@/lib/fetchCredits";
import { fetchMovieDetails } from "@/lib/tmdb";
import { fetchOmdbData } from "@/lib/omdb";
import type { OmdbData } from "@/lib/omdb.types";
import { Popcorn, ListPlus, Clapperboard, Star, Youtube, Wallet } from "lucide-react";
import { LiaImdb } from "react-icons/lia";
import { SiThemoviedatabase, SiRottentomatoes, SiMetacritic } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { FcCalendar } from "react-icons/fc";

type ListType = "watchlist" | "watching" | "watched";

interface MovieModalProps {
  movieId: number | null;
  mediaType: 'movie' | 'tv' | null;
  isOpen: boolean;
  onClose: () => void;
  onListUpdate: (movie: Movie, list: ListType) => void;
  isMovieInList: (movieId: number, list: ListType) => boolean;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";


export function MovieModal({ movieId, mediaType, isOpen, onClose, onListUpdate, isMovieInList }: MovieModalProps) {
  const [movie, setMovie] = React.useState<Movie | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [omdb, setOmdb] = React.useState<OmdbData | null>(null);
  const [cast, setCast] = React.useState<CastMember[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    if (movieId && mediaType) {
      const getMovieDetails = async () => {
        setIsLoading(true);
        setOmdb(null);
        try {
          const details = await fetchMovieDetails(movieId, mediaType);
          setMovie(details);
          // Try to get OMDb data using title/name and year
          let title = details.title || details.name;
          let year = details.release_date?.slice(0, 4) || details.first_air_date?.slice(0, 4);
          let type: 'movie' | 'series' | undefined = mediaType === 'movie' ? 'movie' : mediaType === 'tv' ? 'series' : undefined;
          if (title) {
            try {
              const omdbData = await fetchOmdbData(title, year, type);
              setOmdb(omdbData);
            } catch (err) {
              setOmdb(null);
            }
          }
          // Fetch cast
          try {
            const castData = await fetchCredits(movieId, mediaType);
            setCast(castData.slice(0, 12)); // Show top 12 cast
          } catch (err) {
            setCast([]);
          }
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
      setOmdb(null);
      setCast([]);
    }
  }, [movieId, mediaType, onClose, toast]);

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
      <>
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
            {/* Ratings Row */}
            <div className="flex flex-wrap items-center space-x-4 text-sm mb-2">
              {/* TMDb Rating */}
              <div className="flex items-center gap-1">
                <SiThemoviedatabase className="h-5 w-5 text-green-600" />
                <span>{movie.vote_average.toFixed(1)} / 10</span>
              </div>
              {/* IMDb Rating */}
              {omdb?.imdbRating && omdb.imdbRating !== 'N/A' && (
                <div className="flex items-center gap-1">
                  <LiaImdb className="h-6 w-6 text-yellow-500" />
                  <span>{omdb.imdbRating} / 10</span>
                </div>
              )}
              {/* Rotten Tomatoes */}
              {omdb?.Ratings?.find(r => r.Source === 'Rotten Tomatoes') && (
                <div className="flex items-center gap-1">
                  <SiRottentomatoes className="h-5 w-5 text-red-600" />
                  <span>{omdb.Ratings.find(r => r.Source === 'Rotten Tomatoes')?.Value}</span>
                </div>
              )}
              {/* Metacritic */}
              {omdb?.Metascore && omdb.Metascore !== 'N/A' && (
                <div className="flex items-center gap-1">
                  <SiMetacritic className="h-5 w-5 text-green-700" />
                  <span>{omdb.Metascore} / 100</span>
                </div>
              )}
            </div>
            {/* Box Office and Release Date Row */}
            {(omdb?.BoxOffice && omdb.BoxOffice !== 'N/A') || releaseDate ? (
              <div className="flex items-center space-x-4 text-sm mb-2">
                {omdb?.BoxOffice && omdb.BoxOffice !== 'N/A' && (
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
                <Popcorn />
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
                <Clapperboard />
                {inWatched ? "Watched" : "Mark as Watched"}
              </Button>
            </div>
          </div>
        </div>
        {/* Cast section full width below */}
        {cast.length > 0 && (
          <div className="mt-10 col-span-full w-full">
            <h4 className="font-bold mb-2 text-lg">Cast</h4>
            <div className="flex flex-wrap gap-3">
              {cast.map((member) => (
                <div key={member.id} className="flex flex-col items-center text-center w-[90px] mb-2">
                  {member.profile_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                      alt={member.name}
                      width={100}
                      height={90}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-[70px] h-[90px] bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Photo</div>
                  )}
                  <span className="mt-1 font-medium text-xs truncate w-[70px]">{member.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate w-[70px]">{member.character}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 overflow-y-auto max-h-[90vh]">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
