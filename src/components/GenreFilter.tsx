"use client";

import * as React from "react";
import { Genre } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

interface GenreFilterProps {
    genres: Genre[];
    selectedGenre: number | null;
    onSelect: (id: number) => void;
}

export function GenreFilter({
    genres,
    selectedGenre,
    onSelect,
}: GenreFilterProps) {
    const visibleGenres = genres.slice(0, 5);
    const overflowGenres = genres.slice(5);

    const isOverflowSelected =
        selectedGenre && overflowGenres.some((g) => g.id === selectedGenre);

    const selectedOverflowGenre =
        isOverflowSelected && selectedGenre
            ? overflowGenres.find((g) => g.id === selectedGenre)
            : null;

    return (
        <div className="flex items-center space-x-2">
            {/* Desktop View */}
            <div className="hidden md:flex items-center space-x-2">
                {visibleGenres.map((genre) => (
                    <Button
                        key={genre.id}
                        variant={selectedGenre === genre.id ? "default" : "secondary"}
                        size="sm"
                        onClick={() => onSelect(genre.id)}
                        className={cn(
                            "rounded-full transition-all",
                            selectedGenre === genre.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80",
                        )}
                    >
                        {genre.name}
                    </Button>
                ))}

                {overflowGenres.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            {selectedOverflowGenre ? (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center space-x-1 px-3"
                                >
                                    <span>{selectedOverflowGenre.name}</span>
                                    <MoreHorizontal className="h-3 w-3" />
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More genres</span>
                                </Button>
                            )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="max-h-[300px] overflow-y-auto"
                        >
                            {overflowGenres.map((genre) => (
                                <DropdownMenuItem
                                    key={genre.id}
                                    onClick={() => onSelect(genre.id)}
                                    className={cn(
                                        selectedGenre === genre.id &&
                                        "bg-accent text-accent-foreground",
                                    )}
                                >
                                    {genre.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Select genre</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="max-h-[300px] overflow-y-auto"
                    >
                        {genres.map((genre) => (
                            <DropdownMenuItem
                                key={genre.id}
                                onClick={() => onSelect(genre.id)}
                                className={cn(
                                    selectedGenre === genre.id &&
                                    "bg-accent text-accent-foreground",
                                )}
                            >
                                {genre.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
