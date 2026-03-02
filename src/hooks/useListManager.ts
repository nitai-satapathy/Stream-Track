import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getLists, updateUserLists } from "@/actions/user";
import type { Movie } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export type ListType = "watchlist" | "watching" | "watched";

export interface ListManager {
    watchlist: Movie[];
    watching: Movie[];
    watched: Movie[];
    setWatchlist: React.Dispatch<React.SetStateAction<Movie[]>>;
    setWatching: React.Dispatch<React.SetStateAction<Movie[]>>;
    setWatched: React.Dispatch<React.SetStateAction<Movie[]>>;
    handleListUpdate: (movie: Movie, list: ListType) => Promise<void>;
    isMovieInList: (movieId: number, list: ListType) => boolean;
    refreshLists: () => Promise<void>;
    updateMovieProgress: (movie: Movie) => Promise<void>;
    isLoading: boolean;
}
const syncBus = typeof window !== 'undefined' ? new EventTarget() : null;

export function useListManager(): ListManager {
    const { user } = useAuth();
    const { toast } = useToast();
    const [watchlist, setWatchlist] = useState<Movie[]>([]);
    const [watching, setWatching] = useState<Movie[]>([]);
    const [watched, setWatched] = useState<Movie[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLists = useCallback(async () => {
        setIsLoading(true);
        try {
            if (user) {
                if (isSyncing) return;
                const lists = await getLists(user.uid);
                setWatchlist(lists.watchlist);
                setWatching(lists.watching);
                setWatched(lists.watched);
            } else {
                const storedWatchlist = localStorage.getItem("watchlist");
                const storedWatching = localStorage.getItem("watching");
                const storedWatched = localStorage.getItem("watched");
                if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist));
                if (storedWatching) setWatching(JSON.parse(storedWatching));
                if (storedWatched) setWatched(JSON.parse(storedWatched));
            }
        } finally {
            setIsLoading(false);
        }
    }, [user, isSyncing]);

    useEffect(() => {
        const handleSync = (e: any) => {
            const { watchlist: newWatchlist, watching: newWatching, watched: newWatched, sourceUserId } = e.detail;
            if (sourceUserId === user?.uid) {
                setWatchlist(newWatchlist);
                setWatching(newWatching);
                setWatched(newWatched);
            }
        };

        syncBus?.addEventListener('sync', handleSync);
        return () => syncBus?.removeEventListener('sync', handleSync);
    }, [user?.uid]);

    const broadcastUpdate = useCallback((newWatchlist: Movie[], newWatching: Movie[], newWatched: Movie[]) => {
        syncBus?.dispatchEvent(new CustomEvent('sync', {
            detail: {
                watchlist: newWatchlist,
                watching: newWatching,
                watched: newWatched,
                sourceUserId: user?.uid
            }
        }));
    }, [user?.uid]);

    // Sync Guest Data on Login
    useEffect(() => {
        const syncGuestData = async () => {
            if (!user) return;

            const localWatchlistStr = localStorage.getItem("watchlist");
            const localWatchingStr = localStorage.getItem("watching");
            const localWatchedStr = localStorage.getItem("watched");

            if (!localWatchlistStr && !localWatchingStr && !localWatchedStr) return;

            setIsSyncing(true);
            try {
                const localWatchlist: Movie[] = localWatchlistStr ? JSON.parse(localWatchlistStr) : [];
                const localWatching: Movie[] = localWatchingStr ? JSON.parse(localWatchingStr) : [];
                const localWatched: Movie[] = localWatchedStr ? JSON.parse(localWatchedStr) : [];

                // Fetch current DB data
                const dbLists = await getLists(user.uid);

                const merge = (db: Movie[], local: Movie[]) => {
                    const map = new Map(db.map(m => [m.id, m]));
                    local.forEach(m => map.set(m.id, m));
                    return Array.from(map.values());
                };

                const newWatchlist = merge(dbLists.watchlist, localWatchlist);
                const newWatching = merge(dbLists.watching, localWatching);
                const newWatched = merge(dbLists.watched, localWatched);

                // Update DB
                await updateUserLists(user.uid, {
                    watchlist: newWatchlist,
                    watching: newWatching,
                    watched: newWatched
                });

                // Update State
                setWatchlist(newWatchlist);
                setWatching(newWatching);
                setWatched(newWatched);
                broadcastUpdate(newWatchlist, newWatching, newWatched);

                // Clear LocalStorage
                localStorage.removeItem("watchlist");
                localStorage.removeItem("watching");
                localStorage.removeItem("watched");

                toast({
                    title: "Lists Synced",
                    description: "Your guest lists have been merged with your account.",
                });

            } catch (error) {
                console.error("Sync failed", error);
                toast({
                    title: "Sync Failed",
                    description: "Could not merge guest lists.",
                    variant: "destructive",
                });
            } finally {
                setIsSyncing(false);
            }
        };

        syncGuestData();
    }, [user, toast, broadcastUpdate]);

    useEffect(() => {
        fetchLists();
    }, [fetchLists]);

    const updateLocalStorage = useCallback((key: ListType, data: Movie[]) => {
        if (!user) {
            localStorage.setItem(key, JSON.stringify(data));
        }
    }, [user]);

    const handleListUpdate = useCallback(
        async (movie: Movie, list: ListType) => {
            // Helper to remove movie from a list
            const removeFromList = (l: Movie[]) => l.filter((m) => m.id !== movie.id);

            // Smart "Add to Watched" Logic
            let movieToSave = { ...movie };
            if (list === "watched" && (movie.media_type === "tv" || movie.name)) {
                try {
                    const { enrichTVShowWithEpisodes } = await import("@/lib/tmdb");
                    movieToSave = await enrichTVShowWithEpisodes(movie.id, movie);

                    if (movieToSave.watched_episodes && movieToSave.watched_episodes.length > 0) {
                        toast({
                            title: "Marked as Watched",
                            description: `All ${movieToSave.watched_episodes.length} episodes of ${movie.name || movie.title} marked as watched.`,
                        });
                    }
                } catch (error) {
                    console.error("Failed to auto-mark episodes", error);
                }
            }

            // Helper to add movie to a list
            const addToList = (l: Movie[]) => {
                // If it exists, update it. If not, add it.
                const exists = l.some(m => m.id === movie.id);
                if (exists) {
                    return l.map(m => m.id === movie.id ? movieToSave : m);
                }
                return [...l, movieToSave];
            };

            // Calculate new states
            const newWatchlist = list === "watchlist"
                ? (watchlist.some(m => m.id === movie.id) ? removeFromList(watchlist) : addToList(watchlist))
                : removeFromList(watchlist);

            const newWatching = list === "watching"
                ? (watching.some(m => m.id === movie.id) ? removeFromList(watching) : addToList(watching))
                : removeFromList(watching);

            const newWatched = list === "watched"
                ? (watched.some(m => m.id === movie.id) ? removeFromList(watched) : addToList(watched))
                : removeFromList(watched);

            // Update State
            setWatchlist(newWatchlist);
            setWatching(newWatching);
            setWatched(newWatched);
            broadcastUpdate(newWatchlist, newWatching, newWatched);

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
        },
        [watchlist, watching, watched, user, updateLocalStorage, toast, broadcastUpdate]
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

    const updateMovieProgress = useCallback(
        async (updatedMovie: Movie) => {
            const updateList = (list: Movie[]) =>
                list.map((m) => (m.id === updatedMovie.id ? updatedMovie : m));

            // Update local state for all lists where the movie might exist
            const newWatchlist = updateList(watchlist);
            const newWatching = updateList(watching);
            const newWatched = updateList(watched);

            setWatchlist(newWatchlist);
            setWatching(newWatching);
            setWatched(newWatched);
            broadcastUpdate(newWatchlist, newWatching, newWatched);

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
        },
        [watchlist, watching, watched, user, updateLocalStorage, broadcastUpdate]
    );

    return {
        watchlist,
        watching,
        watched,
        setWatchlist,
        setWatching,
        setWatched,
        handleListUpdate,
        isMovieInList,
        refreshLists: fetchLists,
        updateMovieProgress,
        isLoading
    };
}
