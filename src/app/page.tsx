"use client";

import * as React from "react";
import { Header } from "@/components/Header";
import { MovieRow } from "@/components/MovieRow";
import { MovieModal } from "@/components/MovieModal";
import { BrowseSection } from "@/components/BrowseSection";
import {
  fetchTrendingMovies,
  fetchTrendingTv,
  fetchPopularTvShows,
  fetchAiringTodayTvShows,
} from "@/lib/fetchTvAndTrending";
import {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  searchMulti,
} from "@/lib/tmdb";
import { fetchTopRatedTvShows } from "@/lib/fetchTopRatedTvShows";
import type { Movie, MediaType } from "@/lib/types";

import { useAuth } from "@/hooks/useAuth";
import { getLists, updateUserLists } from "@/actions/user";
import LightRays from "@/components/LightRays";
import { HeroSearch } from "@/components/HeroSearch";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type ListType = "watchlist" | "watching" | "watched";
type TabType = "movies" | "tv";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<TabType>("movies");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Instant Search State
  const [searchResults, setSearchResults] = React.useState<Movie[]>([]);
  const [isSearchLoading, setIsSearchLoading] = React.useState(false);

  // Fetch logic variables
  const [trendingMovies, setTrendingMovies] = React.useState<Movie[]>([]);
  const [trendingTv, setTrendingTv] = React.useState<Movie[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = React.useState(false);
  const [popularTv, setPopularTv] = React.useState<Movie[]>([]);
  const [airingTodayTv, setAiringTodayTv] = React.useState<Movie[]>([]);
  const [isPopularTvLoading, setIsPopularTvLoading] = React.useState(false);
  const [isAiringTodayLoading, setIsAiringTodayLoading] = React.useState(false);
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = React.useState<{
    id: number;
    media_type: MediaType;
  } | null>(null);
  const [watchlist, setWatchlist] = React.useState<Movie[]>([]);
  const [watching, setWatching] = React.useState<Movie[]>([]);
  const [watched, setWatched] = React.useState<Movie[]>([]);


  React.useEffect(() => {
    const loadLists = async () => {
      if (user) {
        const { watchlist, watching, watched } = await getLists(user.uid);
        setWatchlist(watchlist);
        setWatching(watching);
        setWatched(watched);
      } else {
        // Clear lists if user logs out
        setWatchlist([]);
        setWatching([]);
        setWatched([]);
        const storedWatchlist = localStorage.getItem("watchlist");
        const storedWatching = localStorage.getItem("watching");
        const storedWatched = localStorage.getItem("watched");
        if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist));
        if (storedWatching) setWatching(JSON.parse(storedWatching));
        if (storedWatched) setWatched(JSON.parse(storedWatched));
      }
    };
    loadLists();
  }, [user]);

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
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [searchQuery]);


  // Trending fetch (only today)
  React.useEffect(() => {
    setIsTrendingLoading(true);
    Promise.all([fetchTrendingMovies("day"), fetchTrendingTv("day")])
      .then(([movies, tv]) => {
        setTrendingMovies(movies);
        setTrendingTv(tv);
      })
      .finally(() => setIsTrendingLoading(false));
  }, []);

  // Popular TV fetch
  React.useEffect(() => {
    setIsPopularTvLoading(true);
    fetchPopularTvShows()
      .then(setPopularTv)
      .finally(() => setIsPopularTvLoading(false));
  }, []);

  // Airing Today TV fetch
  React.useEffect(() => {
    setIsAiringTodayLoading(true);
    fetchAiringTodayTvShows()
      .then(setAiringTodayTv)
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

  const isMovieInList = React.useCallback(
    (movieId: number, list: ListType) => {
      const listMap = {
        watchlist,
        watching,
        watched,
      };
      return listMap[list].some((m) => m.id === movieId);
    },
    [watchlist, watching, watched]
  );

  const updateLocalStorage = React.useCallback((key: ListType, data: Movie[]) => {
    if (!user) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, [user]);

  const handleListUpdate = React.useCallback(
    async (movie: Movie, list: ListType) => {
      let newWatchlist = [...watchlist];
      let newWatching = [...watching];
      let newWatched = [...watched];

      const lists: Record<
        ListType,
        {
          state: Movie[];
          setter: React.Dispatch<React.SetStateAction<Movie[]>>;
        }
      > = {
        watchlist: { state: newWatchlist, setter: setWatchlist },
        watching: { state: newWatching, setter: setWatching },
        watched: { state: newWatched, setter: setWatched },
      };

      const otherLists = (Object.keys(lists) as ListType[]).filter(
        (l) => l !== list
      );

      // Remove from other lists
      otherLists.forEach((listName) => {
        const updatedList = lists[listName].state.filter(
          (m) => m.id !== movie.id
        );
        lists[listName].setter(updatedList);
        if (listName === "watchlist") newWatchlist = updatedList;
        if (listName === "watching") newWatching = updatedList;
        if (listName === "watched") newWatched = updatedList;
      });

      const targetList = lists[list];
      const movieIndex = targetList.state.findIndex((m) => m.id === movie.id);

      if (movieIndex > -1) {
        // Remove from target list if it's already there (toggle off)
        const updatedList = targetList.state.filter((m) => m.id !== movie.id);
        targetList.setter(updatedList);
        if (list === "watchlist") newWatchlist = updatedList;
        if (list === "watching") newWatching = updatedList;
        if (list === "watched") newWatched = updatedList;
      } else {
        // Add to target list
        const updatedList = [...targetList.state, movie];
        targetList.setter(updatedList);
        if (list === "watchlist") newWatchlist = updatedList;
        if (list === "watching") newWatching = updatedList;
        if (list === "watched") newWatched = updatedList;
      }

      if (user) {
        await updateUserLists(user.uid, {
          watchlist: newWatchlist,
          watching: newWatching,
          watched: newWatched,
        });
      } else {
        updateLocalStorage("watchlist", newWatchlist);
        updateLocalStorage("watching", newWatching);
        updateLocalStorage("watched", newWatched);
      }
    },
    [watchlist, watching, watched, user, updateLocalStorage]
  );

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
    <div className="flex min-h-screen flex-col relative bg-black selection:bg-purple-500/30">
      <Header lists={headerLists} onListUpdate={handleListUpdate} />

      {/* LightRays Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] md:h-[800px] pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-10" />
        <LightRays
          raysOrigin="top-center"
          raysColor="#4f46e5"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
        />
      </div>

      <main className="flex-1 space-y-8 md:space-y-12 py-8 relative z-10">

        {/* Hero Content */}
        <div className="flex flex-col items-center justify-center pt-16 md:pt-24 pb-8 space-y-6 md:space-y-8 px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/50 animate-in fade-in zoom-in-50 duration-1000 px-4">
            Viva la Stream Track!
          </h1>

          <HeroSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
            placeholder="What are you in the mood for?"
            className="w-full max-w-xl px-2 md:px-0"
            searchResults={searchResults}
            isLoading={isSearchLoading}
            onResultClick={handleMovieClick}
          />

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-4 md:mt-8 flex-wrap justify-center">
            <button
              onClick={() => setActiveTab("movies")}
              className={cn(
                "px-4 py-1.5 md:px-6 md:py-2 rounded-full text-sm md:text-lg font-medium transition-all duration-300",
                activeTab === "movies"
                  ? "bg-purple-600/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              Movies
            </button>
            <button
              onClick={() => setActiveTab("tv")}
              className={cn(
                "px-4 py-1.5 md:px-6 md:py-2 rounded-full text-sm md:text-lg font-medium transition-all duration-300",
                activeTab === "tv"
                  ? "bg-purple-600/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              TV Shows
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
                horizontal={true}
              />
              <MovieRow
                title="Popular TV Shows"
                movies={popularTv.map((m) => ({ ...m, media_type: "tv" }))}
                onMovieClick={handleMovieClick}
                isLoading={isPopularTvLoading}
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
      />
    </div>
  );
}
