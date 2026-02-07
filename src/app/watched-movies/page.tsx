"use client";

import * as React from "react";
import { Header } from "@/components/Header";
import { Plus, Funnel } from "lucide-react";
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
import { FilterSortModal } from "@/components/FilterSortModal";
import type { Movie, MediaType } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { getLists, updateUserLists } from "@/actions/user";
import { EmptyState } from "@/components/EmptyState";
import { useListManager } from "@/hooks/useListManager";

type ListType = "watchlist" | "watching" | "watched";

const MOVIE_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Science Fiction",
  "TV Movie",
  "Thriller",
  "War",
  "Western",
];

export default function WatchedMoviesPage() {
  const [isBulkDialogOpen, setIsBulkDialogOpen] = React.useState(false);
  const [selectedGenres, setSelectedGenres] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState("");
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

  const watchedMovies = React.useMemo(() => {
    let base = watched.filter(
      (movie) =>
        movie.media_type === "movie" || (!movie.media_type && movie.title)
    );
    if (selectedGenres.length > 0) {
      base = base.filter((movie) => {
        if (movie.genres && movie.genres.length > 0) {
          return movie.genres.some((g) => selectedGenres.includes(g.name));
        }
        if ((movie as any).Genre && typeof (movie as any).Genre === "string") {
          return (movie as any).Genre.split(",")
            .map((s: string) => s.trim())
            .some((g: string) => selectedGenres.includes(g));
        }
        return false;
      });
    }
    // Sort logic
    if (!sortBy) return base;
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
          (b.release_date ?? "") > (a.release_date ?? "") ? 1 : -1
        );
      case "release_asc":
        return [...base].sort((a, b) =>
          (a.release_date ?? "") > (b.release_date ?? "") ? 1 : -1
        );
      case "title_az":
        return [...base].sort((a, b) =>
          (a.title ?? "").localeCompare(b.title ?? "")
        );
      case "title_za":
        return [...base].sort((a, b) =>
          (b.title ?? "").localeCompare(a.title ?? "")
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
        watchedMovies={watched.filter(
          (movie) =>
            movie.media_type === "movie" || (!movie.media_type && movie.title)
        )}
        setWatchedMovies={setWatched}
        watchedShows={[]}
        setWatchedShows={() => { }}
      // user={user}
      />
      <main className="flex-1 space-y-12 py-8 pt-24 md:pt-28">
        <div className="container flex items-center justify-between space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Watched Movies
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
              <>
                <FilterSortModal
                  isOpen={isBulkDialogOpen}
                  onClose={() => setIsBulkDialogOpen(false)}
                  genres={MOVIE_GENRES}
                  selectedGenres={selectedGenres}
                  setSelectedGenres={setSelectedGenres}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
                <button
                  className="rounded p-2 transition-colors hover:bg-muted"
                  aria-label="Filter watched movies"
                  onClick={() => setIsBulkDialogOpen(true)}
                >
                  <Funnel className="h-6 w-6 text-muted-foreground transition-colors hover:text-primary" />
                </button>
              </>
            )}
          </div>
        </div>
        {watchedMovies.length > 0 ? (
          <MovieRow
            movies={watchedMovies}
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
