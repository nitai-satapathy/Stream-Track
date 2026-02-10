// OMDb API integration for fetching ratings and box office info

export interface OmdbRating {
  Source: string;
  Value: string;
}

export interface OmdbData {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: OmdbRating[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
  Error?: string;
}

const OMDB_API_KEY = "316a062e";
const OMDB_BASE_URL = "https://www.omdbapi.com/";

export async function fetchOmdbData(
  title: string,
  year?: string,
  type?: "movie" | "series"
) {
  const params = new URLSearchParams({
    apikey: OMDB_API_KEY,
    t: title,
  });
  if (year) params.append("y", year);
  if (type) params.append("type", type);

  const url = `${OMDB_BASE_URL}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch OMDb data");
  const data = await res.json();
  if (data.Response === "False")
    throw new Error(data.Error || "OMDb: Not found");
  return data;
}
