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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
            <RadioGroup
              value={sortBy}
              onValueChange={setSortBy}
              className="space-y-2"
            >
              {SORT_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  className={`flex items-center space-x-2 rounded px-2 py-1 transition-colors ${sortBy === opt.value ? "bg-primary/10" : "hover:bg-muted/50"}`}
                >
                  <RadioGroupItem value={opt.value} id={opt.value} />
                  <Label
                    htmlFor={opt.value}
                    className={`cursor-pointer w-full ${sortBy === opt.value ? "text-primary font-bold" : "text-foreground"}`}
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          {/* Filters Section */}
          <div>
            <h3 className="font-semibold mb-2">Filters</h3>
            {/* Release date filter removed */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Genres</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={
                    selectedGenres.length === 0 ? "default" : "secondary"
                  }
                  size="sm"
                  className="rounded-full h-8"
                  onClick={() => setSelectedGenres([])}
                >
                  All Genres
                </Button>
                {genres.map((g) => (
                  <Button
                    key={g}
                    variant={
                      selectedGenres.includes(g) ? "default" : "secondary"
                    }
                    size="sm"
                    className="rounded-full h-8"
                    onClick={() =>
                      setSelectedGenres(
                        selectedGenres.includes(g)
                          ? selectedGenres.filter((genre) => genre !== g)
                          : [...selectedGenres, g],
                      )
                    }
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>
            {/* Rating filter removed */}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-6 w-full">
          <DialogClose asChild>
            <Button className="w-full sm:w-1/2" variant="default">
              Apply
            </Button>
          </DialogClose>
          <Button
            className="w-full sm:w-1/2"
            variant="outline"
            type="button"
            onClick={() => {
              setSelectedGenres([]);
              setSortBy("");
              onClose();
            }}
          >
            Clear Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
