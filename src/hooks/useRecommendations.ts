import { useState, useCallback } from "react";
import { getRecommendations } from "@/actions/recommendations";
import { searchMulti } from "@/lib/tmdb";
import type { Movie } from "@/lib/types";

// Caching logic for 24h
const getCacheKey = (section: string) => `rec_cache_v2_${section}`;
const getCache = (section: string) => {
    try {
        const raw = localStorage.getItem(getCacheKey(section));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed.data || !parsed.timestamp) return null;
        if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) return null;
        return parsed.data as Movie[];
    } catch {
        return null;
    }
};
const setCache = (section: string, data: Movie[]) => {
    localStorage.setItem(
        getCacheKey(section),
        JSON.stringify({ data, timestamp: Date.now() })
    );
};

const mapToContext = (m: Movie) => ({
    id: m.id,
    title: m.title || m.name || "",
    media_type: (m.media_type || "movie") as "movie" | "tv",
    genres: m.genres?.map((g) => g.name) || [],
    release_date: m.release_date || m.first_air_date || "",
    vote_average: m.vote_average,
});

const fetchRecs = async (
    items: Movie[],
    contextType: "watched" | "watching" | "watchlist",
    section: string,
    forcedMediaType?: "movie" | "tv",
    force = false
): Promise<Movie[]> => {
    if (!force) {
        const cached = getCache(section);
        if (cached) return cached;
    }
    if (items.length === 0) return [];

    try {
        const input = {
            watched: contextType === "watched" ? items.map(mapToContext) : [],
            watching: contextType === "watching" ? items.map(mapToContext) : [],
            watchlist: contextType === "watchlist" ? items.map(mapToContext) : [],
            forcedMediaType,
        };

        const result = await getRecommendations(input);

        if (result.recommendations) {
            const moviePromises = result.recommendations.map(async (rec): Promise<Movie | null> => {
                try {
                    let movie: Movie | null = null;

                    if (rec.tmdb_id) {
                        const searchResults = await searchMulti(rec.title);
                        movie = searchResults.find(m => m.id === rec.tmdb_id) || searchResults[0];
                    } else {
                        const searchResults = await searchMulti(rec.title);
                        if (forcedMediaType) {
                            movie = searchResults.find(m => m.media_type === forcedMediaType) || null;
                            if (!movie && searchResults.length > 0) {
                                const candidate = searchResults[0];
                                if (candidate.media_type === forcedMediaType) movie = candidate;
                            }
                        } else {
                            movie = searchResults[0];
                        }
                    }

                    if (movie) {
                        return {
                            ...movie,
                            ai_explanation: rec.reason,
                            overview: rec.reason
                        };
                    }
                } catch (e) {
                    console.error("Error fetching details for rec:", rec.title, e);
                }
                return null;
            });

            const resolved = (await Promise.all(moviePromises)).filter((m): m is Movie => !!m);

            const inputIds = new Set(items.map(i => i.id));
            const filtered = resolved.filter(m => !inputIds.has(m.id));

            setCache(section, filtered);
            return filtered;
        }
    } catch (error) {
        console.error("Error in fetchRecs:", error);
        throw error;
    }
    return [];
};

export const useRecommendations = () => {
    const [recWatchedMovies, setRecWatchedMovies] = useState<Movie[]>([]);
    const [recWatchedTV, setRecWatchedTV] = useState<Movie[]>([]);
    const [recWatchlistMovies, setRecWatchlistMovies] = useState<Movie[]>([]);
    const [recWatchlistTV, setRecWatchlistTV] = useState<Movie[]>([]);

    const [loadingWatchedMovies, setLoadingWatchedMovies] = useState(false);
    const [loadingWatchedTV, setLoadingWatchedTV] = useState(false);
    const [loadingWatchlistMovies, setLoadingWatchlistMovies] = useState(false);
    const [loadingWatchlistTV, setLoadingWatchlistTV] = useState(false);

    const [errorWatchedMovies, setErrorWatchedMovies] = useState<string | null>(null);
    const [errorWatchedTV, setErrorWatchedTV] = useState<string | null>(null);
    const [errorWatchlistMovies, setErrorWatchlistMovies] = useState<string | null>(null);
    const [errorWatchlistTV, setErrorWatchlistTV] = useState<string | null>(null);

    const [refreshing, setRefreshing] = useState({
        watchedMovies: false,
        watchedTV: false,
        watchlistMovies: false,
        watchlistTV: false,
    });

    const getRecommendationsForSection = useCallback(async (
        items: Movie[],
        section: "watchedMovies" | "watchedTV" | "watchlistMovies" | "watchlistTV",
        contextType: "watched" | "watchlist",
        mediaType: "movie" | "tv",
        force: boolean = false
    ) => {
        // Map state setters
        const setters = {
            watchedMovies: { setRecs: setRecWatchedMovies, setLoading: setLoadingWatchedMovies, setError: setErrorWatchedMovies },
            watchedTV: { setRecs: setRecWatchedTV, setLoading: setLoadingWatchedTV, setError: setErrorWatchedTV },
            watchlistMovies: { setRecs: setRecWatchlistMovies, setLoading: setLoadingWatchlistMovies, setError: setErrorWatchlistMovies },
            watchlistTV: { setRecs: setRecWatchlistTV, setLoading: setLoadingWatchlistTV, setError: setErrorWatchlistTV },
        };

        const { setRecs, setLoading, setError } = setters[section];

        if (force) {
            setRefreshing(prev => ({ ...prev, [section]: true }));
        }
        setLoading(true);
        setError(null);

        try {
            const recs = await fetchRecs(items, contextType, section, mediaType, force);
            setRecs(recs);
        } catch (error) {
            console.error(`Failed to fetch recommendations for ${section}:`, error);
            setError("Unable to generate recommendations. Please try again later.");
            setRecs([]);
        } finally {
            setLoading(false);
            if (force) {
                setRefreshing(prev => ({ ...prev, [section]: false }));
            }
        }
    }, []);

    return {
        recWatchedMovies,
        recWatchedTV,
        recWatchlistMovies,
        recWatchlistTV,
        loadingWatchedMovies,
        loadingWatchedTV,
        loadingWatchlistMovies,
        loadingWatchlistTV,
        errorWatchedMovies,
        errorWatchedTV,
        errorWatchlistMovies,
        errorWatchlistTV,
        refreshing,
        getRecommendationsForSection,
        setRecWatchedMovies,
        setRecWatchedTV,
        setRecWatchlistMovies,
        setRecWatchlistTV,
    };
};
