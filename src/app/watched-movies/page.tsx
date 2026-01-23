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
  const [selectedItem, setSelectedItem] = React.useState<{
    id: number;
    media_type: MediaType;
  } | null>(null);
  const [watchlist, setWatchlist] = React.useState<Movie[]>([]);
  const [watching, setWatching] = React.useState<Movie[]>([]);
  const [watched, setWatched] = React.useState<Movie[]>([]);

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

  const handleMovieClick = React.useCallback((id: number, media_type: MediaType) => {
    setSelectedItem({ id, media_type });
  }, []);

  const handleCloseModal = React.useCallback(() => {
    setSelectedItem(null);
  }, []);

  const watchedMovies = React.useMemo(() => {
    let base = watched.filter(
      (movie) =>
        movie.media_type === "movie" || (!movie.media_type && movie.title),
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
          (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0),
        );
      case "popularity_asc":
        return [...base].sort(
          (a, b) => (a.vote_average ?? 0) - (b.vote_average ?? 0),
        );
      case "rating_desc":
        return [...base].sort(
          (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0),
        );
      case "rating_asc":
        return [...base].sort(
          (a, b) => (a.vote_average ?? 0) - (b.vote_average ?? 0),
        );
      case "release_desc":
        return [...base].sort((a, b) =>
          (b.release_date ?? "") > (a.release_date ?? "") ? 1 : -1,
        );
      case "release_asc":
        return [...base].sort((a, b) =>
          (a.release_date ?? "") > (b.release_date ?? "") ? 1 : -1,
        );
      case "title_az":
        return [...base].sort((a, b) =>
          (a.title ?? "").localeCompare(b.title ?? ""),
        );
      case "title_za":
        return [...base].sort((a, b) =>
          (b.title ?? "").localeCompare(a.title ?? ""),
        );
      default:
        return base;
    }
  }, [watched, selectedGenres, sortBy]);

  const isMovieInList = React.useCallback((movieId: number, list: ListType) => {
    const listMap = {
      watchlist,
      watching,
      watched,
    };
    return listMap[list].some((m) => m.id === movieId);
  }, [watchlist, watching, watched]);

  const updateLocalStorage = (key: ListType, data: Movie[]) => {
    if (!user) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const handleListUpdate = React.useCallback(async (movie: Movie, list: ListType) => {
    let newWatchlist = [...watchlist];
    let newWatching = [...watching];
    let newWatched = [...watched];

    const lists: Record<
      ListType,
      { state: Movie[]; setter: React.Dispatch<React.SetStateAction<Movie[]>> }
    > = {
      watchlist: { state: newWatchlist, setter: setWatchlist },
      watching: { state: newWatching, setter: setWatching },
      watched: { state: newWatched, setter: setWatched },
    };

    const otherLists = (Object.keys(lists) as ListType[]).filter(
      (l) => l !== list,
    );

    // Remove from other lists
    otherLists.forEach((listName) => {
      const updatedList = lists[listName].state.filter(
        (m) => m.id !== movie.id,
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
  }, [watchlist, watching, watched, user]);

  const headerLists = React.useMemo(() => ({ watchlist, watching, watched }), [watchlist, watching, watched]);


  return (
    <div className="flex min-h-screen flex-col">
      <Header
        lists={headerLists}
        onListUpdate={handleListUpdate}
        watchedMovies={watched.filter(
          (movie) =>
            movie.media_type === "movie" || (!movie.media_type && movie.title),
        )}
        setWatchedMovies={setWatched}
        watchedShows={[]}
        setWatchedShows={() => { }}
      // user={user}
      />
      <main className="flex-1 space-y-12 py-8">
        <div className="container space-y-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Watched Movies
          </h1>
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
            className="ml-2 p-2 rounded hover:bg-muted transition-colors"
            aria-label="Filter watched movies"
            onClick={() => setIsBulkDialogOpen(true)}
          >
            <Funnel className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
          </button>
        </div>
        {watchedMovies.length > 0 ? (
          <MovieRow
            movies={watchedMovies}
            onMovieClick={handleMovieClick}
            title=""
          />
        ) : (
          <div className="container">
            <p className="text-muted-foreground">
              You haven&apos;t marked any movies as watched yet.
            </p>
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
      />
    </div>
  );
}
