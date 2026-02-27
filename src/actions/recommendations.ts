"use server";

import { getRecommendations as genkitGetRecommendations } from "@/ai/flows/recommendation-flow";
import type { RecommendationInput } from "@/ai/flows/recommendation-flow";

export async function getRecommendations(input: RecommendationInput) {
    return genkitGetRecommendations(input);
}
