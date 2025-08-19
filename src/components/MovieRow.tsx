"use client";

import * as React from "react";
import { Movie } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { MovieCard } from "./MovieCard";
import { MovieCardSkeleton } from "./MovieCardSkeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface MovieRowProps {
  title: string;
  movies?: Movie[];
  fetchFunction?: () => Promise<Movie[]>;
  onMovieClick: (id: number) => void;
  isLoading?: boolean;
}

export function MovieRow({
  title,
  movies: initialMovies,
  fetchFunction,
  onMovieClick,
  isLoading: initialIsLoading,
}: MovieRowProps) {
  const [movies, setMovies] = React.useState<Movie[]>(initialMovies || []);
  const [isLoading, setIsLoading] = React.useState(!!initialIsLoading || !initialMovies);
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
    if(initialIsLoading !== undefined) {
      setIsLoading(initialIsLoading);
    }
  }, [initialIsLoading])


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
        )
    }

    return (
      <div className="flex space-x-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={() => onMovieClick(movie.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="container max-w-screen-2xl">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        {renderContent()}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
