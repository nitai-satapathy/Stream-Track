"use client";

import * as React from "react";
import { Header } from "@/components/Header";
import { MovieRow } from "@/components/MovieRow";
import { MovieModal } from "@/components/MovieModal";
import type { Movie } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { getUserLists, updateUserLists } from "@/lib/firestore";

type ListType = "watchlist" | "watching" | "watched";

export default function WatchedMoviesPage() {
  const { user } = useAuth();
  const [selectedMovieId, setSelectedMovieId] = React.useState<number | null>(null);
  const [watchlist, setWatchlist] = React.useState<Movie[]>([]);
  const [watching, setWatching] = React.useState<Movie[]>([]);
  const [watched, setWatched] = React.useState<Movie[]>([]);

  React.useEffect(() => {
    const loadLists = async () => {
      if (user) {
        const { watchlist, watching, watched } = await getUserLists(user.uid);
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

  const handleMovieClick = (id: number) => {
    setSelectedMovieId(id);
  };

  const handleCloseModal = () => {
    setSelectedMovieId(null);
  };
  
  const watchedMovies = watched.filter(movie => movie.media_type === 'movie' || (!movie.media_type && movie.title));

  const isMovieInList = (movieId: number, list: ListType) => {
    const listMap = {
      watchlist,
      watching,
      watched,
    };
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
    <div className="flex min-h-screen flex-col">
       <Header
        lists={{ watchlist, watching, watched }}
        onListUpdate={handleListUpdate}
      />
      <main className="flex-1 space-y-12 py-8">
        <div className="container">
           <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Watched Movies</h1>
        </div>
        {watchedMovies.length > 0 ? (
          <MovieRow
            movies={watchedMovies}
            onMovieClick={handleMovieClick}
            title=""
          />
        ) : (
            <div className="container">
                <p className="text-muted-foreground">You haven't marked any movies as watched yet.</p>
            </div>
        )}
      </main>
      <MovieModal
        movieId={selectedMovieId}
        isOpen={!!selectedMovieId}
        onClose={handleCloseModal}
        onListUpdate={handleListUpdate}
        isMovieInList={isMovieInList}
      />
    </div>
  );
}
