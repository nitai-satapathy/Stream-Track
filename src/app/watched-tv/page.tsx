"use client";

import * as React from "react";

import { Header } from "@/components/Header";
import { Plus, Funnel } from "lucide-react";
import { FilterSortModal } from "@/components/FilterSortModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { MovieRow } from "@/components/MovieRow";
import { MovieModal } from "@/components/MovieModal";
import type { Movie, MediaType } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { getLists, updateUserLists } from "@/actions/user";
import { EmptyState } from "@/components/EmptyState";
import { useListManager } from "@/hooks/useListManager";

type ListType = "watchlist" | "watching" | "watched";

const TV_GENRES = [
  "Action & Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Kids",
  "Mystery",
  "News",
  "Reality",
  "Sci-Fi & Fantasy",
  "Soap",
  "Talk",
  "War & Politics",
  "Western",
];

export default function WatchedTvShowsPage() {
  // Duplicate removed
  const [selectedGenres, setSelectedGenres] = React.useState<string[]>([]);
  const [filterModalOpen, setFilterModalOpen] = React.useState(false);
  const [sortBy, setSortBy] = React.useState("");
  const [releaseFrom, setReleaseFrom] = React.useState("");
  const [releaseTo, setReleaseTo] = React.useState("");
  const [rating, setRating] = React.useState<number | null>(null);
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

    // Filter out selected movies from the current watched list
    const newWatched = watched.filter(m => !baseSelectedIds.includes(m.id));

    // Update state
    setWatched(newWatched);

    // Update Backend/Storage
    if (user) {
      await updateUserLists(user.uid, {
        watchlist,
        watching,
        watched: newWatched
      });
    } else {
      localStorage.setItem("watched", JSON.stringify(newWatched));
    }

    // Reset Edit Mode
    setIsEditing(false);
    setBaseSelectedIds([]);

    // Refetch/Update Lists
    await refreshLists();
  };

  const handleMovieClick = React.useCallback(
    (id: number, media_type: MediaType) => {
      setSelectedItem({ id, media_type: "tv" });
    },
    []
  );

  const handleCloseModal = React.useCallback(() => {
    setSelectedItem(null);
  }, []);

  const watchedTvShows = React.useMemo(() => {
    let base = watched
      .filter((movie) => movie.media_type === "tv" || movie.name)
      .map((movie) => ({ ...movie, media_type: "tv" as MediaType }));
    if (selectedGenres.length > 0) {
      base = base.filter((show) => {
        if (show.genres && show.genres.length > 0) {
          return show.genres.some((g) => selectedGenres.includes(g.name));
        }
        if ((show as any).Genre && typeof (show as any).Genre === "string") {
          return (show as any).Genre.split(",")
            .map((s: string) => s.trim())
            .some((g: string) => selectedGenres.includes(g));
        }
        return false;
      });
    }
    // Sort logic
    switch (sortBy) {
      case "popularity_desc":
        return [...base].sort(
          (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0)
        );
      case "popularity_asc":
        return [...base].sort(
          (a, b) => (a.vote_average ?? 0) - (b.vote_average ?? 0)
        );
      case "rating_desc":
        return [...base].sort(
          (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0)
        );
      case "rating_asc":
        return [...base].sort(
          (a, b) => (a.vote_average ?? 0) - (b.vote_average ?? 0)
        );
      case "release_desc":
        return [...base].sort((a, b) =>
          (b.first_air_date ?? "") > (a.first_air_date ?? "") ? 1 : -1
        );
      case "release_asc":
        return [...base].sort((a, b) =>
          (a.first_air_date ?? "") > (b.first_air_date ?? "") ? 1 : -1
        );
      case "title_az":
        return [...base].sort((a, b) =>
          (a.name ?? a.title ?? "").localeCompare(b.name ?? b.title ?? "")
        );
      case "title_za":
        return [...base].sort((a, b) =>
          (b.name ?? b.title ?? "").localeCompare(a.name ?? a.title ?? "")
        );
      default:
        return base;
    }
  }, [watched, selectedGenres, sortBy]);

  const headerLists = React.useMemo(
    () => ({ watchlist, watching, watched }),
    [watchlist, watching, watched]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        lists={headerLists}
        onListUpdate={handleListUpdate}
        updateMovieProgress={updateMovieProgress}
        watchedMovies={[]}
        setWatchedMovies={() => { }}
        watchedShows={watched.filter(
          (movie) => movie.media_type === "tv" || movie.name
        )}
        setWatchedShows={setWatched}
      />
      <main className="flex-1 space-y-12 py-8 pt-24 md:pt-28">
        <div className="container flex items-center justify-between space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Watched TV Shows
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

            {!isEditing && (
              <button
                className="rounded p-2 transition-colors hover:bg-muted"
                aria-label="Filter watched TV shows"
                onClick={() => setFilterModalOpen(true)}
              >
                <Funnel className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
              </button>
            )}
          </div>
          <FilterSortModal
            isOpen={filterModalOpen}
            onClose={() => setFilterModalOpen(false)}
            genres={TV_GENRES}
            selectedGenres={selectedGenres}
            setSelectedGenres={setSelectedGenres}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>
        {watchedTvShows.length > 0 ? (
          <MovieRow
            movies={watchedTvShows}
            onMovieClick={handleMovieClick}
            title=""
            isEditing={isEditing}
            selectedIds={baseSelectedIds}
            onToggleSelect={handleToggleSelect}
          />
        ) : (
          <EmptyState />
        )}

        {/* Floating Action Button for Bulk Delete */}
        {/* Floating Action Button for Bulk Delete */}
        {isEditing && baseSelectedIds.length > 0 && (
          <div className="fixed bottom-8 right-8 z-50 flex gap-4">
            <button
              onClick={async () => {
                let updatedWatched = [...watched];

                // Show loading toast? Or just do it.

                const processUpdates = baseSelectedIds.map(async (id) => {
                  const movieIndex = updatedWatched.findIndex(m => m.id === id);
                  if (movieIndex === -1) return;

                  const movie = updatedWatched[movieIndex];
                  if (movie.media_type !== 'tv' && !movie.name) return;

                  try {
                    const { enrichTVShowWithEpisodes } = await import("@/lib/tmdb");
                    const enriched = await enrichTVShowWithEpisodes(id, movie);
                    updatedWatched[movieIndex] = enriched;
                  } catch (e) {
                    console.error("Failed to update", movie.name, e);
                  }
                });

                await Promise.all(processUpdates);

                setWatched(updatedWatched);
                if (user) {
                  await updateUserLists(user.uid, { watchlist, watching, watched: updatedWatched });
                } else {
                  localStorage.setItem("watched", JSON.stringify(updatedWatched));
                }

                setIsEditing(false);
                setBaseSelectedIds([]);
                // await refreshLists(); // Optional, local state is already updated
              }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
              aria-label="Mark Selected as Watched"
              title="Mark selected as fully watched"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
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
