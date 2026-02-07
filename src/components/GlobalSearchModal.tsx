"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { HeroSearch } from "@/components/HeroSearch";
import { searchMulti } from "@/lib/tmdb";
import { getHeroContent, getRandomPlaceholder } from "@/lib/hero-content";
import { MovieModal } from "@/components/MovieModal";
import { useRouter } from "next/navigation";
import type { Movie, MediaType } from "@/lib/types";

// Re-use types from Header or define locally
type ListType = "watchlist" | "watching" | "watched";

interface GlobalSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onListUpdate: (movie: Movie, list: ListType) => Promise<void>;
    updateMovieProgress?: (movie: Movie) => Promise<void>;
    lists?: {
        watchlist: Movie[];
        watching: Movie[];
        watched: Movie[];
    };
}

export function GlobalSearchModal({ isOpen, onClose, onListUpdate, updateMovieProgress, lists }: GlobalSearchModalProps) {
    const router = useRouter();
    // ... existing state ...
    const [searchQuery, setSearchQuery] = React.useState("");
    const [searchResults, setSearchResults] = React.useState<Movie[]>([]);
    const [isSearchLoading, setIsSearchLoading] = React.useState(false);
    const [heroPlaceholder, setHeroPlaceholder] = React.useState("What are you in the mood for?");

    // Selected Item for MovieModal
    const [selectedItem, setSelectedItem] = React.useState<{
        id: number;
        media_type: MediaType;
    } | null>(null);

    // Initialize random placeholder when opened
    React.useEffect(() => {
        if (isOpen) {
            setHeroPlaceholder(getRandomPlaceholder());
        }
    }, [isOpen]);

    // Search Effect
    React.useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearchLoading(true);
        const handler = setTimeout(async () => {
            try {
                const results = await searchMulti(searchQuery);
                setSearchResults(results.slice(0, 5));
            } catch (error) {
                console.error("Search failed:", error);
                setSearchResults([]);
            } finally {
                setIsSearchLoading(false);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Unified Close Handler: Resets state and closes modal
    const closeModal = React.useCallback(() => {
        setSearchQuery("");
        setSearchResults([]);
        setSelectedItem(null);
        onClose();
    }, [onClose]);

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            closeModal();
        }
    };

    const handleResultClick = (id: number, media_type: MediaType) => {
        setSelectedItem({ id, media_type });
    };

    const isMovieInList = React.useCallback(
        (movieId: number, list: ListType) => {
            if (!lists) return false;
            return lists[list].some((m) => m.id === movieId);
        },
        [lists]
    );

    // Mounted check for Portal
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    // ESC Listener
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                closeModal();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, closeModal]);

    // Derive userMovie
    const userMovie = React.useMemo(() => {
        if (!selectedItem || !lists) return undefined;
        return lists.watching.find(m => m.id === selectedItem.id) ||
            lists.watched.find(m => m.id === selectedItem.id) ||
            lists.watchlist.find(m => m.id === selectedItem.id);
    }, [selectedItem, lists]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 animate-in fade-in duration-200 pointer-events-none">
            {!selectedItem && (
                <>
                    {/* Blurry Backdrop */}
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-md pointer-events-auto"
                        onClick={closeModal}
                    />

                    {/* Search Container */}
                    <div className="relative w-full max-w-2xl z-10 flex flex-col items-center pointer-events-auto">
                        <div className="relative w-full">
                            <HeroSearch
                                value={searchQuery}
                                onChange={setSearchQuery}
                                onSubmit={handleSearchSubmit}
                                placeholder={heroPlaceholder}
                                className="w-full shadow-2xl"
                                searchResults={searchResults}
                                isLoading={isSearchLoading}
                                onResultClick={handleResultClick}
                                autoFocus={true}
                            />
                        </div>

                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">ESC</kbd> to close
                        </div>
                    </div>
                </>
            )}

            <div className="pointer-events-auto">
                <MovieModal
                    movieId={selectedItem?.id ?? null}
                    mediaType={selectedItem?.media_type ?? null}
                    isOpen={!!selectedItem}
                    onClose={closeModal}
                    onListUpdate={onListUpdate}
                    isMovieInList={isMovieInList}
                    onMovieSelect={handleResultClick}
                    userMovie={userMovie}
                    updateMovieProgress={updateMovieProgress}
                />
            </div>
        </div>,
        document.body
    );
}
