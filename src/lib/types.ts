export interface Movie {
  id: number;
  title: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
  first_air_date?: string;
  genre_ids: number[];
  genres?: Genre[];
  videos?: {
    results: Video[];
  };
  media_type?: 'movie' | 'tv';
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
}
