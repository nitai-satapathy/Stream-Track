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
import { fetchMovieDetails, fetchSeasonDetails, fetchCredits, CastMember } from "@/lib/tmdb";
import { fetchOmdbData, OmdbData } from "@/lib/omdb";
import {
  Popcorn,
  ListPlus,
  Clapperboard,
  Star,
  Youtube,
  Wallet,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { LiaImdb } from "react-icons/lia";
import {
  SiThemoviedatabase,
  SiRottentomatoes,
  SiMetacritic,
} from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { FcCalendar } from "react-icons/fc";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ListType } from "@/hooks/useListManager";

interface MovieModalProps {
  movieId: number | null;
  mediaType: "movie" | "tv" | null;
  isOpen: boolean;
  onClose: () => void;
  onListUpdate: (movie: Movie, list: ListType) => void | Promise<void>;
  isMovieInList: (movieId: number, list: ListType) => boolean;
  onMovieSelect?: (id: number, mediaType: "movie" | "tv") => void;
  userMovie?: Movie;
  updateMovieProgress?: (movie: Movie) => Promise<void>;
  aiExplanation?: string;
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
  userMovie,
  updateMovieProgress,
  aiExplanation,
}: MovieModalProps) {
  const [movie, setMovie] = React.useState<Movie | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [omdb, setOmdb] = React.useState<OmdbData | null>(null);
  const [cast, setCast] = React.useState<CastMember[]>([]);
  const [selectedPersonId, setSelectedPersonId] = React.useState<number | null>(null);
  const [history, setHistory] = React.useState<{ movieId: number; mediaType: "movie" | "tv"; personId: number | null }[]>([]);
  const restoringPersonId = React.useRef<number | null>(null);
  const prevMovieIdRef = React.useRef<number | null>(null);

  // Episode Tracking State
  const [seasons, setSeasons] = React.useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = React.useState<number>(1);
  const [currentSeasonEpisodes, setCurrentSeasonEpisodes] = React.useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = React.useState(false);
  // Tab State with Persistence
  const [activeTab, setActiveTabState] = React.useState("overview");

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem("movieModalActiveTab", tab);
    }
  };

  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      const savedTab = sessionStorage.getItem("movieModalActiveTab");
      if (savedTab) {
        setActiveTabState(savedTab);
      }
    } else {
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
      if (prevMovieIdRef.current !== movieId) {
        setActiveTabState("overview");
        if (typeof window !== 'undefined') {
          sessionStorage.setItem("movieModalActiveTab", "overview");
        }
        prevMovieIdRef.current = movieId;
      }

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
      setMovie(null);
      setOmdb(null);
      setCast([]);
      setSelectedPersonId(null);
      setSeasons([]);
      setSelectedSeason(1);
      setCurrentSeasonEpisodes([]);
    }
  }, [movieId, mediaType, onClose, toast]);

  // Fetch seasons/episodes when movie/mediaType changes or tab selected
  React.useEffect(() => {
    if (movie && mediaType === 'tv') {
      // Populate seasons dropdown
      if (movie.number_of_seasons) {
        const s = Array.from({ length: movie.number_of_seasons }, (_, i) => i + 1);
        setSeasons(s);
      }
    }
  }, [movie, mediaType]);

  // Fetch episodes for selected season
  React.useEffect(() => {
    const getEpisodes = async () => {
      if (
        movieId &&
        mediaType === 'tv' &&
        selectedSeason &&
        movie &&
        movie.number_of_seasons &&
        selectedSeason <= movie.number_of_seasons
      ) {
        setLoadingEpisodes(true);
        try {
          const seasonData = await fetchSeasonDetails(movieId, selectedSeason);
          setCurrentSeasonEpisodes(seasonData.episodes || []);
        } catch (error) {
        } finally {
          setLoadingEpisodes(false);
        }
      }
    };
    getEpisodes();
  }, [movieId, mediaType, selectedSeason, movie]);

  const handleEpisodeToggle = async (seasonNum: number, episodeNum: number) => {
    if (!userMovie) {
      toast({
        title: "Add to Watching",
        description: "Please add this show to your Watching list to track episodes.",
        variant: "destructive",
      });
      return;
    }

    if (!updateMovieProgress) {
      return;
    }

    let newWatchedEpisodes = [...(userMovie.watched_episodes || [])];
    const existingIndex = newWatchedEpisodes.findIndex(
      e => e.season_number === seasonNum && e.episode_number === episodeNum
    );

    if (existingIndex > -1) {
      newWatchedEpisodes.splice(existingIndex, 1);
    } else {
      newWatchedEpisodes.push({ season_number: seasonNum, episode_number: episodeNum });
    }

    const updatedMovie: Movie = {
      ...userMovie,
      watched_episodes: newWatchedEpisodes
    };

    try {
      await updateMovieProgress(updatedMovie);
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to update episode progress.",
        variant: "destructive"
      });
    }
  };

  const handleMarkSeasonWatched = async () => {
    if (!userMovie || !updateMovieProgress || !currentSeasonEpisodes.length) return;

    const newWatchedEpisodes = [...(userMovie.watched_episodes || [])];
    let addedCount = 0;

    const today = new Date().toISOString().split('T')[0];

    currentSeasonEpisodes.forEach(episode => {
      // release date check
      if (episode.air_date && episode.air_date > today) {
        return;
      }

      const exists = newWatchedEpisodes.some(
        e => e.season_number === episode.season_number && e.episode_number === episode.episode_number
      );

      if (!exists) {
        newWatchedEpisodes.push({
          season_number: episode.season_number,
          episode_number: episode.episode_number
        });
        addedCount++;
      }
    });

    if (addedCount === 0) {
      toast({
        title: "No new episodes",
        description: "All episodes in this season are already watched.",
      });
      return;
    }

    const updatedMovie: Movie = {
      ...userMovie,
      watched_episodes: newWatchedEpisodes
    };

    try {
      await updateMovieProgress(updatedMovie);
      toast({
        title: "Season Watched",
        description: `Marked ${addedCount} episodes as watched.`,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to update season progress.",
        variant: "destructive"
      });
    }
  };

  const handleClearSeasonWatched = async () => {
    if (!userMovie || !updateMovieProgress || !currentSeasonEpisodes.length) return;

    // Filter out episodes from the current season
    const newWatchedEpisodes = (userMovie.watched_episodes || []).filter(
      e => e.season_number !== selectedSeason
    );

    const removedCount = (userMovie.watched_episodes || []).length - newWatchedEpisodes.length;

    if (removedCount === 0) {
      toast({
        title: "No episodes watched",
        description: "No episodes to clear for this season.",
      });
      return;
    }

    const updatedMovie: Movie = {
      ...userMovie,
      watched_episodes: newWatchedEpisodes
    };

    try {
      await updateMovieProgress(updatedMovie);
      toast({
        title: "Season Cleared",
        description: `Cleared progress for ${removedCount} episodes.`,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to clear season progress.",
        variant: "destructive"
      });
    }
  };

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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={`grid w-full h-auto mb-4 ${mediaType === 'tv' ? 'grid-cols-5' : 'grid-cols-4'}`}>
                <TabsTrigger value="overview" className="text-[13px] sm:text-sm px-1 py-2 h-auto sm:py-1.5">Overview</TabsTrigger>
                {mediaType === 'tv' && (
                  <TabsTrigger value="episodes" className="text-[13px] sm:text-sm px-1 py-2 h-auto sm:py-1.5">Episodes</TabsTrigger>
                )}
                <TabsTrigger value="cast" className="text-[13px] sm:text-sm px-1 py-2 h-auto sm:py-1.5">Cast</TabsTrigger>
                <TabsTrigger value="videos" className="text-[13px] sm:text-sm px-1 py-2 h-auto sm:py-1.5">Videos</TabsTrigger>
                <TabsTrigger value="related" className="text-[13px] sm:text-sm px-1 py-2 h-auto sm:py-1.5">Related</TabsTrigger>
              </TabsList>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* AI Explanation */}
                {aiExplanation && (
                  <div className="mb-6 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 border-l-4 border-primary shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary fill-primary/20 animate-pulse" />
                      <span className="text-xs font-bold text-primary tracking-wider uppercase">Why we recommend this</span>
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

              {/* EPISODES TAB */}
              {mediaType === 'tv' && (
                <TabsContent value="episodes" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
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
                        onClick={handleClearSeasonWatched}
                        disabled={!userMovie || loadingEpisodes || currentSeasonEpisodes.length === 0}
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleMarkSeasonWatched}
                        disabled={!userMovie || loadingEpisodes || currentSeasonEpisodes.length === 0}
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
                            e => e.season_number === episode.season_number && e.episode_number === episode.episode_number
                          );

                          return (
                            <button
                              key={episode.id}
                              onClick={() => handleEpisodeToggle(episode.season_number, episode.episode_number)}
                              title={`${episode.episode_number}. ${episode.name}`}
                              aria-label={`Mark Season ${episode.season_number} Episode ${episode.episode_number} as ${isWatched ? "unwatched" : "watched"}`}
                              className={`
                                aspect-square flex items-center justify-center rounded-md text-sm font-medium transition-all
                                hover:scale-105 active:scale-95 border
                                ${isWatched
                                  ? 'bg-green-600 border-green-700 text-white hover:bg-green-500'
                                  : 'bg-secondary/50 border-transparent hover:bg-secondary hover:border-primary/20 text-foreground'
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
                </TabsContent>
              )}

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
                          role="button"
                          tabIndex={0}
                          aria-label={`View details for ${member.name}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedPersonId(member.id);
                            }
                          }}
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
                          role="button"
                          tabIndex={0}
                          aria-label={`View details for ${item.title || item.name}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleNavigation(item.id, item.media_type || mediaType || 'movie');
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
