"use client";

import * as React from "react";
import { Header } from "@/components/Header";
import { MovieRow } from "@/components/MovieRow";
import { MovieModal } from "@/components/MovieModal";
import {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  searchMulti,
} from "@/lib/tmdb";
import { fetchTopRatedTvShows } from "@/lib/fetchTopRatedTvShows";
import type { Movie, MediaType } from "@/lib/types";
import { getRecommendations } from "@/ai/flows/recommendation-flow";
import { useAuth } from "@/hooks/useAuth";
import { getUserLists, updateUserLists } from "@/lib/firestore";

type ListType = "watchlist" | "watching" | "watched";

export default function Home() {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = React.useState<{ id: number; media_type: MediaType } | null>(null);
  const [watchlist, setWatchlist] = React.useState<Movie[]>([]);
  const [watching, setWatching] = React.useState<Movie[]>([]);
  const [watched, setWatched] = React.useState<Movie[]>([]);
  const [recommendations, setRecommendations] = React.useState<Movie[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = React.useState(false);


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

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      if (watched.length === 0 && watching.length === 0) {
        setRecommendations([]);
        return;
      }
      
      setIsRecommendationsLoading(true);

      try {
        const watchedTitles = watched.map(m => m.title || m.name).filter(Boolean) as string[];
        const watchingTitles = watching.map(m => m.title || m.name).filter(Boolean) as string[];

        const result = await getRecommendations({ watched: watchedTitles, watching: watchingTitles });
        
        if (result.recommendations) {
          const moviePromises = result.recommendations.map(async (rec) => {
            const searchResults = await searchMulti(rec.title);
            // Return the first result that is a movie or tv show
            return searchResults.find(item => item.media_type === 'movie' || item.media_type === 'tv') || null;
          });
          const recommendedMovies = (await Promise.all(moviePromises)).filter(Boolean) as Movie[];
          setRecommendations(recommendedMovies);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsRecommendationsLoading(false);
      }
    };

    const timer = setTimeout(fetchRecommendations, 1000);
    return () => clearTimeout(timer);

  }, [watched, watching]);


  const handleMovieClick = (id: number, media_type: MediaType) => {
    setSelectedItem({ id, media_type });
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

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
        {(recommendations.length > 0 || isRecommendationsLoading) && (
          <MovieRow
            title="Recommended For You"
            movies={recommendations}
            onMovieClick={handleMovieClick}
            isLoading={isRecommendationsLoading}
            horizontal={true}
          />
        )}
        <MovieRow
          title="Popular Movies"
          fetchFunction={fetchPopularMovies}
          onMovieClick={handleMovieClick}
          horizontal={true}
        />
        <MovieRow
          title="Top Rated Movies"
          fetchFunction={fetchTopRatedMovies}
          onMovieClick={handleMovieClick}
          horizontal={true}
        />
        <MovieRow
          title="Top Rated TV Shows"
          fetchFunction={fetchTopRatedTvShows}
          onMovieClick={handleMovieClick}
          horizontal={true}
        />
        <MovieRow
          title="Upcoming Movies"
          fetchFunction={fetchUpcomingMovies}
          onMovieClick={handleMovieClick}
          horizontal={true}
        />
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
