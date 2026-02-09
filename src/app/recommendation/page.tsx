"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { MovieRow } from "@/components/MovieRow";
import { MovieModal } from "@/components/MovieModal";
import { useAuth } from "@/hooks/useAuth";
import { getLists } from "@/actions/user";
import { getRecommendations } from "@/ai/flows/recommendation-flow";
import { searchMulti } from "@/lib/tmdb";
import type { Movie, MediaType } from "@/lib/types";

// Caching logic for 24h
const getCacheKey = (section: string) => `rec_cache_${section}`;
const getCache = (section: string) => {
  try {
    const raw = localStorage.getItem(getCacheKey(section));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.data || !parsed.timestamp) return null;
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) return null;
    return parsed.data;
  } catch {
    return null;
  }
};
const setCache = (section: string, data: Movie[]) => {
  localStorage.setItem(
    getCacheKey(section),
    JSON.stringify({ data, timestamp: Date.now() })
  );
};
const fetchRecs = async (
  titles: string[],
  type: MediaType,
  section: string,
  force = false
) => {
  if (!force) {
    const cached = getCache(section);
    if (cached) return cached;
  }
  if (titles.length === 0) return [];
  const result = await getRecommendations({ watched: titles, watching: [] });
  if (result.recommendations) {
    const moviePromises = result.recommendations.map(async (rec) => {
      const searchResults = await searchMulti(rec.title);
      return (
        searchResults.find(
          (item) => item.media_type === "movie" || item.media_type === "tv"
        ) || null
      );
    });
    // Strictly filter by type here
    const filtered = (await Promise.all(moviePromises)).filter(
      (m): m is Movie => !!m && m.media_type === type
    ) as Movie[];
    setCache(section, filtered);
    return filtered;
  }
  return [];
};

const RecommendationPage = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = React.useState<Movie[]>([]);
  const [watching, setWatching] = React.useState<Movie[]>([]);
  const [watched, setWatched] = React.useState<Movie[]>([]);
  const [recWatchedMovies, setRecWatchedMovies] = useState<Movie[]>([]);
  const [recWatchedTV, setRecWatchedTV] = useState<Movie[]>([]);
  const [recWatchlistMovies, setRecWatchlistMovies] = useState<Movie[]>([]);
  const [recWatchlistTV, setRecWatchlistTV] = useState<Movie[]>([]);
  const [loadingWatchedMovies, setLoadingWatchedMovies] = useState(false);
  const [loadingWatchedTV, setLoadingWatchedTV] = useState(false);
  const [loadingWatchlistMovies, setLoadingWatchlistMovies] = useState(false);
  const [loadingWatchlistTV, setLoadingWatchlistTV] = useState(false);
  const [errorWatchedMovies, setErrorWatchedMovies] = useState<string | null>(null);
  const [errorWatchedTV, setErrorWatchedTV] = useState<string | null>(null);
  const [errorWatchlistMovies, setErrorWatchlistMovies] = useState<string | null>(null);
  const [errorWatchlistTV, setErrorWatchlistTV] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState({
    watchedMovies: false,
    watchedTV: false,
    watchlistMovies: false,
    watchlistTV: false,
  });
  const [selectedItem, setSelectedItem] = React.useState<{
    id: number;
    media_type: MediaType;
  } | null>(null);

  React.useEffect(() => {
    const loadLists = async () => {
      if (user) {
        const { watchlist, watching, watched } = await getLists(user.uid);
        setWatchlist(watchlist);
        setWatching(watching);
        setWatched(watched);
      } else {
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


  // Initial load: only fetch if no cache or cache expired
  useEffect(() => {
    // Watched Movies
    const watchedMovies = watched.filter(
      (m) => m.media_type === "movie" || (!m.media_type && m.title)
    );
    if (watchedMovies.length > 0) {
      setLoadingWatchedMovies(true);
      setErrorWatchedMovies(null);
      fetchRecs(
        watchedMovies.map((m) => m.title || m.name).filter(Boolean) as string[],
        "movie",
        "watchedMovies"
      )
        .then((recs) => {
          setRecWatchedMovies(recs);
          setErrorWatchedMovies(null);
        })
        .catch((error) => {
          console.error("Failed to fetch recommendations for watched movies:", error);
          setErrorWatchedMovies("Unable to generate recommendations. Please try again later.");
          setRecWatchedMovies([]);
        })
        .finally(() => setLoadingWatchedMovies(false));
    }
    // Watched TV Shows
    const watchedTV = watched.filter((m) => m.media_type === "tv" || m.name);
    if (watchedTV.length > 0) {
      setLoadingWatchedTV(true);
      setErrorWatchedTV(null);
      fetchRecs(
        watchedTV.map((m) => m.name || m.title).filter(Boolean) as string[],
        "tv",
        "watchedTV"
      )
        .then((recs) => {
          setRecWatchedTV(recs);
          setErrorWatchedTV(null);
        })
        .catch((error) => {
          console.error("Failed to fetch recommendations for watched TV:", error);
          setErrorWatchedTV("Unable to generate recommendations. Please try again later.");
          setRecWatchedTV([]);
        })
        .finally(() => setLoadingWatchedTV(false));
    }
    // Watchlist Movies
    const watchlistMovies = watchlist.filter(
      (m) => m.media_type === "movie" || (!m.media_type && m.title)
    );
    if (watchlistMovies.length > 0) {
      setLoadingWatchlistMovies(true);
      setErrorWatchlistMovies(null);
      fetchRecs(
        watchlistMovies.map((m) => m.title || m.name).filter(Boolean) as string[],
        "movie",
        "watchlistMovies"
      )
        .then((recs) => {
          setRecWatchlistMovies(recs);
          setErrorWatchlistMovies(null);
        })
        .catch((error) => {
          console.error("Failed to fetch recommendations for watchlist movies:", error);
          setErrorWatchlistMovies("Unable to generate recommendations. Please try again later.");
          setRecWatchlistMovies([]);
        })
        .finally(() => setLoadingWatchlistMovies(false));
    }
    // Watchlist TV Shows
    const watchlistTV = watchlist.filter(
      (m) => m.media_type === "tv" || m.name
    );
    if (watchlistTV.length > 0) {
      setLoadingWatchlistTV(true);
      setErrorWatchlistTV(null);
      fetchRecs(
        watchlistTV.map((m) => m.name || m.title).filter(Boolean) as string[],
        "tv",
        "watchlistTV"
      )
        .then((recs) => {
          setRecWatchlistTV(recs);
          setErrorWatchlistTV(null);
        })
        .catch((error) => {
          console.error("Failed to fetch recommendations for watchlist TV:", error);
          setErrorWatchlistTV("Unable to generate recommendations. Please try again later.");
          setRecWatchlistTV([]);
        })
        .finally(() => setLoadingWatchlistTV(false));
    }
  }, [watchlist, watched]); // Added missing dependencies

  // Manual refresh handlers
  const handleRefresh = useCallback(
    async (
      section:
        | "watchedMovies"
        | "watchedTV"
        | "watchlistMovies"
        | "watchlistTV",
      titles: string[],
      type: MediaType,
      setter: (data: Movie[]) => void,
      setLoading: (b: boolean) => void
    ) => {
      setRefreshing((r) => ({ ...r, [section]: true }));
      setLoading(true);
      const data = await fetchRecs(titles, type, section, true);
      setter(data);
      setLoading(false);
      setRefreshing((r) => ({ ...r, [section]: false }));
    },
    []
  );

  const handleMovieClick = useCallback((id: number, media_type: MediaType) => {
    setSelectedItem({ id, media_type });
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // List update logic for marking movies
  type ListType = "watchlist" | "watching" | "watched";
  const isMovieInList = useCallback(
    (movieId: number, list: ListType) => {
      const listMap = { watchlist, watching, watched };
      return listMap[list].some((m) => m.id === movieId);
    },
    [watchlist, watching, watched]
  );

  const updateLocalStorage = useCallback((key: ListType, data: Movie[]) => {
    if (!user) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, [user]);

  const handleListUpdate = useCallback(
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
        const { updateUserLists } = await import("@/actions/user");
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

  const headerLists = useMemo(
    () => ({ watchlist, watching, watched }),
    [watchlist, watching, watched]
  );

  return (
    <>
      <Header
        lists={headerLists}
        onListUpdate={handleListUpdate}
        watchedMovies={watched}
        watchedShows={watching}
      />
      <div className="container mx-auto space-y-10 py-8 pt-24 md:pt-28">
        <h1 className="mb-4 text-3xl font-bold">Recommendations</h1>
        <p className="mb-8 text-lg text-gray-600">
          Get personalized movie and TV show recommendations based on your
          activity.
        </p>
        {/* Filter out movies/shows already in watched or watchlist */}
        {(() => {
          const watchedIds = new Set(watched.map((m) => m.id));
          const watchlistIds = new Set(watchlist.map((m) => m.id));
          const filterRecs = (recs: Movie[]) =>
            recs.filter(
              (m) => !watchedIds.has(m.id) && !watchlistIds.has(m.id)
            );
          return (
            <>
              {watched.some(
                (m) => m.media_type === "movie" || (!m.media_type && m.title)
              ) && (
                  <MovieRow
                    title="Recommendations Based on Watched Movies"
                    movies={filterRecs(recWatchedMovies)}
                    onMovieClick={handleMovieClick}
                    isLoading={loadingWatchedMovies}
                    error={errorWatchedMovies}
                    onRetry={() => {
                      const watchedMovies = watched.filter(
                        (m) => m.media_type === "movie" || (!m.media_type && m.title)
                      );
                      setLoadingWatchedMovies(true);
                      setErrorWatchedMovies(null);
                      fetchRecs(
                        watchedMovies.map((m) => m.title || m.name).filter(Boolean) as string[],
                        "movie",
                        "watchedMovies",
                        true
                      )
                        .then((recs) => {
                          setRecWatchedMovies(recs);
                          setErrorWatchedMovies(null);
                        })
                        .catch((error) => {
                          console.error("Failed to fetch recommendations:", error);
                          setErrorWatchedMovies("Unable to generate recommendations. Please try again later.");
                        })
                        .finally(() => setLoadingWatchedMovies(false));
                    }}
                    horizontal={true}
                    onRefresh={() =>
                      handleRefresh(
                        "watchedMovies",
                        watched
                          .filter(
                            (m) =>
                              m.media_type === "movie" ||
                              (!m.media_type && m.title)
                          )
                          .map((m) => m.title || m.name)
                          .filter(Boolean) as string[],
                        "movie",
                        setRecWatchedMovies,
                        setLoadingWatchedMovies
                      )
                    }
                    refreshing={refreshing.watchedMovies}
                  />
                )}
              {watched.some((m) => m.media_type === "tv" || m.name) && (
                <MovieRow
                  title="Recommendations Based on Watched TV Shows"
                  movies={filterRecs(recWatchedTV)}
                  onMovieClick={handleMovieClick}
                  isLoading={loadingWatchedTV}
                  error={errorWatchedTV}
                  onRetry={() => {
                    const watchedTV = watched.filter((m) => m.media_type === "tv" || m.name);
                    setLoadingWatchedTV(true);
                    setErrorWatchedTV(null);
                    fetchRecs(
                      watchedTV.map((m) => m.name || m.title).filter(Boolean) as string[],
                      "tv",
                      "watchedTV",
                      true
                    )
                      .then((recs) => {
                        setRecWatchedTV(recs);
                        setErrorWatchedTV(null);
                      })
                      .catch((error) => {
                        console.error("Failed to fetch recommendations:", error);
                        setErrorWatchedTV("Unable to generate recommendations. Please try again later.");
                      })
                      .finally(() => setLoadingWatchedTV(false));
                  }}
                  horizontal={true}
                  onRefresh={() =>
                    handleRefresh(
                      "watchedTV",
                      watched
                        .filter((m) => m.media_type === "tv" || m.name)
                        .map((m) => m.name || m.title)
                        .filter(Boolean) as string[],
                      "tv",
                      setRecWatchedTV,
                      setLoadingWatchedTV
                    )
                  }
                  refreshing={refreshing.watchedTV}
                />
              )}
              {watchlist.some(
                (m) => m.media_type === "movie" || (!m.media_type && m.title)
              ) && (
                  <MovieRow
                    title="Recommendations Based on Watchlist Movies"
                    movies={filterRecs(recWatchlistMovies)}
                    onMovieClick={handleMovieClick}
                    isLoading={loadingWatchlistMovies}
                    error={errorWatchlistMovies}
                    onRetry={() => {
                      const watchlistMovies = watchlist.filter(
                        (m) => m.media_type === "movie" || (!m.media_type && m.title)
                      );
                      setLoadingWatchlistMovies(true);
                      setErrorWatchlistMovies(null);
                      fetchRecs(
                        watchlistMovies.map((m) => m.title || m.name).filter(Boolean) as string[],
                        "movie",
                        "watchlistMovies",
                        true
                      )
                        .then((recs) => {
                          setRecWatchlistMovies(recs);
                          setErrorWatchlistMovies(null);
                        })
                        .catch((error) => {
                          console.error("Failed to fetch recommendations:", error);
                          setErrorWatchlistMovies("Unable to generate recommendations. Please try again later.");
                        })
                        .finally(() => setLoadingWatchlistMovies(false));
                    }}
                    horizontal={true}
                    onRefresh={() =>
                      handleRefresh(
                        "watchlistMovies",
                        watchlist
                          .filter(
                            (m) =>
                              m.media_type === "movie" ||
                              (!m.media_type && m.title)
                          )
                          .map((m) => m.title || m.name)
                          .filter(Boolean) as string[],
                        "movie",
                        setRecWatchlistMovies,
                        setLoadingWatchlistMovies
                      )
                    }
                    refreshing={refreshing.watchlistMovies}
                  />
                )}
              {watchlist.some((m) => m.media_type === "tv" || m.name) && (
                <MovieRow
                  title="Recommendations Based on Watchlist TV Shows"
                  movies={filterRecs(recWatchlistTV)}
                  onMovieClick={handleMovieClick}
                  isLoading={loadingWatchlistTV}
                  error={errorWatchlistTV}
                  onRetry={() => {
                    const watchlistTV = watchlist.filter(
                      (m) => m.media_type === "tv" || m.name
                    );
                    setLoadingWatchlistTV(true);
                    setErrorWatchlistTV(null);
                    fetchRecs(
                      watchlistTV.map((m) => m.name || m.title).filter(Boolean) as string[],
                      "tv",
                      "watchlistTV",
                      true
                    )
                      .then((recs) => {
                        setRecWatchlistTV(recs);
                        setErrorWatchlistTV(null);
                      })
                      .catch((error) => {
                        console.error("Failed to fetch recommendations:", error);
                        setErrorWatchlistTV("Unable to generate recommendations. Please try again later.");
                      })
                      .finally(() => setLoadingWatchlistTV(false));
                  }}
                  horizontal={true}
                  onRefresh={() =>
                    handleRefresh(
                      "watchlistTV",
                      watchlist
                        .filter((m) => m.media_type === "tv" || m.name)
                        .map((m) => m.name || m.title)
                        .filter(Boolean) as string[],
                      "tv",
                      setRecWatchlistTV,
                      setLoadingWatchlistTV
                    )
                  }
                  refreshing={refreshing.watchlistTV}
                />
              )}
            </>
          );
        })()}
        {selectedItem && (
          <MovieModal
            movieId={selectedItem.id}
            mediaType={selectedItem.media_type}
            isOpen={!!selectedItem}
            onClose={handleCloseModal}
            onListUpdate={handleListUpdate}
            isMovieInList={isMovieInList}
            onMovieSelect={handleMovieClick}
          />
        )}
      </div>
    </>
  );
};
export default RecommendationPage;
