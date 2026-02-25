"use client";

import * as React from "react";
import { Movie, MediaType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { MovieCard } from "@/components/media/MovieCard";
import { MovieCardSkeleton } from "@/components/media/MovieCardSkeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { DataError } from "@/components/shared/DataError";
import { motion } from "framer-motion";

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
  error?: string | null;
  onRetry?: () => void;
  onDismiss?: (id: number) => void;
  onQuickAdd?: (movie: Movie) => void;
  onQuickWatched?: (movie: Movie) => void;
  checkIsWatchlist?: (id: number) => boolean;
  checkIsWatched?: (id: number) => boolean;
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
  error: externalError,
  onRetry,
  onDismiss,
  onQuickAdd,
  onQuickWatched,
  checkIsWatchlist,
  checkIsWatched,
}: MovieRowProps) {
  const [movies, setMovies] = React.useState<Movie[]>(initialMovies || []);
  const [isLoading, setIsLoading] = React.useState(
    !!initialIsLoading || !initialMovies
  );
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const displayError = externalError !== undefined ? externalError : error;

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

  const rowRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkForScroll = () => {
    if (rowRef.current) {
      const viewport = rowRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;
      if (viewport) {
        const { scrollLeft, scrollWidth, clientWidth } = viewport;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    }
  };

  React.useEffect(() => {
    if (horizontal) {
      checkForScroll();
      window.addEventListener("resize", checkForScroll);

      const viewport = rowRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;

      if (viewport) {
        viewport.addEventListener("scroll", checkForScroll);
      }

      return () => {
        window.removeEventListener("resize", checkForScroll);
        if (viewport) {
          viewport.removeEventListener("scroll", checkForScroll);
        }
      };
    }
  }, [horizontal, movies]);


  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const viewport = rowRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;

      if (viewport) {
        const { scrollLeft, clientWidth } = viewport;
        const scrollTo =
          direction === "left"
            ? scrollLeft - clientWidth / 2
            : scrollLeft + clientWidth / 2;

        viewport.scrollTo({ left: scrollTo, behavior: "smooth" });
      }
    }
  };

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

    if (displayError) {
      return (
        <DataError
          title="Failed to load content"
          message={displayError}
          onRetry={onRetry || (() => {
            if (fetchFunction) {
              const loadMovies = async () => {
                try {
                  setIsLoading(true);
                  setError(null);
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
                } finally {
                  setIsLoading(false);
                }
              };
              loadMovies();
            }
          })}
        />
      );
    }

    if (horizontal) {
      return (
        <div className="relative group">
          {canScrollLeft && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-100 transition-opacity"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            </>
          )}

          <ScrollArea ref={rowRef} className="w-full whitespace-nowrap rounded-md">
            <div className="flex w-max space-x-4 p-4 snap-x snap-mandatory">
              {movies.map((movie, index) => (
                <div key={`${movie.id}-${movie.media_type || ""}-${index}`} className="snap-center">
                  <MovieCard
                    movie={movie}
                    onClick={() =>
                      onMovieClick(movie.id, movie.media_type || "movie")
                    }
                    isEditing={isEditing}
                    isSelected={selectedIds?.includes(movie.id)}
                    onToggleSelect={() =>
                      onToggleSelect && onToggleSelect(movie.id)
                    }
                    onDismiss={onDismiss ? (e) => onDismiss(movie.id) : undefined}
                    onQuickAdd={onQuickAdd ? (e) => onQuickAdd(movie) : undefined}
                    onQuickWatched={onQuickWatched ? (e) => onQuickWatched(movie) : undefined}
                    isInWatchlist={checkIsWatchlist ? checkIsWatchlist(movie.id) : undefined}
                    isWatched={checkIsWatched ? checkIsWatched(movie.id) : undefined}
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {canScrollRight && (
            <>
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-100 transition-opacity"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
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
            onDismiss={onDismiss ? (e) => onDismiss(movie.id) : undefined}
            onQuickAdd={onQuickAdd ? (e) => onQuickAdd(movie) : undefined}
            onQuickWatched={onQuickWatched ? (e) => onQuickWatched(movie) : undefined}
            isInWatchlist={checkIsWatchlist ? checkIsWatchlist(movie.id) : undefined}
            isWatched={checkIsWatched ? checkIsWatched(movie.id) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="container max-w-screen-2xl"
    >
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-bold md:text-2xl border-l-4 border-primary pl-4">{title}</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="rounded p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh recommendations"
            disabled={!!refreshing}
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} size={18} />
          </button>
        )}
        {headerActions && <div className="ml-auto">{headerActions}</div>}
      </div>
      <div className="w-full rounded-md">{renderContent()}</div>
    </motion.section>
  );
}
