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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Film, Tv } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Caching logic for 24h
const getCacheKey = (section: string) => `rec_cache_v2_${section}`;
const getCache = (section: string) => {
  try {
    const raw = localStorage.getItem(getCacheKey(section));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.data || !parsed.timestamp) return null;
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) return null;
    return parsed.data as Movie[];
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

const mapToContext = (m: Movie) => ({
  id: m.id,
  title: m.title || m.name || "",
  media_type: (m.media_type || "movie") as "movie" | "tv",
  genres: m.genres?.map((g) => g.name) || [],
  release_date: m.release_date || m.first_air_date || "",
  vote_average: m.vote_average,
});

const fetchRecs = async (
  items: Movie[],
  contextType: "watched" | "watching" | "watchlist",
  section: string,
  forcedMediaType?: "movie" | "tv",
  force = false
): Promise<Movie[]> => {
  if (!force) {
    const cached = getCache(section);
    if (cached) return cached;
  }
  if (items.length === 0) return [];

  try {
    const input = {
      watched: contextType === "watched" ? items.map(mapToContext) : [],
      watching: contextType === "watching" ? items.map(mapToContext) : [],
      watchlist: contextType === "watchlist" ? items.map(mapToContext) : [],
      forcedMediaType,
    };

    const result = await getRecommendations(input);

    if (result.recommendations) {
      const moviePromises = result.recommendations.map(async (rec): Promise<Movie | null> => {
        try {
          let movie: Movie | null = null;

          if (rec.tmdb_id) {
            const searchResults = await searchMulti(rec.title);
            movie = searchResults.find(m => m.id === rec.tmdb_id) || searchResults[0];
          } else {
            const searchResults = await searchMulti(rec.title);
            if (forcedMediaType) {
              movie = searchResults.find(m => m.media_type === forcedMediaType) || null;
              if (!movie && searchResults.length > 0) {
                const candidate = searchResults[0];
                if (candidate.media_type === forcedMediaType) movie = candidate;
              }
            } else {
              movie = searchResults[0];
            }
          }

          if (movie) {
            return {
              ...movie,
              ai_explanation: rec.reason,
              overview: rec.reason
            };
          }
        } catch (e) {
          console.error("Error fetching details for rec:", rec.title, e);
        }
        return null;
      });

      const resolved = (await Promise.all(moviePromises)).filter((m): m is Movie => !!m);

      const inputIds = new Set(items.map(i => i.id));
      const filtered = resolved.filter(m => !inputIds.has(m.id));

      setCache(section, filtered);
      return filtered;
    }
  } catch (error) {
    console.error("Error in fetchRecs:", error);
    throw error;
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
    ai_explanation?: string;
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
      fetchRecs(watchedMovies, "watched", "watchedMovies", "movie")
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
      fetchRecs(watchedTV, "watched", "watchedTV", "tv")
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
      fetchRecs(watchlistMovies, "watchlist", "watchlistMovies", "movie")
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
      fetchRecs(watchlistTV, "watchlist", "watchlistTV", "tv")
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
  }, [watchlist, watched]);

  // Manual refresh handlers
  const handleRefresh = useCallback(
    async (
      section:
        | "watchedMovies"
        | "watchedTV"
        | "watchlistMovies"
        | "watchlistTV",
      items: Movie[],
      contextType: "watched" | "watchlist",
      mediaType: "movie" | "tv",
      setter: (data: Movie[]) => void,
      setLoading: (b: boolean) => void
    ) => {
      setRefreshing((r) => ({ ...r, [section]: true }));
      setLoading(true);
      const data = await fetchRecs(items, contextType, section, mediaType, true);
      setter(data);
      setLoading(false);
      setRefreshing((r) => ({ ...r, [section]: false }));
    },
    []
  );

  const handleMovieClick = useCallback((id: number, media_type: MediaType) => {
    const allRecs = [
      ...recWatchedMovies,
      ...recWatchedTV,
      ...recWatchlistMovies,
      ...recWatchlistTV,
    ];
    const movie = allRecs.find((m) => m.id === id);
    setSelectedItem({
      id,
      media_type,
      ai_explanation: movie?.ai_explanation
    });
  }, [recWatchedMovies, recWatchedTV, recWatchlistMovies, recWatchlistTV]);

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


  /* Quick Actions Logic */
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDismissed = localStorage.getItem("dismissed_recs");
      if (storedDismissed) {
        try {
          setDismissedIds(new Set(JSON.parse(storedDismissed)));
        } catch (e) {
          console.error("Failed to parse dismissed recs", e);
        }
      }
    }
  }, []);

  const handleDismiss = useCallback((id: number) => {
    setDismissedIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      localStorage.setItem("dismissed_recs", JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  }, []);

  const handleQuickAdd = useCallback((movie: Movie) => {
    handleListUpdate(movie, "watchlist");
  }, [handleListUpdate]);

  const handleQuickWatched = useCallback((movie: Movie) => {
    handleListUpdate(movie, "watched");
  }, [handleListUpdate]);

  const checkIsWatchlist = useCallback((id: number) => {
    return watchlist.some(m => m.id === id);
  }, [watchlist]);

  const checkIsWatched = useCallback((id: number) => {
    return watched.some(m => m.id === id);
  }, [watched]);

  return (
    <>
      <Header
        lists={headerLists}
        onListUpdate={handleListUpdate}
        setWatched={setWatched}
      />
      <div className="container mx-auto space-y-10 py-8 pt-24 md:pt-28">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">For You</h1>
        </div>
        <p className="mb-8 text-lg text-muted-foreground">
          AI-powered recommendations based on your unique taste.
        </p>
        {(() => {
          const watchedIds = new Set(watched.map((m) => m.id));
          const watchlistIds = new Set(watchlist.map((m) => m.id));
          const filterRecs = (recs: Movie[]) =>
            recs.filter(
              (m) => !watchedIds.has(m.id) && !watchlistIds.has(m.id) && !dismissedIds.has(m.id)
            );

          const hasWatchedMovies = watched.some(
            (m) => m.media_type === "movie" || (!m.media_type && m.title)
          );
          const hasWatchlistMovies = watchlist.some(
            (m) => m.media_type === "movie" || (!m.media_type && m.title)
          );
          const hasWatchedTV = watched.some((m) => m.media_type === "tv" || m.name);
          const hasWatchlistTV = watchlist.some((m) => m.media_type === "tv" || m.name);

          return (
            <Tabs defaultValue="movies" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] h-12 bg-background/50 border border-white/10 backdrop-blur-md p-1 rounded-full">
                  <TabsTrigger
                    value="movies"
                    className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                  >
                    Movies
                  </TabsTrigger>
                  <TabsTrigger
                    value="tv"
                    className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                  >
                    TV Shows
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="movies" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {hasWatchedMovies ? (
                  <MovieRow
                    title="Based on your Watch History"
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
                      fetchRecs(watchedMovies, "watched", "watchedMovies", "movie", true)
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
                    horizontal={false}
                    onRefresh={() =>
                      handleRefresh(
                        "watchedMovies",
                        watched.filter(
                          (m) =>
                            m.media_type === "movie" ||
                            (!m.media_type && m.title)
                        ),
                        "watched",
                        "movie",
                        setRecWatchedMovies,
                        setLoadingWatchedMovies
                      )
                    }
                    refreshing={refreshing.watchedMovies}
                    // Quick Actions
                    onDismiss={handleDismiss}
                    onQuickAdd={handleQuickAdd}
                    onQuickWatched={handleQuickWatched}
                    checkIsWatchlist={checkIsWatchlist}
                    checkIsWatched={checkIsWatched}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 animate-in fade-in zoom-in-50 duration-500">
                    <div className="bg-primary/10 p-4 rounded-full">
                      <Film className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">No Movie Context Yet</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        Start watching movies to unlock personalized AI recommendations.
                      </p>
                    </div>
                    <Button asChild variant="outline">
                      <Link href="/">Browse Movies</Link>
                    </Button>
                  </div>
                )}

                {hasWatchlistMovies && (
                  <MovieRow
                    title="Based on your Watchlist"
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
                      fetchRecs(watchlistMovies, "watchlist", "watchlistMovies", "movie", true)
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
                    horizontal={false}
                    onRefresh={() =>
                      handleRefresh(
                        "watchlistMovies",
                        watchlist.filter(
                          (m) =>
                            m.media_type === "movie" ||
                            (!m.media_type && m.title)
                        ),
                        "watchlist",
                        "movie",
                        setRecWatchlistMovies,
                        setLoadingWatchlistMovies
                      )
                    }
                    refreshing={refreshing.watchlistMovies}
                    // Quick Actions
                    onDismiss={handleDismiss}
                    onQuickAdd={handleQuickAdd}
                    onQuickWatched={handleQuickWatched}
                    checkIsWatchlist={checkIsWatchlist}
                    checkIsWatched={checkIsWatched}
                  />
                )}
              </TabsContent>

              <TabsContent value="tv" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {hasWatchedTV ? (
                  <MovieRow
                    title="Based on your Watch History"
                    movies={filterRecs(recWatchedTV)}
                    onMovieClick={handleMovieClick}
                    isLoading={loadingWatchedTV}
                    error={errorWatchedTV}
                    onRetry={() => {
                      const watchedTV = watched.filter((m) => m.media_type === "tv" || m.name);
                      setLoadingWatchedTV(true);
                      setErrorWatchedTV(null);
                      fetchRecs(watchedTV, "watched", "watchedTV", "tv", true)
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
                    horizontal={false}
                    onRefresh={() =>
                      handleRefresh(
                        "watchedTV",
                        watched.filter((m) => m.media_type === "tv" || m.name),
                        "watched",
                        "tv",
                        setRecWatchedTV,
                        setLoadingWatchedTV
                      )
                    }
                    refreshing={refreshing.watchedTV}
                    // Quick Actions
                    onDismiss={handleDismiss}
                    onQuickAdd={handleQuickAdd}
                    onQuickWatched={handleQuickWatched}
                    checkIsWatchlist={checkIsWatchlist}
                    checkIsWatched={checkIsWatched}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 animate-in fade-in zoom-in-50 duration-500">
                    <div className="bg-primary/10 p-4 rounded-full">
                      <Tv className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">No TV Show Context Yet</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        Start watching TV shows to unlock personalized AI recommendations.
                      </p>
                    </div>
                    <Button asChild variant="outline">
                      <Link href="/?tab=tv">Browse TV Shows</Link>
                    </Button>
                  </div>
                )}

                {hasWatchlistTV && (
                  <MovieRow
                    title="Based on your Watchlist"
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
                      fetchRecs(watchlistTV, "watchlist", "watchlistTV", "tv", true)
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
                    horizontal={false}
                    onRefresh={() =>
                      handleRefresh(
                        "watchlistTV",
                        watchlist.filter((m) => m.media_type === "tv" || m.name),
                        "watchlist",
                        "tv",
                        setRecWatchlistTV,
                        setLoadingWatchlistTV
                      )
                    }
                    refreshing={refreshing.watchlistTV}
                    onDismiss={handleDismiss}
                    onQuickAdd={handleQuickAdd}
                    onQuickWatched={handleQuickWatched}
                    checkIsWatchlist={checkIsWatchlist}
                    checkIsWatched={checkIsWatched}
                  />
                )}
              </TabsContent>
            </Tabs>
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
            aiExplanation={selectedItem.ai_explanation}
          />
        )}
      </div>
    </>
  );
};
export default RecommendationPage;
