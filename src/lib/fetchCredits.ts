import { tmdbApi } from "./tmdb";

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
  mediaType: "movie" | "tv",
): Promise<CastMember[]> => {
  const response = await tmdbApi.get<CreditsResponse>(
    `/${mediaType}/${id}/credits`,
  );
  return response.data.cast;
};
