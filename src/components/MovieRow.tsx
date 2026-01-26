"use client";

import * as React from "react";
import { Movie, MediaType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { MovieCard } from "./MovieCard";
import { MovieCardSkeleton } from "./MovieCardSkeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

interface MovieRowProps {
  title: string;
  movies?: Movie[];
  fetchFunction?: () => Promise<Movie[]>;
  onMovieClick: (id: number, media_type: MediaType) => void;
  isLoading?: boolean;
  horizontal?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  headerActions?: React.ReactNode;
  isEditing?: boolean;
  selectedIds?: number[];
  onToggleSelect?: (id: number) => void;
}

export function MovieRow({
  title,
  movies: initialMovies,
  fetchFunction,
  onMovieClick,
  isLoading: initialIsLoading,
  horizontal = false,
  onRefresh,
  refreshing,
  headerActions,
  isEditing,
  selectedIds,
  onToggleSelect,
}: MovieRowProps) {
  const [movies, setMovies] = React.useState<Movie[]>(initialMovies || []);
  const [isLoading, setIsLoading] = React.useState(
    !!initialIsLoading || !initialMovies
  );
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (fetchFunction) {
      const loadMovies = async () => {
        try {
          setIsLoading(true);
          const fetchedMovies = await fetchFunction();
          setMovies(fetchedMovies);
        } catch (err: any) {
          let errorMessage = "An unknown error occurred.";
          if (err.message.includes("401")) {
            errorMessage =
              "Invalid API Key. Please check your .env.local file.";
          } else if (err.message) {
            errorMessage = err.message;
          }

          setError(errorMessage);
          toast({
            title: "Error fetching movies",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      loadMovies();
    }
  }, [fetchFunction, toast]);

  React.useEffect(() => {
    if (initialMovies) {
      setMovies(initialMovies);
    }
  }, [initialMovies]);

  React.useEffect(() => {
    if (initialIsLoading !== undefined) {
      setIsLoading(initialIsLoading);
    }
  }, [initialIsLoading]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex space-x-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="w-auto max-w-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (horizontal) {
      return (
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex space-x-4">
            {movies.map((movie, index) => (
              <MovieCard
                key={`${movie.id}-${movie.media_type || ""}-${index}`}
                movie={movie}
                onClick={() =>
                  onMovieClick(movie.id, movie.media_type || "movie")
                }
                isEditing={isEditing}
                isSelected={selectedIds?.includes(movie.id)}
                onToggleSelect={() =>
                  onToggleSelect && onToggleSelect(movie.id)
                }
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      );
    }
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] justify-start gap-x-3 gap-y-6 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {movies.map((movie, index) => (
          <MovieCard
            key={`${movie.id}-${movie.media_type || ""}-${index}`}
            movie={movie}
            onClick={() => onMovieClick(movie.id, movie.media_type || "movie")}
            isEditing={isEditing}
            isSelected={selectedIds?.includes(movie.id)}
            onToggleSelect={() => onToggleSelect && onToggleSelect(movie.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="container max-w-screen-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="ml-2 rounded p-2 hover:bg-muted"
            title="Refresh recommendations"
            disabled={!!refreshing}
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} />
          </button>
        )}
        {headerActions && <div className="ml-auto">{headerActions}</div>}
      </div>
      <div className="w-full rounded-md">{renderContent()}</div>
    </section>
  );
}
