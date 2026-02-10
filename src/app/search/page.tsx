"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { MovieRow } from "@/components/MovieRow";
import { MovieModal } from "@/components/MovieModal";
import { searchMulti } from "@/lib/tmdb";
import type { Movie } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { getLists, updateUserLists } from "@/actions/user";

type MediaType = "movie" | "tv";
import { useListManager } from "@/hooks/useListManager";
type ListType = "watchlist" | "watching" | "watched";

interface SelectedItem {
  id: number;
  media_type: MediaType;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const [selectedItem, setSelectedItem] = React.useState<SelectedItem | null>(
    null
  );

  const {
    watchlist,
    watching,
    watched,
    handleListUpdate,
    isMovieInList,
    updateMovieProgress,
    setWatched
  } = useListManager();

  const fetchSearchResults = React.useCallback(() => {
    if (query) {
      return searchMulti(query);
    }
    return Promise.resolve([]);
  }, [query]);

  const handleMovieClick = React.useCallback(
    (id: number, media_type: MediaType) => {
      setSelectedItem({ id, media_type });
    },
    []
  );

  const handleCloseModal = React.useCallback(() => {
    setSelectedItem(null);
  }, []);

  const headerLists = React.useMemo(
    () => ({ watchlist, watching, watched }),
    [watchlist, watching, watched]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header lists={headerLists} onListUpdate={handleListUpdate} updateMovieProgress={updateMovieProgress} setWatched={setWatched} />
      <main className="flex-1 space-y-12 py-8 pt-24 md:pt-28">
        {query ? (
          <MovieRow
            title={`Search Results for "${query}"`}
            fetchFunction={fetchSearchResults}
            onMovieClick={handleMovieClick}
            key={query} // Add key to re-trigger fetch on query change
          />
        ) : (
          <div className="container">
            <p className="text-muted-foreground">
              Please enter a search term to find movies.
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

export default function SearchPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading search...
        </div>
      }
    >
      <SearchContent />
    </React.Suspense>
  );
}
