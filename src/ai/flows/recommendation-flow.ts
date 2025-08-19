'use server';
/**
 * @fileOverview A movie and TV show recommendation AI agent.
 *
 * - getRecommendations - A function that handles the recommendation process.
 * - RecommendationInput - The input type for the getRecommendations function.
 * - RecommendationOutput - The return type for the getRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendationInputSchema = z.object({
  watched: z.array(z.string()).describe('A list of movies and TV shows the user has watched.'),
  watching: z.array(z.string()).describe('A list of movies and TV shows the user is currently watching.'),
});
export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

const RecommendationOutputSchema = z.object({
    recommendations: z.array(z.object({
        title: z.string().describe('The title of the recommended movie or TV show.'),
        overview: z.string().describe('A brief overview of the recommended movie or TV show.'),
    })).describe('A list of recommended movies or TV shows.')
});
export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;

export async function getRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
  return recommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendationPrompt',
  input: {schema: RecommendationInputSchema},
  output: {schema: RecommendationOutputSchema},
  prompt: `You are a movie and TV show recommendation expert. Based on the following lists of what a user has watched and is currently watching, provide a list of 5 new recommendations. Provide a mix of both movies and TV shows.

Do not recommend titles that are already in the user's watched or watching lists.

User's Watched List:
{{#each watched}}
- {{{this}}}
{{/each}}

User's Currently Watching List:
{{#each watching}}
- {{{this}}}
{{/each}}
`,
});

const recommendationFlow = ai.defineFlow(
  {
    name: 'recommendationFlow',
    inputSchema: RecommendationInputSchema,
    outputSchema: RecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
