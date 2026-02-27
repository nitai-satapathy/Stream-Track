import type { Metadata } from "next";
import ClientWelcomePage from "./client";
import { fetchTrendingAll, fetchTrendingTv } from "@/lib/tmdb";

export const metadata: Metadata = {
    title: "Welcome",
    description: "Track What You Watch. Love What You Watch. A beautifully designed personal movie and TV show tracker with AI recommendations.",
};

export default async function WelcomePage() {
    const results = await Promise.allSettled([
        fetchTrendingAll("week"),
        fetchTrendingAll("day"),
        fetchTrendingTv("day")
    ]);

    const trendingWeek = results[0].status === 'fulfilled' ? results[0].value : [];
    const trendingDay = results[1].status === 'fulfilled' ? results[1].value : [];
    const trendingTvDay = results[2].status === 'fulfilled' ? results[2].value : [];

    const carouselMovies = [...(trendingWeek || []), ...(trendingWeek || [])].slice(0, 30);
    const aiMovies = trendingDay || [];
    const bentoWatchlist = trendingDay?.filter(t => t.poster_path).slice(0, 4) || [];
    const bentoTv = trendingTvDay?.filter(t => t.name).slice(0, 2) || [];

    return (
        <ClientWelcomePage
            carouselMovies={carouselMovies}
            trendingDay={aiMovies}
            bentoWatchlist={bentoWatchlist}
            bentoTv={bentoTv}
        />
    );
}
