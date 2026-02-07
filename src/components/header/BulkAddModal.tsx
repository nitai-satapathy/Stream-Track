"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { searchMulti } from "@/lib/tmdb";
import type { Movie } from "@/lib/types";

interface BulkAddModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    watchedMovies: Movie[];
    watchedShows: Movie[];
    setWatchedMovies?: (movies: Movie[]) => void;
    setWatchedShows?: (shows: Movie[]) => void;
    user: any;
}

export function BulkAddModal({
    isOpen,
    onOpenChange,
    watchedMovies,
    watchedShows,
    setWatchedMovies,
    setWatchedShows,
    user,
}: BulkAddModalProps) {
    const [bulkInput, setBulkInput] = React.useState("");
    const [bulkStatus, setBulkStatus] = React.useState<string | null>(null);
    const [bulkLoading, setBulkLoading] = React.useState(false);

    const handleBulkAdd = async () => {
        setBulkStatus(null);
        setBulkLoading(true);
        const titles = bulkInput
            .split(/\r?\n/)
            .map((t) => t.trim())
            .filter(Boolean);

        if (!titles.length) {
            setBulkStatus("Please enter at least one name.");
            setBulkLoading(false);
            return;
        }

        const foundMovies: Movie[] = [];
        const foundShows: Movie[] = [];
        const notFound: string[] = [];

        for (const title of titles) {
            try {
                const results = await searchMulti(title);
                const item = results[0];
                if (item) {
                    if (
                        item.media_type === "movie" ||
                        (!item.media_type && item.title)
                    ) {
                        if (!watchedMovies.some((m) => m.id === item.id))
                            foundMovies.push(item);
                    } else if (item.media_type === "tv" || item.name) {
                        if (!watchedShows.some((s) => s.id === item.id)) {
                            // Smart Logic: Fetch details and mark all episodes
                            try {
                                const { enrichTVShowWithEpisodes } = await import("@/lib/tmdb");
                                const enriched = await enrichTVShowWithEpisodes(item.id, item);
                                foundShows.push(enriched);
                            } catch (e) {
                                console.error("Failed to fetch details for smart add", item.name, e);
                                foundShows.push(item);
                            }
                        }
                    } else {
                        notFound.push(title);
                    }
                } else {
                    notFound.push(title);
                }
            } catch {
                notFound.push(title);
            }
        }

        // Always update both watched movies and shows
        let newMovies = watchedMovies;
        let newShows = watchedShows;

        if (foundMovies.length) {
            newMovies = [...watchedMovies, ...foundMovies];
            if (setWatchedMovies) setWatchedMovies(newMovies);
        }
        if (foundShows.length) {
            newShows = [...watchedShows, ...foundShows];
            if (setWatchedShows) setWatchedShows(newShows);
        }

        if (user) {
            // Get current lists from DB, merge, and update
            const { getLists, updateUserLists } = await import("@/actions/user");
            const lists = await getLists(user.uid);

            // Type safety for existing lists
            const currentWatchedMovies = lists.watched.filter(
                (m: Movie) => m.media_type === "movie" || (!m.media_type && m.title)
            );
            const currentWatchedShows = lists.watched.filter(
                (m: Movie) => m.media_type === "tv" || m.name
            );

            const mergedMovies = [
                ...currentWatchedMovies,
                ...foundMovies.filter(
                    (fm: Movie) => !currentWatchedMovies.some((m: Movie) => m.id === fm.id)
                ),
            ];
            const mergedShows = [
                ...currentWatchedShows,
                ...foundShows.filter(
                    (fs: Movie) => !currentWatchedShows.some((s: Movie) => s.id === fs.id)
                ),
            ];

            await updateUserLists(user.uid, {
                watched: [...mergedMovies, ...mergedShows],
            });
        } else {
            // LocalStorage: merge and update
            const stored = localStorage.getItem("watched");
            let watchedList = [];
            try {
                watchedList = stored ? JSON.parse(stored) : [];
            } catch { }

            const currentWatchedMovies = watchedList.filter(
                (m: Movie) => m.media_type === "movie" || (!m.media_type && m.title)
            );
            const currentWatchedShows = watchedList.filter(
                (m: Movie) => m.media_type === "tv" || m.name
            );

            const mergedMovies = [
                ...currentWatchedMovies,
                ...foundMovies.filter(
                    (fm: Movie) => !currentWatchedMovies.some((m: Movie) => m.id === fm.id)
                ),
            ];
            const mergedShows = [
                ...currentWatchedShows,
                ...foundShows.filter(
                    (fs: Movie) => !currentWatchedShows.some((s: Movie) => s.id === fs.id)
                ),
            ];

            localStorage.setItem(
                "watched",
                JSON.stringify([...mergedMovies, ...mergedShows])
            );
        }

        setBulkStatus(
            (foundMovies.length ? `Added ${foundMovies.length} movie(s). ` : "") +
            (foundShows.length ? `Added ${foundShows.length} show(s). ` : "") +
            (notFound.length ? `Not found: ${notFound.join(", ")}` : "")
        );
        setBulkLoading(false);
        setBulkInput("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bulk Add Movies & TV Shows</DialogTitle>
                </DialogHeader>
                <label htmlFor="bulk-names" className="font-medium">
                    Paste multiple names (one per line):
                </label>
                <Textarea
                    id="bulk-names"
                    className="min-h-[120px] w-full border-blue-200 bg-blue-50/50 placeholder:text-blue-400 focus-visible:ring-blue-400 dark:border-blue-800 dark:bg-blue-950/20 dark:placeholder:text-blue-500"
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="Movie or Show 1&#10;Movie or Show 2"
                    disabled={bulkLoading}
                />
                <Button
                    className="mt-2 rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
                    onClick={handleBulkAdd}
                    disabled={bulkLoading}
                >
                    {bulkLoading ? "Adding..." : "Add to Watched"}
                </Button>
                {bulkStatus && (
                    <div className="mt-2 text-sm text-muted-foreground">{bulkStatus}</div>
                )}
                <DialogClose asChild>
                    <Button variant="outline" className="mt-2 w-full">
                        Close
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}
