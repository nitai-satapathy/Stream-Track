"use client";

import * as React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Check, Trash2, Tv, Calendar, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { calculateDaysUntil, getAirDateStatus, getAirDateColor } from "@/lib/dateUtils";
import type { EpisodeNotification, GroupedEpisodeNotification } from "@/types/notifications";

type NotificationItemProps = {
  notification: EpisodeNotification | GroupedEpisodeNotification;
  onMarkAsRead: (id: string) => void;
  onMarkAsWatched?: (id: string) => void;
  onDelete: (id: string) => void;
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onMarkAsWatched,
  onDelete,
}: NotificationItemProps) {
  const isGroup = 'episodes' in notification;
  const mainEpisode = isGroup ? notification.episodes[0] : notification;

  const airDateStr = isGroup ? notification.latestAirDate : notification.episodeAirDate;
  const airDate = new Date(airDateStr);
  const daysUntilAiring = calculateDaysUntil(airDate);

  const getStatusColor = () => {
    if (notification.read) return "text-muted-foreground border-border"; // Read state style override
    if (!isGroup && notification.isWatched) return "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20";
    return getAirDateColor(airDate);
  };

  const getBadgeVariant = () => {
    if (!isGroup && notification.isWatched) return "outline";
    return "secondary";
  };

  const statusColorClass = getStatusColor();

  const getStatusText = () => {
    if (!isGroup && notification.isWatched) return "Watched";
    if (isGroup) {
      return `${notification.episodeCount} Episodes`;
    }
    return getAirDateStatus(airDate);
  };

  const getSubtitle = () => {
    if (isGroup) {
      const numbers = notification.episodes.map(e => e.episodeNumber).sort((a, b) => a - b);
      const min = numbers[0];
      const max = numbers[numbers.length - 1];
      const range = min === max ? `E${min}` : `E${min}-E${max}`;
      return `Season ${notification.seasonNumber} • ${range}`;
    }
    return `S${notification.seasonNumber} E${notification.episodeNumber}`;
  };

  const getEpisodeTitle = () => {
    if (isGroup) return null;
    return notification.episodeTitle;
  };

  const formattedDate = format(airDate, "MMM d, yyyy");

  const isSolidBg = statusColorClass.includes('bg-') && !statusColorClass.includes('text-');

  const isFullyWatched = isGroup
    ? notification.episodes.every(e => e.isWatched)
    : notification.isWatched;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-md border-l-4",
        !notification.read
          ? isFullyWatched
            ? "border-l-green-500 bg-green-500/5 border-y-green-500/20 border-r-green-500/20"
            : "border-l-primary bg-primary/5 border-y-border border-r-border"
          : "border-l-transparent opacity-85 hover:opacity-100",
      )}
      role="article"
    >
      <div className="flex p-3 sm:p-4 gap-3 sm:gap-4">
        {/* Poster Image */}
        <div className="flex-shrink-0">
          <div className="relative h-20 w-14 sm:h-24 sm:w-16 overflow-hidden rounded-md shadow-sm border border-border/50">
            {notification.tvShowPoster ? (
              <Image
                src={`https://image.tmdb.org/t/p/w200${notification.tvShowPoster}`}
                alt={notification.tvShowTitle}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 56px, 64px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Tv className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
            {isGroup && (
              <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded-tl-sm font-mono">
                x{notification.episodeCount}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-sm sm:text-base truncate pr-28 text-foreground/90 leading-tight flex items-center gap-2">
                {notification.tvShowTitle}
                {!notification.read && isFullyWatched && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-green-500/30 text-green-500 hidden sm:inline-flex">
                    Watched
                  </Badge>
                )}
              </h4>

              <div className="absolute top-2 right-2 flex items-center gap-1">
                {!isFullyWatched && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMarkAsWatched && onMarkAsWatched(notification.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-green-600 transition-colors hover:bg-green-500/10"
                    title={isGroup ? "Mark all as watched" : "Mark episode as watched"}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Mark as watched</span>
                  </Button>
                )}

                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10"
                    title={isGroup ? "Mark all as read" : "Mark as read"}
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Mark as read</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(notification.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10"
                  title="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center flex-wrap gap-2 mt-1">
              <span className="text-foreground/80">{getSubtitle()}</span>
              {getEpisodeTitle() && (
                <>
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-muted-foreground/40" />
                  <span className="truncate italic opacity-90 max-w-[150px] sm:max-w-[200px]">{getEpisodeTitle()}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center justify-between mt-3 gap-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground/80 font-medium">
              <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </div>
              {daysUntilAiring > 0 && daysUntilAiring <= 6 && (
                <div className="hidden sm:flex items-center gap-1.5 text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md">
                  <Clock className="h-3 w-3" />
                  {daysUntilAiring === 1 ? 'Tomorrow' : `In ${daysUntilAiring} days`}
                </div>
              )}
            </div>

            <Badge
              variant={getBadgeVariant()}
              className={cn(
                "ml-auto flex-shrink-0 font-medium border-0",
                isSolidBg ? "text-white" : "",
                statusColorClass
              )}
            >
              {getStatusText()}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
