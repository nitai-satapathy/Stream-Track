"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { MovieRow } from '@/components/MovieRow';
import { MovieModal } from '@/components/MovieModal';
import { useAuth } from '@/hooks/useAuth';
import { getUserLists } from '@/lib/firestore';
import { getRecommendations } from '@/ai/flows/recommendation-flow';
import { searchMulti } from '@/lib/tmdb';
import type { Movie, MediaType } from '@/lib/types';

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
  const [refreshing, setRefreshing] = useState({
    watchedMovies: false,
    watchedTV: false,
    watchlistMovies: false,
    watchlistTV: false,
  });
  const [selectedItem, setSelectedItem] = React.useState<{ id: number; media_type: MediaType } | null>(null);

  React.useEffect(() => {
    const loadLists = async () => {
      if (user) {
        const { watchlist, watching, watched } = await getUserLists(user.uid);
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
    } catch { return null; }
  };
  const setCache = (section: string, data: Movie[]) => {
    localStorage.setItem(getCacheKey(section), JSON.stringify({ data, timestamp: Date.now() }));
  };
  const fetchRecs = async (titles: string[], type: MediaType, section: string, force = false) => {
    if (!force) {
      const cached = getCache(section);
      if (cached) return cached;
    }
    if (titles.length === 0) return [];
    const result = await getRecommendations({ watched: titles, watching: [] });
    if (result.recommendations) {
      const moviePromises = result.recommendations.map(async (rec) => {
        const searchResults = await searchMulti(rec.title);
        return searchResults.find(item => item.media_type === 'movie' || item.media_type === 'tv') || null;
      });
      // Strictly filter by type here
      const filtered = (await Promise.all(moviePromises)).filter((m): m is Movie => !!m && m.media_type === type) as Movie[];
      setCache(section, filtered);
      return filtered;
    }
    return [];
  };

  // Initial load: only fetch if no cache or cache expired
  useEffect(() => {
    // Watched Movies
    const watchedMovies = watched.filter(m => m.media_type === 'movie' || (!m.media_type && m.title));
    setLoadingWatchedMovies(true);
    fetchRecs(watchedMovies.map(m => m.title || m.name).filter(Boolean) as string[], 'movie', 'watchedMovies')
      .then(setRecWatchedMovies)
      .finally(() => setLoadingWatchedMovies(false));
    // Watched TV Shows
    const watchedTV = watched.filter(m => m.media_type === 'tv' || m.name);
    setLoadingWatchedTV(true);
    fetchRecs(watchedTV.map(m => m.name || m.title).filter(Boolean) as string[], 'tv', 'watchedTV')
      .then(setRecWatchedTV)
      .finally(() => setLoadingWatchedTV(false));
    // Watchlist Movies
    const watchlistMovies = watchlist.filter(m => m.media_type === 'movie' || (!m.media_type && m.title));
    setLoadingWatchlistMovies(true);
    fetchRecs(watchlistMovies.map(m => m.title || m.name).filter(Boolean) as string[], 'movie', 'watchlistMovies')
      .then(setRecWatchlistMovies)
      .finally(() => setLoadingWatchlistMovies(false));
    // Watchlist TV Shows
    const watchlistTV = watchlist.filter(m => m.media_type === 'tv' || m.name);
    setLoadingWatchlistTV(true);
    fetchRecs(watchlistTV.map(m => m.name || m.title).filter(Boolean) as string[], 'tv', 'watchlistTV')
      .then(setRecWatchlistTV)
      .finally(() => setLoadingWatchlistTV(false));
  }, []); // Only run on mount

  // Manual refresh handlers
  const handleRefresh = useCallback(async (section: 'watchedMovies' | 'watchedTV' | 'watchlistMovies' | 'watchlistTV', titles: string[], type: MediaType, setter: (data: Movie[]) => void, setLoading: (b: boolean) => void) => {
    setRefreshing(r => ({ ...r, [section]: true }));
    setLoading(true);
    const data = await fetchRecs(titles, type, section, true);
    setter(data);
    setLoading(false);
    setRefreshing(r => ({ ...r, [section]: false }));
  }, [fetchRecs]);

  const handleMovieClick = (id: number, media_type: MediaType) => {
    setSelectedItem({ id, media_type });
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  // List update logic for marking movies
  type ListType = "watchlist" | "watching" | "watched";
  const isMovieInList = (movieId: number, list: ListType) => {
    const listMap = { watchlist, watching, watched };
    return listMap[list].some((m) => m.id === movieId);
  };

  const updateLocalStorage = (key: ListType, data: Movie[]) => {
    if (!user) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const handleListUpdate = async (movie: Movie, list: ListType) => {
    let newWatchlist = [...watchlist];
    let newWatching = [...watching];
    let newWatched = [...watched];

    const lists: Record<ListType, {state: Movie[], setter: React.Dispatch<React.SetStateAction<Movie[]>>}> = {
      watchlist: { state: newWatchlist, setter: setWatchlist },
      watching: { state: newWatching, setter: setWatching },
      watched: { state: newWatched, setter: setWatched },
    };

    const otherLists = (Object.keys(lists) as ListType[]).filter(l => l !== list);

    // Remove from other lists
    otherLists.forEach(listName => {
      const updatedList = lists[listName].state.filter(m => m.id !== movie.id);
      lists[listName].setter(updatedList);
      if (listName === 'watchlist') newWatchlist = updatedList;
      if (listName === 'watching') newWatching = updatedList;
      if (listName === 'watched') newWatched = updatedList;
    });

    const targetList = lists[list];
    const movieIndex = targetList.state.findIndex(m => m.id === movie.id);

    if (movieIndex > -1) {
      // Remove from target list if it's already there (toggle off)
      const updatedList = targetList.state.filter(m => m.id !== movie.id);
      targetList.setter(updatedList);
      if (list === 'watchlist') newWatchlist = updatedList;
      if (list === 'watching') newWatching = updatedList;
      if (list === 'watched') newWatched = updatedList;
    } else {
      // Add to target list
      const updatedList = [...targetList.state, movie];
      targetList.setter(updatedList);
      if (list === 'watchlist') newWatchlist = updatedList;
      if (list === 'watching') newWatching = updatedList;
      if (list === 'watched') newWatched = updatedList;
    }

    if (user) {
      const { updateUserLists } = await import('@/lib/firestore');
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
  };
  return (
    <>
      <Header
        lists={{ watchlist, watching, watched }}
        onListUpdate={handleListUpdate}
        watchedMovies={watched}
        watchedShows={watching}
      />
      <div className="container mx-auto py-8 space-y-10">
        <h1 className="text-3xl font-bold mb-4">Recommendations</h1>
        <p className="text-lg text-gray-600 mb-8">Get personalized movie and TV show recommendations based on your activity.</p>
        {/* Filter out movies/shows already in watched or watchlist */}
        {(() => {
          const watchedIds = new Set(watched.map(m => m.id));
          const watchlistIds = new Set(watchlist.map(m => m.id));
          const filterRecs = (recs: Movie[]) => recs.filter(m => !watchedIds.has(m.id) && !watchlistIds.has(m.id));
          return <>
            {watched.some(m => m.media_type === 'movie' || (!m.media_type && m.title)) && (
              <MovieRow
                title="Recommendations Based on Watched Movies"
                movies={filterRecs(recWatchedMovies)}
                onMovieClick={handleMovieClick}
                isLoading={loadingWatchedMovies}
                horizontal={true}
                onRefresh={() => handleRefresh(
                  'watchedMovies',
                  watched.filter(m => m.media_type === 'movie' || (!m.media_type && m.title)).map(m => m.title || m.name).filter(Boolean) as string[],
                  'movie',
                  setRecWatchedMovies,
                  setLoadingWatchedMovies
                )}
                refreshing={refreshing.watchedMovies}
              />
            )}
            {watched.some(m => m.media_type === 'tv' || m.name) && (
              <MovieRow
                title="Recommendations Based on Watched TV Shows"
                movies={filterRecs(recWatchedTV)}
                onMovieClick={handleMovieClick}
                isLoading={loadingWatchedTV}
                horizontal={true}
                onRefresh={() => handleRefresh(
                  'watchedTV',
                  watched.filter(m => m.media_type === 'tv' || m.name).map(m => m.name || m.title).filter(Boolean) as string[],
                  'tv',
                  setRecWatchedTV,
                  setLoadingWatchedTV
                )}
                refreshing={refreshing.watchedTV}
              />
            )}
            {watchlist.some(m => m.media_type === 'movie' || (!m.media_type && m.title)) && (
              <MovieRow
                title="Recommendations Based on Watchlist Movies"
                movies={filterRecs(recWatchlistMovies)}
                onMovieClick={handleMovieClick}
                isLoading={loadingWatchlistMovies}
                horizontal={true}
                onRefresh={() => handleRefresh(
                  'watchlistMovies',
                  watchlist.filter(m => m.media_type === 'movie' || (!m.media_type && m.title)).map(m => m.title || m.name).filter(Boolean) as string[],
                  'movie',
                  setRecWatchlistMovies,
                  setLoadingWatchlistMovies
                )}
                refreshing={refreshing.watchlistMovies}
              />
            )}
            {watchlist.some(m => m.media_type === 'tv' || m.name) && (
              <MovieRow
                title="Recommendations Based on Watchlist TV Shows"
                movies={filterRecs(recWatchlistTV)}
                onMovieClick={handleMovieClick}
                isLoading={loadingWatchlistTV}
                horizontal={true}
                onRefresh={() => handleRefresh(
                  'watchlistTV',
                  watchlist.filter(m => m.media_type === 'tv' || m.name).map(m => m.name || m.title).filter(Boolean) as string[],
                  'tv',
                  setRecWatchlistTV,
                  setLoadingWatchlistTV
                )}
                refreshing={refreshing.watchlistTV}
              />
            )}
          </>;
        })()}
        {selectedItem && (
          <MovieModal
            movieId={selectedItem.id}
            mediaType={selectedItem.media_type}
            isOpen={!!selectedItem}
            onClose={handleCloseModal}
            onListUpdate={handleListUpdate}
            isMovieInList={isMovieInList}
          />
        )}
      </div>
    </>
  );
}
export default RecommendationPage;
