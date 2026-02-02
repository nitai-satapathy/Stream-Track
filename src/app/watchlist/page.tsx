"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";

import { useAuth } from "@/hooks/useAuth";
import { getLists, updateUserLists } from "@/actions/user";
import type { Movie } from "@/lib/types";
import { MovieCard } from "@/components/MovieCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Header } from "@/components/Header";
import { MovieModal } from "@/components/MovieModal";
import { EmptyState } from "@/components/EmptyState";

const WatchlistPage = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [watching, setWatching] = useState<Movie[]>([]);
  const [watched, setWatched] = useState<Movie[]>([]);
  const [selectedItem, setSelectedItem] = useState<{
    id: number;
    media_type: "movie" | "tv";
  } | null>(null);

  // Bulk Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [baseSelectedIds, setBaseSelectedIds] = useState<number[]>([]);

  const handleToggleSelect = useCallback((movieId: number) => {
    setBaseSelectedIds(prev =>
      prev.includes(movieId)
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  }, []);

  const handleBulkDelete = async () => {
    if (baseSelectedIds.length === 0) return;

    // Filter out selected movies from the current watchlist
    const newWatchlist = watchlist.filter(m => !baseSelectedIds.includes(m.id));

    // Update state
    setWatchlist(newWatchlist);

    // Update local filtered lists
    setMovies(
      newWatchlist.filter(
        (item) =>
          item.media_type === "movie" || (!item.media_type && item.title)
      )
    );
    setTvShows(
      newWatchlist.filter(
        (item) => item.media_type === "tv" || (!item.media_type && item.name)
      )
    );

    // Update Backend/Storage
    if (user) {
      await updateUserLists(user.uid, {
        watchlist: newWatchlist,
        watching,
        watched
      });
    } else {
      localStorage.setItem("watchlist", JSON.stringify(newWatchlist));
    }

    // Reset Edit Mode
    setIsEditing(false);
    setBaseSelectedIds([]);
  };

  // Extracted fetchLists so it can be reused after updates
  const fetchLists = useCallback(async () => {
    if (user) {
      const { watchlist, watching, watched } = await getLists(user.uid);
      setWatchlist(watchlist);
      setWatching(watching);
      setWatched(watched);
      setMovies(
        watchlist.filter(
          (item: Movie) =>
            item.media_type === "movie" || (!item.media_type && item.title)
        )
      );
      setTvShows(
        watchlist.filter(
          (item: Movie) =>
            item.media_type === "tv" || (!item.media_type && item.name)
        )
      );
    } else {
      // fallback to localStorage for guests
      const storedWatchlist = localStorage.getItem("watchlist");
      const storedWatching = localStorage.getItem("watching");
      const storedWatched = localStorage.getItem("watched");
      const wl: Movie[] = storedWatchlist ? JSON.parse(storedWatchlist) : [];
      const wg: Movie[] = storedWatching ? JSON.parse(storedWatching) : [];
      const wd: Movie[] = storedWatched ? JSON.parse(storedWatched) : [];
      setWatchlist(wl);
      setWatching(wg);
      setWatched(wd);
      setMovies(
        wl.filter(
          (item) =>
            item.media_type === "movie" || (!item.media_type && item.title)
        )
      );
      setTvShows(
        wl.filter(
          (item) => item.media_type === "tv" || (!item.media_type && item.name)
        )
      );
    }
  }, [user]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleMovieClick = useCallback(
    (id: number, media_type: "movie" | "tv") => {
      setSelectedItem({ id, media_type });
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // Dummy handlers for now (customize as needed)
  // Copy-paste from main page logic for list management
  type ListType = "watchlist" | "watching" | "watched";
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
        await updateUserLists(user.uid, {
          watchlist: newWatchlist,
          watching: newWatching,
          watched: newWatched,
        });
      } else {
        localStorage.setItem("watchlist", JSON.stringify(newWatchlist));
        localStorage.setItem("watching", JSON.stringify(newWatching));
        localStorage.setItem("watched", JSON.stringify(newWatched));
      }
      // Refetch lists after update to refresh UI
      await fetchLists();
    },
    [watchlist, watching, watched, user, fetchLists]
  );

  const isMovieInList = useCallback(
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

  const headerLists = useMemo(
    () => ({ watchlist, watching, watched }),
    [watchlist, watching, watched]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header lists={headerLists} onListUpdate={handleListUpdate} />
      <main className="flex-1 p-6 pt-24 md:pt-28">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Your Watchlist</h1>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-full bg-secondary p-2 px-4 text-sm font-medium transition-colors hover:bg-secondary/80 flex items-center gap-2"
              >
                <span className="hidden sm:inline">Edit</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setBaseSelectedIds([]);
                }}
                className="rounded-full border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                Stop editing
              </button>
            )}
          </div>
        </div>
        {movies.length === 0 && tvShows.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {movies.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold">Movies</h2>
                <ScrollArea className="w-full whitespace-nowrap rounded-md">
                  <div className="flex gap-4">
                    {movies.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onClick={() => handleMovieClick(movie.id, "movie")}
                        isEditing={isEditing}
                        isSelected={baseSelectedIds.includes(movie.id)}
                        onToggleSelect={() => handleToggleSelect(movie.id)}
                      />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}
            {tvShows.length > 0 && (
              <div>
                <h2 className="mb-4 text-2xl font-semibold">TV Shows</h2>
                <ScrollArea className="w-full whitespace-nowrap rounded-md">
                  <div className="flex gap-4">
                    {tvShows.map((show) => (
                      <MovieCard
                        key={show.id}
                        movie={show}
                        onClick={() => handleMovieClick(show.id, "tv")}
                        isEditing={isEditing}
                        isSelected={baseSelectedIds.includes(show.id)}
                        onToggleSelect={() => handleToggleSelect(show.id)}
                      />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}
          </>
        )}
        <MovieModal
          movieId={selectedItem?.id ?? null}
          mediaType={selectedItem?.media_type ?? null}
          isOpen={!!selectedItem}
          onClose={handleCloseModal}
          onListUpdate={handleListUpdate}
          isMovieInList={isMovieInList}
          onMovieSelect={handleMovieClick}
        />

        {/* Floating Action Button for Bulk Delete */}
        {isEditing && baseSelectedIds.length > 0 && (
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={handleBulkDelete}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
              aria-label="Confirm Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5" /></svg>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default WatchlistPage;
