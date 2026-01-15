import type { Movie, TmdbApiResponse } from "./types";
import { tmdbApi } from "./tmdb";

export const fetchTopRatedTvShows = async (): Promise<Movie[]> => {
  const response = await tmdbApi.get<TmdbApiResponse>("/tv/top_rated");
  // Ensure each result has media_type: 'tv'
  return response.data.results.map((show) => ({ ...show, media_type: "tv" }));
};
