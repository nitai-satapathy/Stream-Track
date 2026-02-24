"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";

import { useAuth } from "@/hooks/useAuth";
import { getLists, updateUserLists } from "@/actions/user";
import type { Movie } from "@/lib/types";
import { useListManager } from "@/hooks/useListManager";
import { MovieRow } from "@/components/media/MovieRow";
import { SimpleLoading } from "@/components/shared/SimpleLoading";
import { Header } from "@/components/layout/Header";
import { MovieModal } from "@/components/modals/MovieModal";
import { EmptyState } from "@/components/shared/EmptyState";

const WatchlistPage = () => {
  const { user } = useAuth();
  const {
    watchlist,
    watching,
    watched,
    setWatchlist,
    setWatching,
    setWatched,
    handleListUpdate,
    isMovieInList,
    refreshLists,
    updateMovieProgress,
    isLoading
  } = useListManager();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<Movie[]>([]);

  // Update filtered movies/tv shows when watchlist changes
  useEffect(() => {
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
  }, [watchlist]);

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

  const handleMovieClick = useCallback(
    (id: number, media_type: "movie" | "tv") => {
      setSelectedItem({ id, media_type });
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const headerLists = useMemo(
    () => ({ watchlist, watching, watched }),
    [watchlist, watching, watched]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header lists={headerLists} onListUpdate={handleListUpdate} updateMovieProgress={updateMovieProgress} setWatched={setWatched} />
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
        {isLoading ? (
          <SimpleLoading message="Loading your watchlist..." />
        ) : movies.length === 0 && tvShows.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {movies.length > 0 && (
              <div className="mb-8">
                <MovieRow
                  title="Movies"
                  movies={movies}
                  onMovieClick={(id) => handleMovieClick(id, "movie")}
                  horizontal={true}
                  isEditing={isEditing}
                  selectedIds={baseSelectedIds}
                  onToggleSelect={handleToggleSelect}
                />
              </div>
            )}
            {tvShows.length > 0 && (
              <div>
                <MovieRow
                  title="TV Shows"
                  movies={tvShows}
                  onMovieClick={(id) => handleMovieClick(id, "tv")}
                  horizontal={true}
                  isEditing={isEditing}
                  selectedIds={baseSelectedIds}
                  onToggleSelect={handleToggleSelect}
                />
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
          userMovie={
            watching.find((m) => m.id === selectedItem?.id) ||
            watched.find((m) => m.id === selectedItem?.id) ||
            watchlist.find((m) => m.id === selectedItem?.id)
          }
          updateMovieProgress={updateMovieProgress}
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
