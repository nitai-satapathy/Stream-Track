"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, Settings, Trash2, RefreshCw, BellOff, X, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NotificationItem } from "./NotificationItem";
import { NotificationPreferencesModal } from "./NotificationPreferencesModal";
import { NotificationErrorBoundary } from "./NotificationErrorBoundary";
import { useEpisodeNotifications } from "@/hooks/useEpisodeNotifications";
import { MovieModal } from "@/components/modals/MovieModal";
import type { Movie } from "@/lib/types";

type ListType = "watchlist" | "watching" | "watched";
interface UserLists {
  watchlist: Movie[];
  watching: Movie[];
  watched: Movie[];
}

// Debounce hook for preventing rapid API calls
function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const debouncedCallback = React.useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  ) as T;

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

const formatTime = (date: Date) => {
  return format(date, "h:mm a");
};

interface EpisodeNotificationsPanelProps {
  lists?: UserLists;
  onListUpdate?: (movie: Movie, list: ListType) => Promise<void>;
  updateMovieProgress?: (movie: Movie) => Promise<void>;
}

export function EpisodeNotificationsPanel({
  lists,
  onListUpdate,
  updateMovieProgress
}: EpisodeNotificationsPanelProps = {}) {
  const {
    notifications,
    unreadNotifications,
    stats,
    preferences,
    isLoading,
    lastCheck,
    checkForNewEpisodes,
    markAsRead,
    markAllAsRead,
    markEpisodeWatched,
    deleteNotification,
    clearAll,
    updatePreferences,
  } = useEpisodeNotifications();

  const [preferencesOpen, setPreferencesOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedMovieId, setSelectedMovieId] = React.useState<number | null>(null);

  const isMovieInList = React.useCallback(
    (movieId: number, list: ListType) => {
      if (!lists) return false;
      return lists[list].some((m) => m.id === movieId);
    },
    [lists]
  );

  const userMovie = React.useMemo(() => {
    if (!selectedMovieId || !lists) return undefined;
    return lists.watching.find(m => m.id === selectedMovieId) ||
      lists.watched.find(m => m.id === selectedMovieId) ||
      lists.watchlist.find(m => m.id === selectedMovieId);
  }, [selectedMovieId, lists]);

  // Debounce the refresh function to prevent rapid API calls
  const debouncedCheckForNewEpisodes = useDebounce(checkForNewEpisodes, 1000);

  const filteredNotifications = React.useMemo(() => {
    let baseNotifications;
    switch (filter) {
      case "unread":
        baseNotifications = unreadNotifications;
        break;
      default:
        baseNotifications = notifications;
    }

    return baseNotifications.filter((notification, index, self) =>
      index === self.findIndex(n => n.id === notification.id)
    );
  }, [notifications, unreadNotifications, filter]);

  return (
    <NotificationErrorBoundary>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            aria-label={`Episode notifications ${stats.unread > 0 ? `(${stats.unread} unread)` : ''}`}
          >
            <Bell className="h-4 w-4" />
            {preferences.enabled && stats.unread > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full p-0 text-[10px] flex items-center justify-center border-2 border-background animate-in zoom-in duration-300 bg-red-500 hover:bg-red-600 shadow-sm"
                aria-label={`${stats.unread} unread notifications`}
              >
                {stats.unread > 99 ? "99+" : stats.unread}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md w-[95%] max-h-[85vh] flex flex-col sm:max-w-lg [&>button]:hidden">
          <DialogHeader className="pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <BellRing className="h-5 w-5" />
                Episode Notifications
              </DialogTitle>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => debouncedCheckForNewEpisodes()}
                  disabled={isLoading}
                  className="h-8 w-8 p-0"
                  aria-label="Refresh notifications"
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Notification settings">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setPreferencesOpen(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Preferences
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => clearAll()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete all messages
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                  className="h-8 w-8 p-0"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {!preferences.enabled ? (
            <div className="flex flex-col items-center justify-center py-12 text-center flex-1">
              <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Notifications Disabled</h3>
              <p className="text-sm text-muted-foreground mb-6 px-4">
                Episode notifications are currently disabled. Enable them to see new episodes from your shows.
              </p>
              <Button
                onClick={() => updatePreferences({ enabled: true })}
                className="w-full sm:w-auto"
              >
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            </div>
          ) : (
            <div className="flex flex-col min-h-0 flex-1">
              {/* Filter Tabs & Actions */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-shrink-0 items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  <Button
                    variant={filter === "all" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("all")}
                    className="h-8 px-3 text-xs flex-1 min-w-[60px]"
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === "unread" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("unread")}
                    className="h-8 px-3 text-xs flex-1 min-w-[60px]"
                  >
                    Unread
                  </Button>
                </div>

                {stats.unread > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsRead()}
                    className="h-8 text-xs text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10"
                  >
                    <CheckCheck className="h-4 w-4 mr-1.5" />
                    Mark all read
                  </Button>
                )}
              </div>

              <Separator className="flex-shrink-0 mb-4" />

              {/* Notifications List */}
              <div className="flex-1 min-h-0 overflow-y-auto -mr-4 pr-4 custom-scrollbar">
                {filteredNotifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center px-4 h-full"
                  >
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                      <Bell className="h-10 w-10 text-primary/80" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">All caught up!</h3>
                    <p className="text-sm text-muted-foreground max-w-[200px]">
                      {filter === "unread" ? "You have no unread notifications right now." : "New episode notifications will appear here."}
                    </p>
                    {lastCheck && (
                      <p className="text-xs text-muted-foreground/60 mt-4 font-mono bg-secondary/50 px-2 py-1 rounded-md">
                        Checked: {formatTime(lastCheck)}
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <div className="space-y-3 pb-2">
                    <AnimatePresence initial={false}>
                      {filteredNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 25
                          }}
                        >
                          <NotificationItem
                            notification={notification}
                            onMarkAsRead={markAsRead}
                            onMarkAsWatched={markEpisodeWatched}
                            onDelete={deleteNotification}
                            onClick={() => setSelectedMovieId(notification.tvShowId)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preferences Modal */}
          <NotificationPreferencesModal
            open={preferencesOpen}
            onOpenChange={setPreferencesOpen}
            preferences={preferences}
            onPreferencesChange={updatePreferences}
          />
        </DialogContent>
      </Dialog>

      <MovieModal
        movieId={selectedMovieId}
        mediaType="tv"
        isOpen={selectedMovieId !== null}
        onClose={() => setSelectedMovieId(null)}
        onListUpdate={onListUpdate || (() => {})}
        isMovieInList={isMovieInList}
        userMovie={userMovie}
        updateMovieProgress={updateMovieProgress}
      />
    </NotificationErrorBoundary>
  );
}
