"use server";
/**
 * @fileOverview A movie and TV show recommendation AI agent.
 *
 * - getRecommendations - A function that handles the recommendation process.
 * - RecommendationInput - The input type for the getRecommendations function.
 * - RecommendationOutput - The return type for the getRecommendations function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import {
  fetchMovieDetails,
  fetchTVShowDetails,
  searchMulti,
  fetchHiddenGems,
  fetchSimilar,
  fetchTopRatedMovies,
  fetchTopRatedTvShows,
  fetchTrendingMovies,
  fetchTrendingTv,
} from "@/lib/tmdb";
import type { Movie } from "@/lib/types";

// --- Schema Definitions ---

const MovieContextSchema = z.object({
  id: z.number(),
  title: z.string(),
  media_type: z.enum(["movie", "tv"]).optional(),
  genres: z.array(z.string()).optional(),
  release_date: z.string().optional(),
  vote_average: z.number().optional(),
});

const RecommendationInputSchema = z.object({
  watched: z.array(MovieContextSchema).describe("List of movies/shows the user has watched."),
  watching: z.array(MovieContextSchema).describe("List of movies/shows the user is currently watching."),
  watchlist: z.array(MovieContextSchema).optional().describe("List of movies/shows in the user's watchlist."),
  forcedMediaType: z.enum(["movie", "tv"]).optional().describe("Force recommendations to be only movies or only TV shows."),
});

export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

const RecommendedItemSchema = z.object({
  title: z.string().describe("The exact title of the recommended movie or TV show."),
  year: z.string().optional().describe("The release year to help identify the movie/show."),
  reason: z.string().describe("A concise, punchy explanation of WHY this is recommended (e.g. 'Because you watched X', 'Critically acclaimed hidden gem')."),
  match_score: z.number().describe("A score from 0-100 indicating how good of a match this is."),
  tmdb_id: z.number().optional().describe("The TMDb ID if known (optional, used for verification)."),
});

const RecommendationOutputSchema = z.object({
  recommendations: z.array(RecommendedItemSchema).describe("A list of 5-10 recommended movies or TV shows."),
});

export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;

async function getCandidates(input: RecommendationInput): Promise<Movie[]> {
  const { watched, watching, watchlist, forcedMediaType } = input;
  const allItems = [...watched, ...watching, ...(watchlist || [])];

  // Helper to shuffle and pick n items
  const pickRandom = <T>(arr: T[], n: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  };

  let candidates: Movie[] = [];

  try {
    if (allItems.length === 0) {
      // Trending + Top Rated + Generic Hidden Gems
      const fetchM = !forcedMediaType || forcedMediaType === 'movie';
      const fetchT = !forcedMediaType || forcedMediaType === 'tv';

      const promises = [];
      if (fetchM) promises.push(fetchTrendingMovies().then(res => pickRandom(res, 5)));
      if (fetchT) promises.push(fetchTrendingTv().then(res => pickRandom(res, 5)));
      if (fetchM) promises.push(fetchTopRatedMovies().then(res => pickRandom(res, 5)));
      if (fetchT) promises.push(fetchTopRatedTvShows().then(res => pickRandom(res, 5)));
      if (fetchM) promises.push(fetchHiddenGems("movie").then(res => pickRandom(res, 5)));
      if (fetchT) promises.push(fetchHiddenGems("tv").then(res => pickRandom(res, 5)));

      const results = await Promise.allSettled(promises);
      results.forEach(res => {
        if (res.status === 'fulfilled') candidates.push(...res.value);
      });
      return candidates;
    }

    const fetchM = !forcedMediaType || forcedMediaType === 'movie';
    const fetchT = !forcedMediaType || forcedMediaType === 'tv';

    const promises = [];
    if (fetchM) promises.push(fetchTrendingMovies().then(res => pickRandom(res, 5)));
    if (fetchT) promises.push(fetchTrendingTv().then(res => pickRandom(res, 5)));
    if (fetchM) promises.push(fetchTopRatedMovies().then(res => pickRandom(res, 3)));
    if (fetchT) promises.push(fetchTopRatedTvShows().then(res => pickRandom(res, 3)));
    if (fetchM) promises.push(fetchHiddenGems("movie").then(res => pickRandom(res, 5)));
    if (fetchT) promises.push(fetchHiddenGems("tv").then(res => pickRandom(res, 5)));
    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        candidates.push(...result.value);
      } else {
        console.warn(`Candidate source ${index} failed:`, result.reason);
      }
    });

    // 2. Similar Items (from a recent item + a random item)
    try {
      const recentItem = allItems[allItems.length - 1];
      const randomItem = pickRandom(allItems, 1)[0];
      const sourceItems = [recentItem, randomItem].filter(Boolean);
      const uniqueSourceIds = new Set<number>();

      const similarPromises = sourceItems.map(async (item) => {
        if (item.id && !uniqueSourceIds.has(item.id)) {
          uniqueSourceIds.add(item.id);
          const type = item.media_type || "movie";

          if (forcedMediaType && type !== forcedMediaType) {
            return [];
          }

          const similar = await fetchSimilar(type as "movie" | "tv", item.id);
          return pickRandom(similar, 5);
        }
        return [];
      });

      const similarResults = await Promise.allSettled(similarPromises);
      similarResults.forEach(res => {
        if (res.status === 'fulfilled') candidates.push(...res.value);
      });

    } catch (e) {
      console.error("Error fetching similar items:", e);
    }

  } catch (e) {
    console.error("Error generating candidates:", e);
    const [trendingM] = await Promise.all([fetchTrendingMovies()]);
    return trendingM;
  }

  const uniqueCandidates = Array.from(new Map(candidates.map(m => [m.id, m])).values());

  const typeFiltered = forcedMediaType
    ? uniqueCandidates.filter(c => c.media_type === forcedMediaType || (forcedMediaType === 'movie' ? !c.media_type : false)) // assume 'movie' default if undefined
    : uniqueCandidates;

  const seenIds = new Set(allItems.map(i => i.id));
  return typeFiltered.filter(c => !seenIds.has(c.id));
}

const prompt = ai.definePrompt({
  name: "recommendationPrompt",
  input: {
    schema: z.object({
      userProfile: z.string(),
      candidates: z.string(),
      constraintText: z.string().optional(),
    })
  },
  output: { schema: RecommendationOutputSchema },
  prompt: `You are a sophisticated movie and TV show recommendation engine.
  
  Your goal is to recommend the best 5 titles for the user based on their history and a provided list of candidate items.
  
  **User Profile:**
  {{userProfile}}
  
  **Candidate Pool (Generated from TMDB, includes Trending, Top Rated, Hidden Gems, and Similar items):**
  {{candidates}}

  {{constraintText}}
  
  **Instructions:**
  1. Analyze the user's taste (genres, tone, themes).
  2. Select the best matches from the Candidate Pool. 
  3. **Crucial:** Provide a **concise, punchy "reason"** for each recommendation.
     - If it's similar to a watched item, say "Because you watched [Movie Name]".
     - If it's a high-rated but lesser-known movie, describe it as a "Hidden Gem".
     - Avoid generic phrases like "Good match for your taste." Be specific.
  4. {{constraintText}}
  5. Output structured JSON.
  `,
});

export const getRecommendationsFlow = ai.defineFlow(
  {
    name: "recommendationFlow",
    inputSchema: RecommendationInputSchema,
    outputSchema: RecommendationOutputSchema,
  },
  async (input) => {
    // 1. Fetch Candidates (RAG step)
    const candidates = await getCandidates(input);

    // 2. Prepare Context for LLM
    const userProfileText = `
    Watched: ${input.watched.map(m => `${m.title} (${m.genres?.join(", ") || "Unknown Genre"})`).join("; ")}
    Watching: ${input.watching.map(m => `${m.title} (${m.genres?.join(", ") || "Unknown Genre"})`).join("; ")}
    Watchlist: ${input.watchlist?.map(m => `${m.title} (${m.genres?.join(", ") || "Unknown Genre"})`).join("; ")}
    `;

    const candidatesText = candidates.map(c =>
      `- ${c.title || c.name} (ID: ${c.id}, Type: ${c.media_type}, Rating: ${c.vote_average})`
    ).join("\n");

    let constraintText = "";
    if (input.forcedMediaType === "movie") {
      constraintText = "**CONSTRAINT:** You MUST ONLY recommend **Movies**. Do NOT recommend TV shows.";
    } else if (input.forcedMediaType === "tv") {
      constraintText = "**CONSTRAINT:** You MUST ONLY recommend **TV Shows**. Do NOT recommend Movies.";
    } else {
      constraintText = "Ensure a mix of Movies and TV Shows if appropriate.";
    }

    // 3. Call LLM
    const { output } = await prompt({
      userProfile: userProfileText,
      candidates: candidatesText,
      constraintText,
    });

    if (!output) throw new Error("AI failed to generate recommendations");
    return output;
  }
);

export async function getRecommendations(
  input: RecommendationInput
): Promise<RecommendationOutput> {
  return getRecommendationsFlow(input);
}
