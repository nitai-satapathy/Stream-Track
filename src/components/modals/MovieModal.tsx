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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonDetails } from "@/components/media/PersonDetails";
import type { Movie } from "@/lib/types";
import { fetchMovieDetails, fetchSeasonDetails, fetchCredits, CastMember } from "@/lib/tmdb";
import { fetchOmdbData, OmdbData } from "@/lib/omdb";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { CastTab } from "@/components/movie-modal/CastTab";
import { VideosTab } from "@/components/movie-modal/VideosTab";
import { RelatedTab } from "@/components/movie-modal/RelatedTab";
import { EpisodesTab } from "@/components/movie-modal/EpisodesTab";
import { OverviewTab } from "@/components/movie-modal/OverviewTab";

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
  const [seasons, setSeasons] = React.useState<number[]>([]);
  const [selectedSeason, setSelectedSeason] = React.useState<number>(1);
  const [currentSeasonEpisodes, setCurrentSeasonEpisodes] = React.useState<{
    id: number;
    name: string;
    episode_number: number;
    season_number: number;
    air_date?: string;
  }[]>([]);
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
              <TabsContent value="overview" className="outline-none">
                <OverviewTab
                  movie={movie}
                  omdb={omdb}
                  aiExplanation={aiExplanation}
                  inWatching={inWatching}
                  inWatchlist={inWatchlist}
                  inWatched={inWatched}
                  onListUpdate={handleListButtonClick}
                />
              </TabsContent>

              {/* EPISODES TAB */}
              {mediaType === 'tv' && (
                <TabsContent value="episodes" className="outline-none">
                  <EpisodesTab
                    seasons={seasons}
                    selectedSeason={selectedSeason}
                    setSelectedSeason={setSelectedSeason}
                    currentSeasonEpisodes={currentSeasonEpisodes}
                    loadingEpisodes={loadingEpisodes}
                    userMovie={userMovie}
                    onClearSeasonWatched={handleClearSeasonWatched}
                    onMarkSeasonWatched={handleMarkSeasonWatched}
                    onEpisodeToggle={handleEpisodeToggle}
                  />
                </TabsContent>
              )}

              {/* CAST TAB */}
              <TabsContent value="cast" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <CastTab cast={cast} onSelectPerson={setSelectedPersonId} />
              </TabsContent>

              {/* VIDEOS TAB */}
              <TabsContent value="videos" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <VideosTab videos={videos} />
              </TabsContent>

              {/* RELATED TAB */}
              <TabsContent value="related" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <RelatedTab
                  recommendations={recommendations}
                  mediaType={mediaType}
                  onNavigation={handleNavigation}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] md:max-h-[90vh] max-w-4xl overflow-y-auto p-4 md:p-8 glass-panel border-white/5 shadow-2xl">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
