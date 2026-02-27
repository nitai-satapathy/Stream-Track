"use client";

import * as React from "react";
import { Header } from "@/components/layout/Header";
import { MovieRow } from "@/components/media/MovieRow";
import { MovieModal } from "@/components/modals/MovieModal";
import { BrowseSection } from "@/components/media/BrowseSection";
import {
  fetchTrendingMovies,
  fetchTrendingTv,
  fetchPopularTvShows,
  fetchAiringTodayTvShows,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  searchMulti,
  fetchTopRatedTvShows,
} from "@/lib/tmdb";
import type { Movie, MediaType } from "@/lib/types";

import { useAuth } from "@/hooks/useAuth";
import { getLists, updateUserLists } from "@/actions/user";
import LightRays from "@/components/layout/LightRays";
import { HeroSearch } from "@/components/media/HeroSearch";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/layout/theme-context";
import { getHeroContent, getRandomPlaceholder } from "@/lib/hero-content";
import { useListManager } from "@/hooks/useListManager";

type ListType = "watchlist" | "watching" | "watched";
type TabType = "movies" | "tv";

export default function Home() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState<TabType>("tv");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Hero Content State
  const [heroTitle, setHeroTitle] = React.useState("Viva la Stream Track!");
  const [heroPlaceholder, setHeroPlaceholder] = React.useState("What are you in the mood for?");

  // Initialize dynamic content on mount
  React.useEffect(() => {
    const { title } = getHeroContent();
    setHeroTitle(title);
    setHeroPlaceholder(getRandomPlaceholder());
  }, [router]);

  // Instant Search State
  const [searchResults, setSearchResults] = React.useState<Movie[]>([]);
  const [isSearchLoading, setIsSearchLoading] = React.useState(false);

  // Fetch logic variables
  const [trendingMovies, setTrendingMovies] = React.useState<Movie[]>([]);
  const [trendingTv, setTrendingTv] = React.useState<Movie[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = React.useState(false);
  const [trendingError, setTrendingError] = React.useState<string | null>(null);
  const [popularTv, setPopularTv] = React.useState<Movie[]>([]);
  const [airingTodayTv, setAiringTodayTv] = React.useState<Movie[]>([]);
  const [isPopularTvLoading, setIsPopularTvLoading] = React.useState(false);
  const [popularTvError, setPopularTvError] = React.useState<string | null>(null);
  const [isAiringTodayLoading, setIsAiringTodayLoading] = React.useState(false);
  const [airingTodayError, setAiringTodayError] = React.useState<string | null>(null);
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = React.useState<{
    id: number;
    media_type: MediaType;
  } | null>(null);
  const {
    watchlist,
    watching,
    watched,
    setWatchlist,
    setWatching,
    setWatched,
    handleListUpdate,
    isMovieInList,
    updateMovieProgress
  } = useListManager();

  // Instant Search Effect
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearchLoading(true);
    const handler = setTimeout(async () => {
      try {
        const results = await searchMulti(searchQuery);
        setSearchResults(results.slice(0, 5)); // Limit to top 5 results
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);


  // Trending fetch (only today)
  React.useEffect(() => {
    setIsTrendingLoading(true);
    setTrendingError(null);
    Promise.all([fetchTrendingMovies("day"), fetchTrendingTv("day")])
      .then(([movies, tv]) => {
        setTrendingMovies(movies);
        setTrendingTv(tv);
        setTrendingError(null);
      })
      .catch((error) => {
        console.error("Failed to fetch trending content:", error);
        setTrendingMovies([]);
        setTrendingTv([]);
        setTrendingError("Unable to load trending content. Please check your connection and try again.");
      })
      .finally(() => setIsTrendingLoading(false));
  }, []);

  // Popular TV fetch
  React.useEffect(() => {
    setIsPopularTvLoading(true);
    setPopularTvError(null);
    fetchPopularTvShows()
      .then((shows) => {
        setPopularTv(shows);
        setPopularTvError(null);
      })
      .catch((error) => {
        console.error("Failed to fetch popular TV shows:", error);
        setPopularTv([]);
        setPopularTvError("Unable to load popular TV shows. Please check your connection and try again.");
      })
      .finally(() => setIsPopularTvLoading(false));
  }, []);

  // Airing Today TV fetch
  React.useEffect(() => {
    setIsAiringTodayLoading(true);
    setAiringTodayError(null);
    fetchAiringTodayTvShows()
      .then((shows) => {
        setAiringTodayTv(shows);
        setAiringTodayError(null);
      })
      .catch((error) => {
        console.error("Failed to fetch airing today TV shows:", error);
        setAiringTodayTv([]);
        setAiringTodayError("Unable to load TV shows airing today. Please check your connection and try again.");
      })
      .finally(() => setIsAiringTodayLoading(false));
  }, []);



  const handleMovieClick = React.useCallback(
    (id: number, media_type: MediaType) => {
      setSelectedItem({ id, media_type });
    },
    []
  );

  const handleCloseModal = React.useCallback(() => {
    setSelectedItem(null);
  }, []);

  const headerLists = React.useMemo(
    () => ({ watchlist, watching, watched }),
    [watchlist, watching, watched]
  );

  const fetchPopularMoviesCallback = React.useCallback(
    async () =>
      (await fetchPopularMovies()).map((m) => ({
        ...m,
        media_type: "movie" as const,
      })),
    []
  );

  const fetchTopRatedMoviesCallback = React.useCallback(
    async () =>
      (await fetchTopRatedMovies()).map((m) => ({
        ...m,
        media_type: "movie" as const,
      })),
    []
  );

  const fetchTopRatedTvShowsCallback = React.useCallback(
    async () =>
      (await fetchTopRatedTvShows()).map((m) => ({
        ...m,
        media_type: "tv" as const,
      })),
    []
  );

  const fetchUpcomingMoviesCallback = React.useCallback(
    async () =>
      (await fetchUpcomingMovies()).map((m) => ({
        ...m,
        media_type: "movie" as const,
      })),
    []
  );

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (

    <div className="flex min-h-screen flex-col relative bg-background selection:bg-primary/30">
      <Header lists={headerLists} onListUpdate={handleListUpdate} updateMovieProgress={updateMovieProgress} setWatched={setWatched} />

      {/* LightRays Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] md:h-[800px] pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-10" />
        <LightRays
          raysOrigin="top-center"
          raysColor={currentTheme.cssVars?.["--flare-hex"] || "#4f46e5"}
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
        />
      </div>

      <main className="flex-1 space-y-8 md:space-y-12 py-8 relative z-10">

        {/* Hero Content */}
        <div className="flex flex-col items-center justify-center pt-24 md:pt-32 pb-8 space-y-6 md:space-y-8 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/50 animate-in fade-in zoom-in-50 duration-1000 px-4">
            {heroTitle}
          </h1>

          <HeroSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
            placeholder={heroPlaceholder}
            className="w-full max-w-xl px-2 md:px-0"
            searchResults={searchResults}
            isLoading={isSearchLoading}
            onResultClick={handleMovieClick}
          />

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-4 md:mt-8 flex-wrap justify-center">
            <button
              onClick={() => setActiveTab("tv")}
              className={cn(
                "px-4 py-1.5 md:px-6 md:py-2 rounded-full text-sm md:text-lg font-medium transition-all duration-300",
                activeTab === "tv"
                  ? "bg-primary/20 text-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              TV Shows
            </button>
            <button
              onClick={() => setActiveTab("movies")}
              className={cn(
                "px-4 py-1.5 md:px-6 md:py-2 rounded-full text-sm md:text-lg font-medium transition-all duration-300",
                activeTab === "movies"
                  ? "bg-primary/20 text-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              Movies
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="min-h-[500px] animate-in slide-in-from-bottom-8 fade-in duration-700">

          {activeTab === "movies" && (
            <section className="space-y-6 md:space-y-8">
              <MovieRow
                title="Trending Movies"
                movies={trendingMovies.map((m) => ({ ...m, media_type: "movie" }))}
                onMovieClick={handleMovieClick}
                isLoading={isTrendingLoading}
                error={trendingError}
                onRetry={() => {
                  setTrendingError(null);
                  setIsTrendingLoading(true);
                  Promise.all([fetchTrendingMovies("day"), fetchTrendingTv("day")])
                    .then(([movies, tv]) => {
                      setTrendingMovies(movies);
                      setTrendingTv(tv);
                      setTrendingError(null);
                    })
                    .catch((error) => {
                      console.error("Failed to fetch trending content:", error);
                      setTrendingError("Unable to load trending content. Please check your connection and try again.");
                    })
                    .finally(() => setIsTrendingLoading(false));
                }}
                horizontal={true}
              />
              <MovieRow
                title="Popular Movies"
                fetchFunction={fetchPopularMoviesCallback}
                onMovieClick={handleMovieClick}
                horizontal={true}
              />
              <MovieRow
                title="Top Rated Movies"
                fetchFunction={fetchTopRatedMoviesCallback}
                onMovieClick={handleMovieClick}
                horizontal={true}
              />
              <BrowseSection
                title="Browse Movies by Genre"
                mediaType="movie"
                onMovieClick={handleMovieClick}
              />
              <MovieRow
                title="Upcoming Movies"
                fetchFunction={fetchUpcomingMoviesCallback}
                onMovieClick={handleMovieClick}
                horizontal={true}
              />
            </section>
          )}

          {activeTab === "tv" && (
            <section className="space-y-6 md:space-y-8">
              <MovieRow
                title="Trending TV Shows"
                movies={trendingTv.map((m) => ({ ...m, media_type: "tv" }))}
                onMovieClick={handleMovieClick}
                isLoading={isTrendingLoading}
                error={trendingError}
                onRetry={() => {
                  setTrendingError(null);
                  setIsTrendingLoading(true);
                  Promise.all([fetchTrendingMovies("day"), fetchTrendingTv("day")])
                    .then(([movies, tv]) => {
                      setTrendingMovies(movies);
                      setTrendingTv(tv);
                      setTrendingError(null);
                    })
                    .catch((error) => {
                      console.error("Failed to fetch trending content:", error);
                      setTrendingError("Unable to load trending content. Please check your connection and try again.");
                    })
                    .finally(() => setIsTrendingLoading(false));
                }}
                horizontal={true}
              />
              <MovieRow
                title="Popular TV Shows"
                movies={popularTv.map((m) => ({ ...m, media_type: "tv" }))}
                onMovieClick={handleMovieClick}
                isLoading={isPopularTvLoading}
                error={popularTvError}
                onRetry={() => {
                  setPopularTvError(null);
                  setIsPopularTvLoading(true);
                  fetchPopularTvShows()
                    .then((shows) => {
                      setPopularTv(shows);
                      setPopularTvError(null);
                    })
                    .catch((error) => {
                      console.error("Failed to fetch popular TV shows:", error);
                      setPopularTvError("Unable to load popular TV shows. Please check your connection and try again.");
                    })
                    .finally(() => setIsPopularTvLoading(false));
                }}
                horizontal={true}
              />
              <MovieRow
                title="Top Rated TV Shows"
                fetchFunction={fetchTopRatedTvShowsCallback}
                onMovieClick={handleMovieClick}
                horizontal={true}
              />
              <BrowseSection
                title="Browse TV Shows by Genre"
                mediaType="tv"
                onMovieClick={handleMovieClick}
              />
              <MovieRow
                title="TV Shows Airing Today"
                movies={airingTodayTv.map((m) => ({ ...m, media_type: "tv" }))}
                onMovieClick={handleMovieClick}
                isLoading={isAiringTodayLoading}
                error={airingTodayError}
                onRetry={() => {
                  setAiringTodayError(null);
                  setIsAiringTodayLoading(true);
                  fetchAiringTodayTvShows()
                    .then((shows) => {
                      setAiringTodayTv(shows);
                      setAiringTodayError(null);
                    })
                    .catch((error) => {
                      console.error("Failed to fetch airing today TV shows:", error);
                      setAiringTodayError("Unable to load TV shows airing today. Please check your connection and try again.");
                    })
                    .finally(() => setIsAiringTodayLoading(false));
                }}
                horizontal={true}
              />
            </section>
          )}
        </div>

      </main>
      <MovieModal
        movieId={selectedItem?.id ?? null}
        mediaType={selectedItem?.media_type ?? null}
        isOpen={!!selectedItem}
        onClose={handleCloseModal}
        onListUpdate={handleListUpdate}
        isMovieInList={isMovieInList}
        onMovieSelect={handleMovieClick}
        userMovie={
          watching.find((m) => m.id === selectedItem?.id) ||
          watched.find((m) => m.id === selectedItem?.id) ||
          watchlist.find((m) => m.id === selectedItem?.id)
        }
        updateMovieProgress={updateMovieProgress}
      />
    </div>
  );
}
