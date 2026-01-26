import Image from "next/image";
import type { Movie } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Badge } from "./ui/badge";

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export function MovieCard({
  movie,
  onClick,
  isEditing,
  isSelected,
  onToggleSelect,
}: MovieCardProps & {
  isEditing?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (isEditing && onToggleSelect) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelect();
    } else {
      onClick();
    }
  };

  return (
    <div className="relative">
      <Card
        className={`w-[150px] shrink-0 cursor-pointer overflow-hidden transition-all duration-300 md:w-[200px] ${isEditing ? "animate-shake hover:none" : "hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
          }`}
        onClick={handleClick}
      >
        <CardContent className="p-0">
          <div className="relative h-[210px] w-full md:h-[300px]">
            <Image
              src={
                movie.poster_path
                  ? `${IMAGE_BASE_URL}${movie.poster_path}`
                  : "https://placehold.co/200x300.png?text=No+Image"
              }
              alt={movie.title || movie.name || "Movie poster"}
              fill
              className="rounded-t-lg object-cover"
              data-ai-hint="movie poster"
              sizes="(max-width: 768px) 140px, 200px"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                {isSelected ? (
                  <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 opacity-70">
                      <path d="M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : (
                  <div className="rounded-full bg-black/20 p-2 backdrop-blur-sm">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 opacity-70">
                      <path d="M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="p-2 md:p-3">
            <h3 className="truncate text-sm font-semibold md:text-base">
              {movie.title || movie.name}
            </h3>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground md:mt-2 md:text-sm">
              <Badge
                variant="outline"
                className="flex h-5 items-center gap-1 px-1 py-0 md:h-auto"
              >
                <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </Badge>
              <span className="text-[10px] md:text-sm">
                {(movie.release_date || movie.first_air_date)?.substring(0, 4)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
