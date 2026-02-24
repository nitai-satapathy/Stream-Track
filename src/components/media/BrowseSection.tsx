"use client";

import * as React from "react";
import { Movie, Genre, MediaType } from "@/lib/types";
import { MovieRow } from "@/components/media/MovieRow";
import { GenreFilter } from "@/components/media/GenreFilter";
import { fetchGenres, discoverByGenre } from "@/lib/tmdb";

interface BrowseSectionProps {
  title: string;
  mediaType: MediaType;
  onMovieClick: (id: number, mediaType: MediaType) => void;
}

export function BrowseSection({
  title,
  mediaType,
  onMovieClick,
}: BrowseSectionProps) {
  const [genres, setGenres] = React.useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = React.useState<number | null>(null);
  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadGenres = async () => {
      try {
        const fetchedGenres = await fetchGenres(mediaType);
        setGenres(fetchedGenres);
        if (fetchedGenres.length > 0) {
          setSelectedGenre(fetchedGenres[0].id);
        }
      } catch (error) {
        console.error(`Failed to fetch ${mediaType} genres:`, error);
      }
    };
    loadGenres();
  }, [mediaType]);

  React.useEffect(() => {
    if (!selectedGenre) return;

    const loadContent = async () => {
      setIsLoading(true);
      try {
        const content = await discoverByGenre(mediaType, selectedGenre);
        setMovies(content);
      } catch (error) {
        console.error(
          `Failed to fetch ${mediaType} content for genre ${selectedGenre}:`,
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [mediaType, selectedGenre]);

  const selectedGenreName = genres.find((g) => g.id === selectedGenre)?.name;
  const displayTitle = selectedGenreName
    ? `${selectedGenreName} ${mediaType === "movie" ? "Movies" : "TV Shows"}`
    : title;

  return (
    <MovieRow
      title={displayTitle}
      movies={movies}
      onMovieClick={onMovieClick}
      isLoading={isLoading}
      horizontal={true}
      headerActions={
        <GenreFilter
          genres={genres}
          selectedGenre={selectedGenre}
          onSelect={setSelectedGenre}
        />
      }
    />
  );
}
