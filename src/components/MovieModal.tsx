"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonDetails } from "./PersonDetails";
import type { Movie } from "@/lib/types";
import { fetchCredits, CastMember } from "@/lib/fetchCredits";
import { fetchMovieDetails } from "@/lib/tmdb";
import { fetchOmdbData } from "@/lib/omdb";
import type { OmdbData } from "@/lib/omdb.types";
import {
  Popcorn,
  ListPlus,
  Clapperboard,
  Star,
  Youtube,
  Wallet,
  ArrowLeft,
} from "lucide-react";
import { LiaImdb } from "react-icons/lia";
import {
  SiThemoviedatabase,
  SiRottentomatoes,
  SiMetacritic,
} from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { FcCalendar } from "react-icons/fc";

type ListType = "watchlist" | "watching" | "watched";

interface MovieModalProps {
  movieId: number | null;
  mediaType: "movie" | "tv" | null;
  isOpen: boolean;
  onClose: () => void;
  onListUpdate: (movie: Movie, list: ListType) => void | Promise<void>;
  isMovieInList: (movieId: number, list: ListType) => boolean;
  onMovieSelect?: (id: number, mediaType: "movie" | "tv") => void;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

export function MovieModal({
  movieId,
  mediaType,
  isOpen,
  onClose,
  onListUpdate,
  isMovieInList,
  onMovieSelect,
}: MovieModalProps) {
  const [movie, setMovie] = React.useState<Movie | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [omdb, setOmdb] = React.useState<OmdbData | null>(null);
  const [cast, setCast] = React.useState<CastMember[]>([]);
  const [selectedPersonId, setSelectedPersonId] = React.useState<number | null>(null);
  const [history, setHistory] = React.useState<{ movieId: number; mediaType: "movie" | "tv"; personId: number | null }[]>([]);
  const restoringPersonId = React.useRef<number | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!isOpen) {
      setHistory([]);
      setSelectedPersonId(null);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (restoringPersonId.current !== null) {
      setSelectedPersonId(restoringPersonId.current);
      restoringPersonId.current = null;
    } else {
      setSelectedPersonId(null);
    }

    if (movieId && mediaType) {
      const getMovieDetails = async () => {
        setIsLoading(true);
        setOmdb(null);
        try {
          const details = await fetchMovieDetails(movieId, mediaType);
          setMovie(details);
          // Try to get OMDb data
          let title = details.title || details.name;
          let year =
            details.release_date?.slice(0, 4) ||
            details.first_air_date?.slice(0, 4);
          let type: "movie" | "series" | undefined =
            mediaType === "movie"
              ? "movie"
              : mediaType === "tv"
                ? "series"
                : undefined;
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
            description:
              "Failed to load movie details. Please try again later.",
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
      setSelectedPersonId(null);
    }
  }, [movieId, mediaType, onClose, toast]);

  const trailer = movie?.videos?.results.find(
    (video) => video.site === "YouTube" && video.type === "Trailer"
  );

  const videos = movie?.videos?.results?.sort((a, b) => {
    if (a.type === "Trailer" && b.type !== "Trailer") return -1;
    if (a.type !== "Trailer" && b.type === "Trailer") return 1;
    return 0;
  }).filter(
    (video) => video.site === "YouTube"
  ).slice(0, 4);

  const recommendations = movie?.recommendations?.results.slice(0, 10);

  const handleListButtonClick = (list: ListType) => {
    if (movie) {
      onListUpdate(movie, list);
    }
  };

  const handleNavigation = (id: number, type: "movie" | "tv") => {
    // Push current state to history before navigating
    if (movieId && mediaType) {
      setHistory(prev => [...prev, { movieId, mediaType, personId: selectedPersonId }]);
    }
    onMovieSelect?.(id, type);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    // Set flag to restore personId after prop update
    restoringPersonId.current = previous.personId;
    onMovieSelect?.(previous.movieId, previous.mediaType);
  };

  const renderContent = () => {
    if (selectedPersonId) {
      return (
        <PersonDetails
          personId={selectedPersonId}
          onBack={() => setSelectedPersonId(null)}
          onMovieSelect={(id, type) => {
            // Navigation to another movie/show
            handleNavigation(id, type);
          }}
        />
      );
    }

    if (isLoading || !movie) {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="sr-only">Loading movie details</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Skeleton className="col-span-1 h-[450px] w-full md:col-span-1 md:h-[350px]" />
            <div className="col-span-1 space-y-4 md:col-span-2">
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
        {history.length > 0 && (
          <Button
            variant="ghost"
            className="gap-2 pl-0 w-fit hover:bg-transparent hover:text-primary"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <div className="grid grid-cols-1 gap-4 text-foreground md:grid-cols-3 md:gap-8">
          <div className="col-span-1 flex justify-center flex-col gap-4">
            <div className="relative aspect-[2/3] w-3/4 sm:w-full mx-auto overflow-hidden rounded-lg shadow-xl">
              <Image
                src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                alt={movie.title || movie.name || "Poster"}
                width={500}
                height={750}
                className="h-auto max-h-[400px] w-auto rounded-lg object-contain shadow-lg md:max-h-none"
                data-ai-hint="movie poster"
              />
            </div>
          </div>

          {/* Content Section (Tabs) */}
          <div className="col-span-2">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-3xl font-bold">
                {movie.title || movie.name}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cast">Cast</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="related">Related</TabsTrigger>
              </TabsList>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
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
                    onClick={() => handleListButtonClick("watching")}
                    className="flex-1 sm:flex-none"
                  >
                    <Popcorn className="mr-2 h-4 w-4" />
                    {inWatching ? "Watching" : "Watching"}
                  </Button>
                  <Button
                    variant={inWatchlist ? "default" : "secondary"}
                    onClick={() => handleListButtonClick("watchlist")}
                    className="flex-1 sm:flex-none"
                  >
                    <ListPlus className="mr-2 h-4 w-4" />
                    {inWatchlist ? "In List" : "List"}
                  </Button>
                  <Button
                    variant={inWatched ? "default" : "secondary"}
                    onClick={() => handleListButtonClick("watched")}
                    className="flex-1 sm:flex-none"
                  >
                    <Clapperboard className="mr-2 h-4 w-4" />
                    {inWatched ? "Watched" : "Watched"}
                  </Button>
                </div>
              </TabsContent>

              {/* CAST TAB */}
              <TabsContent value="cast" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {cast.length > 0 ? (
                  <ScrollArea className="h-[400px] w-full pr-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {cast.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/80 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-sm ring-1 ring-transparent hover:ring-border/50"
                          onClick={() => setSelectedPersonId(member.id)}
                        >
                          <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-md">
                            {member.profile_path ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                                alt={member.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                                No Img
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">{member.name}</span>
                            <span className="text-xs text-muted-foreground truncate">{member.character}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                    No cast information available
                  </div>
                )}
              </TabsContent>

              {/* VIDEOS TAB */}
              <TabsContent value="videos" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {videos && videos.length > 0 ? (
                  <ScrollArea className="h-[400px] w-full pr-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {videos.map((video) => (
                        <div key={video.id} className="space-y-2">
                          <div className="aspect-video w-full rounded-md overflow-hidden bg-black/10 relative group shadow-sm hover:shadow-md transition-shadow">
                            <iframe
                              width="100%"
                              height="100%"
                              src={`https://www.youtube.com/embed/${video.key}`}
                              title={video.name}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="border-none"
                            />
                          </div>
                          <p className="text-sm font-medium line-clamp-1" title={video.name}>
                            {video.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                    No videos available
                  </div>
                )}
              </TabsContent>

              {/* RELATED TAB */}
              <TabsContent value="related" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {recommendations && recommendations.length > 0 ? (
                  <ScrollArea className="h-[400px] w-full pr-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {recommendations.map((item) => (
                        <div
                          key={item.id}
                          className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 hover:ring-2 hover:ring-primary/20 rounded-md group"
                          onClick={() => handleNavigation(item.id, item.media_type || mediaType || 'movie')}
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
                ) : (
                  <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                    No recommendations available
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] md:max-h-[90vh] max-w-4xl overflow-y-auto bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:p-8">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
