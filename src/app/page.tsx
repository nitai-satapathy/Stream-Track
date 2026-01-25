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
import { getRecommendations } from "@/ai/flows/recommendation-flow";
import { useAuth } from "@/hooks/useAuth";
import { getLists, updateUserLists } from "@/actions/user";

type ListType = "watchlist" | "watching" | "watched";

export default function Home() {
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
  const [recommendations, setRecommendations] = React.useState<Movie[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] =
    React.useState(false);

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

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      if (watched.length === 0 && watching.length === 0) {
        setRecommendations([]);
        return;
      }
      setIsRecommendationsLoading(true);
      try {
        const watchedTitles = watched
          .map((m) => m.title || m.name)
          .filter(Boolean) as string[];
        const watchingTitles = watching
          .map((m) => m.title || m.name)
          .filter(Boolean) as string[];
        const result = await getRecommendations({
          watched: watchedTitles,
          watching: watchingTitles,
        });
        if (result.recommendations) {
          const moviePromises = result.recommendations.map(async (rec) => {
            const searchResults = await searchMulti(rec.title);
            return (
              searchResults.find(
                (item) =>
                  item.media_type === "movie" || item.media_type === "tv"
              ) || null
            );
          });
          const recommendedMovies = (await Promise.all(moviePromises)).filter(
            Boolean
          ) as Movie[];
          setRecommendations(recommendedMovies);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsRecommendationsLoading(false);
      }
    };
    const timer = setTimeout(fetchRecommendations, 1000);
    return () => clearTimeout(timer);
  }, [watched, watching]);

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

  return (
    <div className="flex min-h-screen flex-col">
      <Header lists={headerLists} onListUpdate={handleListUpdate} />
      <main className="flex-1 space-y-6 py-4 md:space-y-12 md:py-8">
        {/* Trending Today Section */}
        <section>
          <MovieRow
            title="Trending Movies Today"
            movies={trendingMovies.map((m) => ({ ...m, media_type: "movie" }))}
            onMovieClick={handleMovieClick}
            isLoading={isTrendingLoading}
            horizontal={true}
          />
          <div className="mt-8" />
          <MovieRow
            title="Trending TV Shows Today"
            movies={trendingTv.map((m) => ({ ...m, media_type: "tv" }))}
            onMovieClick={handleMovieClick}
            isLoading={isTrendingLoading}
            horizontal={true}
          />
        </section>
        {/* Popular Movies */}
        <MovieRow
          title="Popular Movies"
          fetchFunction={fetchPopularMoviesCallback}
          onMovieClick={handleMovieClick}
          horizontal={true}
        />
        {/* Popular TV Shows */}
        <MovieRow
          title="Popular TV Shows"
          movies={popularTv.map((m) => ({ ...m, media_type: "tv" }))}
          onMovieClick={handleMovieClick}
          isLoading={isPopularTvLoading}
          horizontal={true}
        />
        {/* Top Rated Movies */}
        <MovieRow
          title="Top Rated Movies"
          fetchFunction={fetchTopRatedMoviesCallback}
          onMovieClick={handleMovieClick}
          horizontal={true}
        />
        {/* Top Rated TV Shows */}
        <MovieRow
          title="Top Rated TV Shows"
          fetchFunction={fetchTopRatedTvShowsCallback}
          onMovieClick={handleMovieClick}
          horizontal={true}
        />
        {/* Browse Movies by Genre */}
        <BrowseSection
          title="Browse Movies by Genre"
          mediaType="movie"
          onMovieClick={handleMovieClick}
        />

        {/* Browse TV by Genre */}
        <BrowseSection
          title="Browse TV Shows by Genre"
          mediaType="tv"
          onMovieClick={handleMovieClick}
        />

        {/* Upcoming Movies */}
        <MovieRow
          title="Upcoming Movies"
          fetchFunction={fetchUpcomingMoviesCallback}
          onMovieClick={handleMovieClick}
          horizontal={true}
        />
        {/* TV Shows Airing Today */}
        <MovieRow
          title="TV Shows Airing Today"
          movies={airingTodayTv.map((m) => ({ ...m, media_type: "tv" }))}
          onMovieClick={handleMovieClick}
          isLoading={isAiringTodayLoading}
          horizontal={true}
        />
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
