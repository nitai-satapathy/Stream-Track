"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const SORT_OPTIONS = [
  { value: "popularity_desc", label: "Popularity Descending" },
  { value: "popularity_asc", label: "Popularity Ascending" },
  { value: "rating_desc", label: "Rating Descending" },
  { value: "rating_asc", label: "Rating Ascending" },
  { value: "release_desc", label: "Release Date Descending" },
  { value: "release_asc", label: "Release Date Ascending" },
  { value: "title_az", label: "Title (A–Z)" },
  { value: "title_za", label: "Title (Z–A)" },
];

interface FilterSortModalProps {
  isOpen: boolean;
  onClose: () => void;
  genres: string[];
  selectedGenres: string[];
  setSelectedGenres: (genres: string[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export function FilterSortModal({
  isOpen,
  onClose,
  genres,
  selectedGenres,
  setSelectedGenres,
  sortBy,
  setSortBy,
}: FilterSortModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
  <DialogContent className="max-h-[90vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-2xl sm:max-w-4xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Sort & Filter</DialogTitle>
          <DialogDescription>
            Refine your results by sorting and filtering.
          </DialogDescription>
        </DialogHeader>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 w-full">
          {/* Sort Section */}
          <div className="w-full">
            <h3 className="font-semibold mb-2">Sort By</h3>
            <div className="space-y-2">
              {SORT_OPTIONS.map(opt => (
                <label key={opt.value} className={`flex items-center gap-2 cursor-pointer rounded px-2 py-1 transition-colors ${sortBy === opt.value ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted'}`}>
                  <input
                    type="radio"
                    name="sortBy"
                    value={opt.value}
                    checked={sortBy === opt.value}
                    onChange={() => setSortBy(opt.value)}
                    className="accent-primary"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          {/* Filters Section */}
          <div>
            <h3 className="font-semibold mb-2">Filters</h3>
            {/* Release date filter removed */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Genres</label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-4 py-1 rounded-full shadow-sm border transition-all duration-150 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${selectedGenres.length === 0 ? 'bg-primary text-white border-primary' : 'bg-muted text-muted-foreground border-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                  onClick={() => setSelectedGenres([])}
                  type="button"
                >
                  All Genres
                </button>
                {genres.map(g => (
                  <button
                    key={g}
                    className={`px-4 py-1 rounded-full shadow-sm border transition-all duration-150 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${selectedGenres.includes(g) ? 'bg-primary text-white border-primary' : 'bg-muted text-muted-foreground border-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                    onClick={() => setSelectedGenres(selectedGenres.includes(g)
                      ? selectedGenres.filter(genre => genre !== g)
                      : [...selectedGenres, g])}
                    type="button"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            {/* Rating filter removed */}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-6 w-full">
          <DialogClose asChild>
            <Button className="w-full sm:w-1/2" variant="default">Apply</Button>
          </DialogClose>
          <Button className="w-full sm:w-1/2" variant="outline" type="button" onClick={() => {
            setSelectedGenres([]);
            setSortBy("popularity_desc");
            onClose();
          }}>Clear Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
