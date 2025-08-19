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
      className="w-[200px] shrink-0 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative h-[300px] w-full">
          <Image
            src={`${IMAGE_BASE_URL}${movie.poster_path}`}
            alt={movie.title || movie.name || "Movie poster"}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            data-ai-hint="movie poster"
          />
        </div>
        <div className="p-3">
          <h3 className="truncate font-semibold">{movie.title || movie.name}</h3>
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400" fill="currentColor" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </Badge>
            <span>{(movie.release_date || movie.first_air_date)?.substring(0, 4)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
