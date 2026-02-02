"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getLists } from "@/actions/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clapperboard, TvMinimalPlay, ListPlus, Edit } from "lucide-react";
import { ProfileModal } from "@/components/ProfileModal";
import { GenreChart } from "@/components/profile/GenreChart";
import { TimeStats } from "@/components/profile/TimeStats";
import { BadgeSection } from "@/components/profile/BadgeSection";
import type { Movie } from "@/lib/types";
import { Header } from "@/components/Header";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const [lists, setLists] = useState<{
        watchlist: Movie[];
        watching: Movie[];
        watched: Movie[];
    }>
        ({
            watchlist: [],
            watching: [],
            watched: [],
        });
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            if (user?.uid) {
                try {
                    const userLists = await getLists(user.uid);
                    setLists(userLists);
                } catch (error) {
                    console.error("Failed to load stats", error);
                } finally {
                    setIsLoadingStats(false);
                }
            } else if (!loading && !user) {
                // Handle guest/local storage
                setIsLoadingStats(false);
            }
        };
        loadStats();
    }, [user, loading]);

    // Auto-repair missing data (runtime/genres) for existing users
    useEffect(() => {
        const repairData = async () => {
            if (!lists.watched.length || !user) return;

            const itemsToRepair = lists.watched.filter(
                (m) =>
                    // Check for movies missing runtime or genres
                    (m.media_type === "movie" &&
                        (m.runtime === undefined || !m.genres)) ||
                    // Check for TV shows missing episode count or genres
                    (m.media_type === "tv" &&
                        (m.number_of_episodes === undefined || !m.genres))
            );

            if (itemsToRepair.length === 0) return;

            const { fetchMovieDetails } = await import("@/lib/tmdb");
            const { updateUserLists } = await import("@/actions/user");

            const enrichedItems = await Promise.all(
                lists.watched.map(async (item) => {
                    if (itemsToRepair.find((i) => i.id === item.id)) {
                        try {
                            const type = item.media_type || (item.title ? "movie" : "tv");
                            const details = await fetchMovieDetails(item.id, type);
                            return { ...item, ...details, media_type: type };
                        } catch (err) {
                            console.error(`Failed to repair item ${item.id}`, err);
                            return item;
                        }
                    }
                    return item;
                })
            );

            setLists((prev) => ({ ...prev, watched: enrichedItems }));

            await updateUserLists(user.uid, {
                watched: enrichedItems,
            });
        };

        const timeout = setTimeout(repairData, 2000);
        return () => clearTimeout(timeout);
    }, [lists.watched, user]);

    const watchedMoviesCount = lists.watched.filter(
        (m: Movie) => m.media_type === "movie" || (!m.media_type && m.title)
    ).length;
    const watchedTvCount = lists.watched.filter(
        (m: Movie) => m.media_type === "tv" || m.name
    ).length;
    const watchlistCount = lists.watchlist.length;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-20 text-center">
                <h1 className="text-2xl font-bold">
                    Please log in to view your profile.
                </h1>
                <div className="flex gap-4">
                    <Button asChild variant="outline">
                        <Link href="/">Go Home</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/login">Log In</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header lists={lists} />
            <div className="container max-w-4xl space-y-8 py-10 pt-24 md:pt-32">
                {/* Header Section */}
                <div className="flex flex-col items-center gap-6 rounded-2xl border border-border/50 bg-card p-6 shadow-sm md:flex-row">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                        <AvatarImage
                            src={user.photoURL || undefined}
                            alt={user.displayName || "User"}
                            className="object-cover"
                        />
                        <AvatarFallback className="text-4xl">
                            {user.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2 text-center md:text-left">
                        <h1 className="text-3xl font-bold">{user.displayName}</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                        <div className="pt-2">
                            <Button
                                onClick={() => setIsEditModalOpen(true)}
                                variant="outline"
                                className="gap-2"
                            >
                                <Edit className="h-4 w-4" /> Edit Profile
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Watched Movies
                            </CardTitle>
                            <Clapperboard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoadingStats ? "-" : watchedMoviesCount}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Lifetime movies watched
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Watched TV Shows
                            </CardTitle>
                            <TvMinimalPlay className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoadingStats ? "-" : watchedTvCount}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Lifetime shows watched
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
                            <ListPlus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoadingStats ? "-" : watchlistCount}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Items in your watchlist
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Badges Section */}
                <BadgeSection
                    watchedMovies={lists.watched.filter((m) => m.media_type === "movie" || (!m.media_type && m.title))}
                    watchedShows={lists.watched.filter((m) => m.media_type === "tv" || m.name)}
                />

                {/* Charts & Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <GenreChart
                        watchedMovies={lists.watched.filter((m) => m.media_type === "movie" || (!m.media_type && m.title))}
                        watchedShows={lists.watched.filter((m) => m.media_type === "tv" || m.name)}
                    />
                    <TimeStats
                        watchedMovies={lists.watched.filter((m) => m.media_type === "movie" || (!m.media_type && m.title))}
                        watchedShows={lists.watched.filter((m) => m.media_type === "tv" || m.name)}
                    />
                </div>

                <ProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                />
            </div>
        </div>
    );
}
