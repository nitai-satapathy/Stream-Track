import axios from "axios";
import axiosRetry from "axios-retry";
import type { Movie, TmdbApiResponse, Genre } from "./types";

const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

if (!apiKey) {
  throw new Error("TMDB API key is not defined in environment variables.");
}

export const tmdbApi = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: apiKey,
    language: "en-US",
  },
  timeout: 10000,
});

// retry Logic
axiosRetry(tmdbApi, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === "ECONNRESET" ||
      error.code === "ETIMEDOUT"
    );
  },
});

export const fetchPopularMovies = async (): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>("/movie/popular");
  return response.data.results;
};

export const fetchTopRatedMovies = async (): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>("/movie/top_rated");
  return response.data.results;
};

export const fetchUpcomingMovies = async (): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>("/movie/upcoming", {
    params: {
      region: "US", // Adjust region as needed
    },
  });
  const minimum = response.data.dates?.minimum;
  const maximum = response.data.dates?.maximum;
  if (minimum && maximum) {
    return response.data.results.filter(
      (movie) => movie.release_date >= minimum && movie.release_date <= maximum
    );
  }
  return response.data.results;
};

export const fetchMovieDetails = async (
  movieId: number,
  mediaType: "movie" | "tv"
): Promise<Movie> => {
  const response = await tmdbApi.get<any>(`/${mediaType}/${movieId}`, {
    params: {
      append_to_response: "videos,recommendations",
    },
  });

  const data = response.data;
  return data;
};

export const fetchTVShowDetails = async (tvId: number): Promise<Movie> => {
  return fetchMovieDetails(tvId, "tv");
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>("/search/movie", {
    params: {
      query,
    },
  });
  return response.data.results;
};

export const searchMulti = async (query: string): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>("/search/multi", {
    params: {
      query,
    },
  });
  return response.data.results.filter(
    (item) => item.media_type === "movie" || item.media_type === "tv"
  );
};

const getMediaType = async (id: number): Promise<"movie" | "tv"> => {
  try {
    await tmdbApi.get(`/movie/${id}`);
    return "movie";
  } catch (error) {
    return "tv";
  }
};

export const fetchGenres = async (
  mediaType: "movie" | "tv"
): Promise<Genre[]> => {
  const response = await tmdbApi.get<{ genres: Genre[] }>(
    `/genre/${mediaType}/list`
  );
  return response.data.genres;
};

export const discoverByGenre = async (
  mediaType: "movie" | "tv",
  genreId: number
): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>(
    `/discover/${mediaType}`,
    {
      params: {
        with_genres: genreId,
        sort_by: "popularity.desc",
      },
    }
  );
  return response.data.results.map((item) => ({
    ...item,
    media_type: mediaType,
  }));
};

export const fetchPersonDetails = async (personId: number): Promise<import("./types").Person> => {
  const response = await tmdbApi.get<import("./types").Person>(`/person/${personId}`, {
    params: {
      append_to_response: "external_ids,combined_credits",
    },
  });
  return response.data;
};

export const fetchSeasonDetails = async (
  tvId: number,
  seasonNumber: number
): Promise<any> => {
  try {
    const response = await tmdbApi.get(`/tv/${tvId}/season/${seasonNumber}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching season details for TV ID: ${tvId}, Season: ${seasonNumber}`, error);
    throw error;
  }
};
// Helper to auto-mark all episodes as watched
export const enrichTVShowWithEpisodes = async (
  showId: number,
  baseMovie: Movie
): Promise<Movie> => {
  try {
    const fullDetails = await fetchTVShowDetails(showId);
    if (fullDetails.seasons) {
      const allWatchedEpisodes: { season_number: number; episode_number: number }[] = [];
      const today = new Date().toISOString().split('T')[0];

      const seasonPromises = fullDetails.seasons
        .filter((season: any) => season.season_number > 0)
        .map((season: any) => fetchSeasonDetails(showId, season.season_number));

      const seasonsDetails = await Promise.all(seasonPromises);

      seasonsDetails.forEach((seasonDetail: any) => {
        if (seasonDetail.episodes) {
          seasonDetail.episodes.forEach((episode: any) => {
            if (episode.air_date && episode.air_date <= today) {
              allWatchedEpisodes.push({
                season_number: episode.season_number,
                episode_number: episode.episode_number,
              });
            }
          });
        }
      });

      return {
        ...baseMovie,
        ...fullDetails,
        watched_episodes: allWatchedEpisodes,
      };
    }
  } catch (e) {
    console.error("Failed to enrich TV show", e);
  }
  return baseMovie;
};

// fetchCredits
export interface CastMember {
  id: number;
  name: string;
  profile_path: string | null;
  character: string;
}

export interface CreditsResponse {
  cast: CastMember[];
}

export const fetchCredits = async (
  id: number,
  mediaType: "movie" | "tv"
): Promise<CastMember[]> => {
  const response = await tmdbApi.get<CreditsResponse>(
    `/${mediaType}/${id}/credits`
  );
  return response.data.cast;
};

// fetchTopRatedTvShows
export const fetchTopRatedTvShows = async (): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>("/tv/top_rated");
  return response.data.results.map((show) => ({ ...show, media_type: "tv" }));
};

// fetchTvAndTrending
export const fetchTrendingMovies = async (
  timeWindow: "day" | "week" = "day"
): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>(
    `/trending/movie/${timeWindow}`
  );
  return response.data.results;
};

export const fetchTrendingTv = async (
  timeWindow: "day" | "week" = "day"
): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>(
    `/trending/tv/${timeWindow}`
  );
  return response.data.results;
};

export const fetchPopularTvShows = async (): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>("/tv/popular");
  return response.data.results;
};

export const fetchAiringTodayTvShows = async (): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>("/tv/airing_today");
  return response.data.results;
};

export const fetchHiddenGems = async (
  mediaType: "movie" | "tv",
  genreId?: number
): Promise<Movie[]> => {
  const currentDate = new Date().toISOString().split("T")[0];
  const response = await tmdbApi.get<TmdbApiResponse>(
    `/discover/${mediaType}`,
    {
      params: {
        sort_by: "vote_average.desc",
        "vote_count.gte": 100,
        "vote_count.lte": 2000,
        "vote_average.gte": 7.0,
        with_genres: genreId,
        "primary_release_date.lte": currentDate,
        "air_date.lte": currentDate,
        with_original_language: "en",
        page: 1,
      },
    }
  );
  return response.data.results.map((item) => ({ ...item, media_type: mediaType }));
};

export const fetchSimilar = async (
  mediaType: "movie" | "tv",
  id: number
): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>(
    `/${mediaType}/${id}/similar`
  );
  return response.data.results.map((item) => ({ ...item, media_type: mediaType }));
};
