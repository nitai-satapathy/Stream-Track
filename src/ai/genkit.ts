import { genkit } from "genkit";
import { groq } from "genkitx-groq";
import * as dotenv from "dotenv";

dotenv.config();

export const ai = genkit({
  plugins: [
    groq({
      apiKey: process.env.GROQ_API_KEY,
    }),
  ],
  model: "groq/llama-3.3-70b-versatile",
});
