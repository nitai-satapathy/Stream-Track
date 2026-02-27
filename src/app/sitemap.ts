import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://stream-track.vercel.app";

    const routes = [
        "",
        "/welcome",
        "/about",
        "/watchlist",
        "/watched-tv",
        "/watched-movies",
        "/watching",
        "/recommendation",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    return routes;
}
