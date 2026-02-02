import Image from "next/image";
import type { Movie } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Check, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { TMDB_IMAGE_BASE_URL_W500 } from "@/lib/constants";

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}


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
                  ? `${TMDB_IMAGE_BASE_URL_W500}${movie.poster_path}`
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
                    <Check className="w-8 h-8 opacity-70 text-white" />
                  </div>
                ) : (
                  <div className="rounded-full bg-black/20 p-2 backdrop-blur-sm">
                    <X className="w-8 h-8 opacity-70 text-white" />
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
