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
import { useToast } from "@/hooks/use-toast";

type ListType = "watchlist" | "watching" | "watched";

export default function WatchingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
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
      <Header lists={headerLists} onListUpdate={handleListUpdate} updateMovieProgress={updateMovieProgress} />
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
          <div className="fixed bottom-8 right-8 z-50 flex gap-4">
            <button
              onClick={async () => {


                // We are moving FROM watching TO watched
                let newWatching = [...watching];
                let newWatched = [...watched];

                const processUpdates = baseSelectedIds.map(async (id) => {
                  // Find in watching list
                  const movieIndex = newWatching.findIndex(m => m.id === id);
                  if (movieIndex === -1) return;

                  const movie = newWatching[movieIndex];
                  // Remove from watching
                  // Note: We need to filter later or handle index shifts. 
                  // Easier to just get the movie object here and filter later.

                  if (movie.media_type !== 'tv' && !movie.name) {
                    // If not TV, just move it? Or ignore?
                    // Let's assume just move it for now, but focus on TV smarts
                    newWatched.push(movie);
                    return;
                  }

                  try {
                    const { enrichTVShowWithEpisodes } = await import("@/lib/tmdb");
                    const enriched = await enrichTVShowWithEpisodes(id, movie);
                    newWatched.push(enriched);
                  } catch (e) {
                    console.error("Failed to update", movie.name, e);
                    newWatched.push(movie); // Fallback: move even if fetch fails
                  }
                });

                await Promise.all(processUpdates);

                // Remove processed IDs from Watching
                newWatching = newWatching.filter(m => !baseSelectedIds.includes(m.id));

                setWatching(newWatching);
                setWatched(newWatched);

                if (user) {
                  await updateUserLists(user.uid, { watchlist, watching: newWatching, watched: newWatched });
                } else {
                  localStorage.setItem("watching", JSON.stringify(newWatching));
                  localStorage.setItem("watched", JSON.stringify(newWatched));
                }

                setIsEditing(false);
                setBaseSelectedIds([]);
                toast({
                  title: "Moved to Watched",
                  description: `${baseSelectedIds.length} items moved to Watched history.`,
                });
              }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
              aria-label="Mark Selected as Watched"
              title="Move selected to Watched"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
            </button>

            <button
              onClick={handleBulkDelete}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
              aria-label="Confirm Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
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
