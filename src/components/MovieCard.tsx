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

export function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <Card
      className="w-[150px] shrink-0 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 md:w-[200px]"
      onClick={onClick}
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
  );
}
