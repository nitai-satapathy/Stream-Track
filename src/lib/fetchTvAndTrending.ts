import { tmdbApi } from "./tmdb";
import type { Movie, TmdbApiResponse } from "./types";

export const fetchTrendingMovies = async (timeWindow: "day" | "week" = "day"): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>(`/trending/movie/${timeWindow}`);
  return response.data.results;
};

export const fetchTrendingTv = async (timeWindow: "day" | "week" = "day"): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>(`/trending/tv/${timeWindow}`);
  return response.data.results;
};

export const fetchPopularTvShows = async (): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>("/tv/popular");
  return response.data.results;
};

export const fetchAiringTodayTvShows = async (): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>("/tv/on_the_air");
  return response.data.results;
};
