export type MediaType = "movie" | "tv";
export interface Movie {
  id: number;
  title: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  vote_count?: number;
  popularity?: number;
  release_date: string;
  first_air_date?: string;
  genre_ids: number[];
  genres?: Genre[];
  videos?: {
    results: Video[];
  };
  recommendations?: {
    results: Movie[];
  };
  media_type?: "movie" | "tv";
  runtime?: number;
  number_of_episodes?: number;
  number_of_seasons?: number;
  episode_run_time?: number[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

export interface TmdbApiResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
  dates?: {
    minimum: string;
    maximum: string;
  };
}

export interface Person {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  gender: number;
  profile_path: string | null;
  external_ids?: {
    imdb_id?: string | null;
    facebook_id?: string | null;
    instagram_id?: string | null;
    twitter_id?: string | null;
  };
  combined_credits?: {
    cast: Movie[];
    crew: Movie[];
  };
}
