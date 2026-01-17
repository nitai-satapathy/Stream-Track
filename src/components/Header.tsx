"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  Search,
  TvMinimalPlay,
  Popcorn,
  Clapperboard,
  Loader2,
  LogOut,
  Menu,
  ListPlus,
  Sparkles,
  ChevronDown,
  BadgePlus,
  Bell,
  Settings,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import logoUrl from "@/public/icons/logo.svg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { searchMulti } from "@/lib/tmdb";
import type { Movie, MediaType } from "@/lib/types";
import Image from "next/image";
import { MovieModal } from "./MovieModal";
import { NotificationModal } from "./NotificationModal";
import { SettingsModal } from "./SettingsModal";
import { useAuth } from "@/hooks/useAuth";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w200";

type ListType = "watchlist" | "watching" | "watched";
interface UserLists {
  watchlist: Movie[];
  watching: Movie[];
  watched: Movie[];
}

interface HeaderProps {
  lists: UserLists;
  onListUpdate?: (movie: Movie, list: ListType) => Promise<void>;
  onBulkAdd?: (added: {
    movies: Movie[];
    shows: Movie[];
    notFound: string[];
  }) => void;
  setWatchedMovies?: (movies: Movie[]) => void;
  setWatchedShows?: (shows: Movie[]) => void;
  watchedMovies?: Movie[];
  watchedShows?: Movie[];
}

const NavLinks = ({
  isMobile = false,
  user,
}: {
  isMobile?: boolean;
  user: any;
}) => {
  const [isWatchedOpen, setIsWatchedOpen] = React.useState(false);

  return (
    <nav
      className={
        isMobile
          ? "flex flex-col gap-4 text-lg"
          : "hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground"
      }
    >
      <Link
        href="/watching"
        className="hover:text-foreground transition-colors flex items-center gap-2"
      >
        <Popcorn className="h-4 w-4" />
        Currently Watching
      </Link>
      {isMobile ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsWatchedOpen(!isWatchedOpen)}
            className="hover:text-foreground transition-colors flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <CheckCircle className="h-4 w-4" />
            Watched
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isWatchedOpen ? "rotate-180" : ""
                }`}
            />
          </button>
          {isWatchedOpen && (
            <div className="flex flex-col gap-4 pl-6 border-l border-border/50 ml-2 mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
              <Link
                href="/watched-movies"
                className="hover:text-foreground transition-colors flex items-center gap-2 text-base text-muted-foreground"
              >
                <Clapperboard className="h-4 w-4" />
                Watched Movies
              </Link>
              <Link
                href="/watched-tv"
                className="hover:text-foreground transition-colors flex items-center gap-2 text-base text-muted-foreground"
              >
                <TvMinimalPlay className="h-4 w-4" />
                Watched TV Shows
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Dropdown for Watched */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* Use a button for accessibility and to allow focus/active state */}
              <button
                type="button"
                className="hover:text-foreground transition-colors flex items-center gap-2 cursor-pointer focus:outline-none"
                aria-haspopup="menu"
                aria-expanded={undefined}
              >
                <CheckCircle className="h-4 w-4" />
                Watched
                {/* Dropdown icon, rotate when open using data-state attribute */}
                <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href="/watched-movies" className="flex items-center gap-2">
                  <Clapperboard className="h-4 w-4" />
                  Watched Movies
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/watched-tv" className="flex items-center gap-2">
                  <TvMinimalPlay className="h-4 w-4" />
                  Watched TV Shows
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <Link
        href="/watchlist"
        className="hover:text-foreground transition-colors flex items-center gap-2"
      >
        <ListPlus className="h-4 w-4" />
        Watchlist
      </Link>
      <Link
        href="/recommendation"
        className="hover:text-foreground transition-colors flex items-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Recommendations
      </Link>
      {isMobile && !user && (
        <>
          <SheetClose asChild>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Login</Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button asChild className="w-full">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </SheetClose>
        </>
      )}
    </nav>
  );
};

export function Header(props: HeaderProps) {
  const {
    lists,
    onListUpdate,
    setWatchedMovies,
    setWatchedShows,
    watchedMovies,
    watchedShows,
  } = props;
  // Provide a default no-op if onListUpdate is not provided
  const safeOnListUpdate = onListUpdate ?? (async () => { });
  const { user, logout } = useAuth();
  const safeWatchedMovies = watchedMovies || [];
  const safeWatchedShows = watchedShows || [];
  // Bulk Add Dialog State
  const [isBulkDialogOpen, setIsBulkDialogOpen] = React.useState(false);
  const [bulkInput, setBulkInput] = React.useState("");
  const [bulkStatus, setBulkStatus] = React.useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = React.useState(false);
  // Notification Modal State
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<{
    id: number;
    media_type: MediaType;
  } | null>(null);

  const { watchlist, watching, watched } = lists;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsPopoverOpen(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const results = await searchMulti(searchQuery);
        setSearchResults(results.slice(0, 7));
        if (results.length > 0) {
          setIsPopoverOpen(true);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleMovieClick = (id: number, media_type: MediaType) => {
    setSelectedItem({ id, media_type });
    setIsPopoverOpen(false);
    setSearchQuery("");
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const isMovieInList = (movieId: number, list: ListType) => {
    const listMap = {
      watchlist,
      watching,
      watched,
    };
    return listMap[list].some((m) => m.id === movieId);
  };

  const handleLegacySearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsPopoverOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src={logoUrl} alt="Logo" width={44} height={44} className="w-8 h-8 md:w-11 md:h-11" />
              <h1 className="text-2xl font-bold text-foreground">
                Stream Track
              </h1>
            </Link>
          </div>
          {/* Center navigation links */}
          <div className="hidden md:flex flex-1 justify-center">
            <NavLinks user={user} />
          </div>
          <div className="flex items-center gap-4">
            {/* Notification icon */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => setIsNotifOpen(true)}
              className="hidden md:flex"
            >
              <Bell className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            <NotificationModal
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
            />
            {/* Bulk Add BadgePlus icon */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Bulk Add"
              onClick={() => setIsBulkDialogOpen(true)}
              className="hidden md:flex"
            >
              <BadgePlus className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
            {/* Bulk Add Dialog */}
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Add Movies & TV Shows</DialogTitle>
                </DialogHeader>
                <label htmlFor="bulk-names" className="font-medium">
                  Paste multiple names (one per line):
                </label>
                <textarea
                  id="bulk-names"
                  className="w-full rounded border border-blue-400 bg-blue-200/40 backdrop-blur-md p-2 text-base text-slate-900 placeholder:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={4}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Movie or Show 1, Movie or Show 2"
                  disabled={bulkLoading}
                  style={{
                    background: "rgba(59, 130, 246, 0.15)",
                    color: "#ffffffff", // slate-900
                    boxShadow: "0 4px 24px 0 rgba(59,130,246,0.10)",
                    backdropFilter: "blur(8px)",
                  }}
                />
                <Button
                  className="bg-primary text-primary-foreground px-4 py-2 rounded disabled:opacity-50 mt-2"
                  onClick={async () => {
                    setBulkStatus(null);
                    setBulkLoading(true);
                    const titles = bulkInput
                      .split(/\r?\n/)
                      .map((t) => t.trim())
                      .filter(Boolean);
                    if (!titles.length) {
                      setBulkStatus("Please enter at least one name.");
                      setBulkLoading(false);
                      return;
                    }
                    const foundMovies: Movie[] = [];
                    const foundShows: Movie[] = [];
                    const notFound: string[] = [];
                    for (const title of titles) {
                      try {
                        const results = await searchMulti(title);
                        const item = results[0];
                        if (item) {
                          if (
                            item.media_type === "movie" ||
                            (!item.media_type && item.title)
                          ) {
                            if (
                              !safeWatchedMovies.some((m) => m.id === item.id)
                            )
                              foundMovies.push(item);
                          } else if (item.media_type === "tv" || item.name) {
                            if (!safeWatchedShows.some((s) => s.id === item.id))
                              foundShows.push(item);
                          } else {
                            notFound.push(title);
                          }
                        } else {
                          notFound.push(title);
                        }
                      } catch {
                        notFound.push(title);
                      }
                    }
                    // Always update both watched movies and shows in Firestore/localStorage
                    let newMovies = safeWatchedMovies;
                    let newShows = safeWatchedShows;
                    if (foundMovies.length) {
                      newMovies = [...safeWatchedMovies, ...foundMovies];
                      if (setWatchedMovies) setWatchedMovies(newMovies);
                    }
                    if (foundShows.length) {
                      newShows = [...safeWatchedShows, ...foundShows];
                      if (setWatchedShows) setWatchedShows(newShows);
                    }
                    if (user) {
                      // Get current lists from DB, merge, and update
                      const { getLists, updateUserLists } =
                        await import("@/actions/user");
                      const lists = await getLists(user.uid);
                      const watchedMovies = lists.watched.filter(
                        (m: Movie) =>
                          m.media_type === "movie" ||
                          (!m.media_type && m.title),
                      );
                      const watchedShows = lists.watched.filter(
                        (m: Movie) => m.media_type === "tv" || m.name,
                      );
                      const mergedMovies = [
                        ...watchedMovies,
                        ...foundMovies.filter(
                          (fm: Movie) =>
                            !watchedMovies.some((m: Movie) => m.id === fm.id),
                        ),
                      ];
                      const mergedShows = [
                        ...watchedShows,
                        ...foundShows.filter(
                          (fs: Movie) =>
                            !watchedShows.some((s: Movie) => s.id === fs.id),
                        ),
                      ];
                      await updateUserLists(user.uid, {
                        watched: [...mergedMovies, ...mergedShows],
                      });
                    } else {
                      // LocalStorage: merge and update
                      const stored = localStorage.getItem("watched");
                      let watchedList = [];
                      try {
                        watchedList = stored ? JSON.parse(stored) : [];
                      } catch { }
                      const watchedMovies = watchedList.filter(
                        (m: Movie) =>
                          m.media_type === "movie" ||
                          (!m.media_type && m.title),
                      );
                      const watchedShows = watchedList.filter(
                        (m: Movie) => m.media_type === "tv" || m.name,
                      );
                      const mergedMovies = [
                        ...watchedMovies,
                        ...foundMovies.filter(
                          (fm: Movie) =>
                            !watchedMovies.some((m: Movie) => m.id === fm.id),
                        ),
                      ];
                      const mergedShows = [
                        ...watchedShows,
                        ...foundShows.filter(
                          (fs: Movie) =>
                            !watchedShows.some((s: Movie) => s.id === fs.id),
                        ),
                      ];
                      localStorage.setItem(
                        "watched",
                        JSON.stringify([...mergedMovies, ...mergedShows]),
                      );
                    }
                    setBulkStatus(
                      (foundMovies.length
                        ? `Added ${foundMovies.length} movie(s). `
                        : "") +
                      (foundShows.length
                        ? `Added ${foundShows.length} show(s). `
                        : "") +
                      (notFound.length
                        ? `Not found: ${notFound.join(", ")}`
                        : ""),
                    );
                    setBulkLoading(false);
                    setBulkInput("");
                  }}
                  disabled={bulkLoading}
                >
                  {bulkLoading ? "Adding..." : "Add to Watched"}
                </Button>
                {bulkStatus && (
                  <div className="text-sm text-muted-foreground mt-2">
                    {bulkStatus}
                  </div>
                )}
                <DialogClose asChild>
                  <Button variant="outline" className="mt-2 w-full">
                    Close
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Settings"
              onClick={() => setIsSettingsOpen(true)}
              className="hidden md:flex"
            >
              <Settings className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            <SettingsModal
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              lists={lists}
            />
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <div className="relative w-full max-w-xs">
                <PopoverAnchor asChild>
                  <form
                    onSubmit={handleLegacySearchSubmit}
                    className="relative w-full"
                  >
                    <Input
                      type="search"
                      placeholder="Search movies & TV..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => {
                        if (searchQuery.trim()) setIsPopoverOpen(true);
                      }}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </form>
                </PopoverAnchor>
                <PopoverContent
                  className="w-[340px] p-2"
                  align="end"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  {isLoading && (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="animate-spin" />
                    </div>
                  )}
                  {!isLoading && searchResults.length > 0 && (
                    <div className="space-y-2">
                      {searchResults.map((item) => (
                        <div
                          key={item.id + (item.media_type || "")}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                          onClick={() =>
                            handleMovieClick(
                              item.id,
                              item.media_type || "movie",
                            )
                          }
                        >
                          <div className="w-12 h-16 relative shrink-0">
                            <Image
                              src={
                                item.poster_path
                                  ? `${IMAGE_BASE_URL}${item.poster_path}`
                                  : "https://placehold.co/80x120.png"
                              }
                              alt={item.title || item.name || "Poster"}
                              fill
                              className="rounded-sm object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <p className="font-semibold truncate">
                              {item.title || item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.release_date?.substring(0, 4) ||
                                item.first_air_date?.substring(0, 4)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!isLoading &&
                    searchResults.length === 0 &&
                    searchQuery.trim().length > 0 && (
                      <p className="text-center text-sm text-muted-foreground p-4">
                        No results found.
                      </p>
                    )}
                </PopoverContent>
              </div>
            </Popover>
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <Button variant="outline" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                <div className="flex flex-col gap-6 p-4">
                  <SheetClose asChild>
                    <Link href="/" className="flex items-center gap-2">
                      <Image src={logoUrl} alt="Logo" width={34} height={34} />
                      <h1 className="text-2xl font-bold text-foreground">
                        Stream Track
                      </h1>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <NavLinks isMobile={true} user={user} />
                  </SheetClose>
                  <SheetClose asChild>
                    <button
                      className="flex items-center gap-2 text-lg hover:text-foreground transition-colors"
                      onClick={() => setIsBulkDialogOpen(true)}
                    >
                      <BadgePlus className="h-5 w-5" />
                      Bulk Add
                    </button>
                  </SheetClose>
                  <SheetClose asChild>
                    <button
                      className="flex items-center gap-2 text-lg hover:text-foreground transition-colors"
                      onClick={() => setIsSettingsOpen(true)}
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </button>
                  </SheetClose>
                  <SheetClose asChild>
                    <button
                      className="flex items-center gap-2 text-lg hover:text-foreground transition-colors"
                      onClick={() => setIsNotifOpen(true)}
                    >
                      <Bell className="h-5 w-5" />
                      Notifications
                    </button>
                  </SheetClose>
                  {user && (
                    <Button variant="outline" onClick={logout} className="mt-4">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <MovieModal
        movieId={selectedItem?.id ?? null}
        mediaType={selectedItem?.media_type ?? null}
        isOpen={!!selectedItem}
        onClose={handleCloseModal}
        onListUpdate={safeOnListUpdate}
        isMovieInList={isMovieInList}
      />
    </>
  );
}
