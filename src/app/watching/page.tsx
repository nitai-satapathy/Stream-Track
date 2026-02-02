"use client";

import * as React from "react";
import { Header } from "@/components/Header";
import { MovieRow } from "@/components/MovieRow";
import { MovieModal } from "@/components/MovieModal";
import type { Movie, MediaType } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { getLists, updateUserLists } from "@/actions/user";
import { EmptyState } from "@/components/EmptyState";
import { useListManager } from "@/hooks/useListManager";

type ListType = "watchlist" | "watching" | "watched";

export default function WatchingPage() {
  const { user } = useAuth();
  const {
    watchlist,
    watching,
    watched,
    setWatchlist,
    setWatching,
    setWatched,
    handleListUpdate,
    isMovieInList
  } = useListManager();

  const [selectedItem, setSelectedItem] = React.useState<{
    id: number;
    media_type: MediaType;
  } | null>(null);

  // Bulk Edit State
  const [isEditing, setIsEditing] = React.useState(false);
  const [baseSelectedIds, setBaseSelectedIds] = React.useState<number[]>([]);

  const handleToggleSelect = React.useCallback((movieId: number) => {
    setBaseSelectedIds(prev =>
      prev.includes(movieId)
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  }, []);

  const handleBulkDelete = async () => {
    if (baseSelectedIds.length === 0) return;

    // Filter out selected movies from the current watching list
    const newWatching = watching.filter(m => !baseSelectedIds.includes(m.id));

    // Update state
    setWatching(newWatching);

    // Update Backend/Storage
    if (user) {
      await updateUserLists(user.uid, {
        watchlist,
        watching: newWatching,
        watched
      });
    } else {
      localStorage.setItem("watching", JSON.stringify(newWatching));
    }

    // Reset Edit Mode
    setIsEditing(false);
    setBaseSelectedIds([]);
  };

  const handleMovieClick = React.useCallback(
    (id: number, media_type: MediaType) => {
      setSelectedItem({ id, media_type });
    },
    []
  );

  const handleCloseModal = React.useCallback(() => {
    setSelectedItem(null);
  }, []);

  const watchingMovies = React.useMemo(
    () =>
      watching
        .filter(
          (movie) =>
            movie.media_type === "movie" || (!movie.media_type && movie.title)
        )
        .map((movie) => ({ ...movie, media_type: "movie" as MediaType })),
    [watching]
  );

  const watchingTvShows = React.useMemo(
    () =>
      watching
        .filter((movie) => movie.media_type === "tv" || movie.name)
        .map((movie) => ({ ...movie, media_type: "tv" as MediaType })),
    [watching]
  );

  const headerLists = React.useMemo(
    () => ({ watchlist, watching, watched }),
    [watchlist, watching, watched]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header lists={headerLists} onListUpdate={handleListUpdate} />
      <main className="flex-1 space-y-8 py-8 pt-24 md:pt-28">
        <div className="container flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Currently Watching
          </h1>
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

        {watching.length === 0 && (
          <EmptyState />
        )}

        {watchingMovies.length > 0 && (
          <MovieRow
            title="Movies"
            movies={watchingMovies}
            onMovieClick={handleMovieClick}
            isEditing={isEditing}
            selectedIds={baseSelectedIds}
            onToggleSelect={handleToggleSelect}
          />
        )}
        {watchingTvShows.length > 0 && (
          <MovieRow
            title="TV Shows"
            movies={watchingTvShows}
            onMovieClick={handleMovieClick}
            isEditing={isEditing}
            selectedIds={baseSelectedIds}
            onToggleSelect={handleToggleSelect}
          />
        )}

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
      <MovieModal
        movieId={selectedItem?.id ?? null}
        mediaType={selectedItem?.media_type ?? null}
        isOpen={!!selectedItem}
        onClose={handleCloseModal}
        onListUpdate={handleListUpdate}
        isMovieInList={isMovieInList}
        onMovieSelect={handleMovieClick}
      />
    </div>
  );
}
