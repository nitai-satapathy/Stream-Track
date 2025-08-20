import axios from "axios";
import type { Movie, TmdbApiResponse } from "./types";

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
      movie => movie.release_date >= minimum && movie.release_date <= maximum
    );
  }
  return response.data.results;
};

export const fetchMovieDetails = async (movieId: number, mediaType: 'movie' | 'tv'): Promise<Movie> => {
  const response = await tmdbApi.get<Movie>(`/${mediaType}/${movieId}`, {
    params: {
      append_to_response: "videos",
    },
  });
  return response.data;
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
    const response = await tmdbApi.get<TmdbApiResponse>('/search/multi', {
        params: {
            query
        }
    });
    return response.data.results.filter(
        (item) => item.media_type === "movie" || item.media_type === "tv"
    );
};

const getMediaType = async (id: number): Promise<'movie' | 'tv'> => {
  try {
    await tmdbApi.get(`/movie/${id}`);
    return 'movie';
  } catch (error) {
    // If movie fails, assume it's a TV show
    return 'tv';
  }
};
