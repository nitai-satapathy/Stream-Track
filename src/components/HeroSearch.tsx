"use client";

import * as React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Flare } from "@/components/ui/Flare";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { Movie, MediaType } from "@/lib/types";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w200";

interface HeroSearchProps {
    value: string;
    onChange: (val: string) => void;
    onSubmit: () => void;
    placeholder?: string;
    className?: string;
    searchResults?: Movie[];
    isLoading?: boolean;
    onResultClick?: (id: number, media_type: MediaType) => void;
}

export function HeroSearch({
    value,
    onChange,
    onSubmit,
    placeholder = "Search...",
    className,
    searchResults = [],
    isLoading = false,
    onResultClick,
    autoFocus = false,
}: HeroSearchProps & { autoFocus?: boolean }) {
    const [focused, setFocused] = React.useState(false);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (autoFocus && inputRef.current) {
            // Small timeout to ensure modal animation/render doesn't steal focus
            setTimeout(() => {
                inputRef.current?.focus();
                setFocused(true);
            }, 100);
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [autoFocus]);

    const shouldShowResults = focused && (searchResults.length > 0 || isLoading);

    const [selectedIndex, setSelectedIndex] = React.useState(-1);

    // Reset selection when results change or modal closes
    React.useEffect(() => {
        setSelectedIndex(-1);
    }, [searchResults, focused]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!shouldShowResults) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
                    const item = searchResults[selectedIndex];
                    onResultClick?.(item.id, item.media_type || "movie");
                    setFocused(false);
                } else {
                    onSubmit();
                    inputRef.current?.blur();
                }
                break;
            case "Escape":
                setFocused(false);
                inputRef.current?.blur();
                break;
        }
    };

    return (
        <div ref={containerRef} className={cn("w-full max-w-xl mx-auto relative", className)}>
            <Flare.Base
                className={cn(
                    "rounded-[28px] transition-colors duration-300 relative group",
                    focused ? "bg-black/80" : "bg-white/5 hover:bg-black/80"
                )}
            >
                <Flare.Light
                    flareSize={400}
                    cssColorVar="var(--flare-rgb)"
                    enabled={focused}
                    className="rounded-[28px]"
                    backgroundClass={cn(
                        "transition-colors duration-300 rounded-[27px]",
                        focused ? "bg-black/90" : "bg-transparent group-hover:bg-black/90"
                    )}
                />
                <Flare.Child className="flex items-center relative z-20">
                    {/* Search Icon */}
                    <div
                        className="pl-5 pr-3 py-4 text-gray-400 cursor-pointer hover:text-white transition-colors"
                        onClick={(e) => {
                            e.preventDefault();
                            inputRef.current?.focus();
                        }}
                    >
                        <Search className="w-5 h-5" />
                    </div>

                    {/* Input */}
                    <form
                        className="flex-1"
                        onSubmit={(e) => {
                            e.preventDefault();
                            // If we have a selection, Enter is handled by onKeyDown
                            if (selectedIndex === -1) {
                                onSubmit();
                                inputRef.current?.blur();
                            }
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onFocus={() => {
                                setFocused(true);
                            }}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent border-none outline-none text-lg text-white placeholder:text-gray-500 py-4 pr-12"
                            placeholder={placeholder}
                            role="combobox"
                            aria-expanded={shouldShowResults}
                            aria-controls="search-results-listbox"
                            aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
                        />
                    </form>

                    {/* Clear Button */}
                    {value.length > 0 && (
                        <button
                            onClick={() => {
                                onChange("");
                                inputRef.current?.focus();
                            }}
                            className="absolute right-3 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-all"
                            aria-label="Clear search"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </Flare.Child>
            </Flare.Base>

            {/* Search Results Dropdown */}
            {shouldShowResults && (
                <div
                    id="search-results-listbox"
                    role="listbox"
                    className="absolute top-full left-0 right-0 mt-4 bg-gray-950/95 border border-white/10 rounded-xl backdrop-blur-md shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                        </div>
                    ) : (
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {searchResults.map((item, index) => (
                                <div
                                    key={`${item.id}-${item.media_type}`}
                                    id={`result-${index}`}
                                    role="option"
                                    aria-selected={index === selectedIndex}
                                    className={cn(
                                        "flex items-center gap-4 p-2 rounded-lg transition-colors cursor-pointer group",
                                        index === selectedIndex ? "bg-white/20" : "hover:bg-white/10"
                                    )}
                                    onClick={() => {
                                        onResultClick?.(item.id, item.media_type || "movie");
                                        setFocused(false);
                                    }}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="relative w-12 h-16 shrink-0 rounded-md overflow-hidden bg-gray-800">
                                        <Image
                                            src={
                                                item.poster_path
                                                    ? `${IMAGE_BASE_URL}${item.poster_path}`
                                                    : "https://placehold.co/48x64/png?text=No+Image"
                                            }
                                            alt={item.title || item.name || "Poster"}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <h4 className="font-medium text-white truncate text-base">
                                            {item.title || item.name}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                            <span className="capitalize">{item.media_type === 'tv' ? 'TV Show' : 'Movie'}</span>
                                            <span>•</span>
                                            <span>
                                                {(item.release_date || item.first_air_date)?.substring(0, 4) || "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {searchResults.length === 0 && !isLoading && (
                                <div className="p-4 text-center text-gray-400 text-sm">
                                    No results found for &quot;{value}&quot;
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
