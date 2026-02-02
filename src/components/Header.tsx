"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  Search,
  TvMinimalPlay,
  Popcorn,
  Clapperboard,
  LogOut,
  Menu,
  ListPlus,
  Sparkles,
  ChevronDown,
  BadgePlus,
  Settings,
  CheckCircle,
  UserCircle,
  Layers,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { ProfileModal } from "./ProfileModal";
import { ThemeModal } from "./ThemeModal";

import { ProfileMenu } from "./ProfileMenu";
import { useAuth } from "@/hooks/useAuth";
import { GlobalSearchModal } from "./GlobalSearchModal";

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
          : "hidden items-center gap-4 text-sm font-medium text-muted-foreground md:flex"
      }
    >
      <Link
        href="/watching"
        className="flex items-center gap-2 transition-colors hover:text-foreground"
      >
        <Popcorn className="h-4 w-4" />
        Currently Watching
      </Link>
      {isMobile ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsWatchedOpen(!isWatchedOpen)}
            className="flex cursor-pointer items-center gap-2 transition-colors hover:text-foreground focus:outline-none"
          >
            <CheckCircle className="h-4 w-4" />
            Watched
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isWatchedOpen ? "rotate-180" : ""
                }`}
            />
          </button>
          {isWatchedOpen && (
            <div className="ml-2 mt-2 flex flex-col gap-4 border-l border-border/50 pl-6 duration-200 animate-in fade-in slide-in-from-top-2">
              <Link
                href="/watched-movies"
                className="flex items-center gap-2 text-base text-muted-foreground transition-colors hover:text-foreground"
              >
                <Clapperboard className="h-4 w-4" />
                Watched Movies
              </Link>
              <Link
                href="/watched-tv"
                className="flex items-center gap-2 text-base text-muted-foreground transition-colors hover:text-foreground"
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
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              {/* Use a button for accessibility and to allow focus/active state */}
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 transition-colors hover:text-foreground focus:outline-none"
                aria-haspopup="menu"
                aria-expanded={undefined}
              >
                <CheckCircle className="h-4 w-4" />
                Watched
                {/* Dropdown icon, rotate when open using data-state attribute */}
                <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="mt-2 w-48 rounded-xl border border-white/10 bg-background/70 p-2 shadow-xl backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
              <DropdownMenuItem asChild>
                <Link
                  href="/watched-movies"
                  className="flex items-center gap-2"
                >
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
        className="flex items-center gap-2 transition-colors hover:text-foreground"
      >
        <ListPlus className="h-4 w-4" />
        Watchlist
      </Link>
      <Link
        href="/recommendation"
        className="flex items-center gap-2 transition-colors hover:text-foreground"
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
  const pathname = usePathname();
  const safeOnListUpdate = onListUpdate ?? (async () => { });
  const { user, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const isBackRef = React.useRef(false);

  React.useEffect(() => {
    if (isMobileMenuOpen) {
      window.history.pushState({ mobileMenu: true }, "", window.location.href);

      const handlePopState = () => {
        isBackRef.current = true;
        setIsMobileMenuOpen(false);
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
        if (!isBackRef.current) {
          window.history.back();
        }
        isBackRef.current = false;
      };
    }
  }, [isMobileMenuOpen]);

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
  // Profile Modal State
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  // Theme Modal State
  const [isThemeOpen, setIsThemeOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  return (
    <>
      <header className="fixed top-4 left-1/2 z-50 w-[95%] max-w-7xl -translate-x-1/2 rounded-full border border-white/10 bg-background/60 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
              <Image
                src="/icons/logo.svg"
                alt="Logo"
                width={44}
                height={44}
                className="h-8 w-8 md:h-10 md:w-10"
              />
              <span className="text-lg font-bold tracking-tight md:text-xl">
                Stream Track
              </span>
            </Link>
          </div>
          {/* Center navigation links */}
          <div className="hidden flex-1 justify-center md:flex">
            <NavLinks user={user} />
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {/* Global Search Icon */}

            {/* Global Search Icon (Hidden on Home Page) */}
            {pathname !== "/" && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            )}

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
                <Textarea
                  id="bulk-names"
                  className="min-h-[120px] w-full border-blue-200 bg-blue-50/50 placeholder:text-blue-400 focus-visible:ring-blue-400 dark:border-blue-800 dark:bg-blue-950/20 dark:placeholder:text-blue-500"
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Movie or Show 1&#10;Movie or Show 2"
                  disabled={bulkLoading}
                />
                <Button
                  className="mt-2 rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
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
                          m.media_type === "movie" || (!m.media_type && m.title)
                      );
                      const watchedShows = lists.watched.filter(
                        (m: Movie) => m.media_type === "tv" || m.name
                      );
                      const mergedMovies = [
                        ...watchedMovies,
                        ...foundMovies.filter(
                          (fm: Movie) =>
                            !watchedMovies.some((m: Movie) => m.id === fm.id)
                        ),
                      ];
                      const mergedShows = [
                        ...watchedShows,
                        ...foundShows.filter(
                          (fs: Movie) =>
                            !watchedShows.some((s: Movie) => s.id === fs.id)
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
                          m.media_type === "movie" || (!m.media_type && m.title)
                      );
                      const watchedShows = watchedList.filter(
                        (m: Movie) => m.media_type === "tv" || m.name
                      );
                      const mergedMovies = [
                        ...watchedMovies,
                        ...foundMovies.filter(
                          (fm: Movie) =>
                            !watchedMovies.some((m: Movie) => m.id === fm.id)
                        ),
                      ];
                      const mergedShows = [
                        ...watchedShows,
                        ...foundShows.filter(
                          (fs: Movie) =>
                            !watchedShows.some((s: Movie) => s.id === fs.id)
                        ),
                      ];
                      localStorage.setItem(
                        "watched",
                        JSON.stringify([...mergedMovies, ...mergedShows])
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
                        : "")
                    );
                    setBulkLoading(false);
                    setBulkInput("");
                  }}
                  disabled={bulkLoading}
                >
                  {bulkLoading ? "Adding..." : "Add to Watched"}
                </Button>
                {bulkStatus && (
                  <div className="mt-2 text-sm text-muted-foreground">
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
            <SettingsModal
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              lists={lists}
            />
            <NotificationModal
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
            />
            <ProfileModal
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
            />
            <ThemeModal
              isOpen={isThemeOpen}
              onClose={() => setIsThemeOpen(false)}
            />
            <GlobalSearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              lists={lists}
              onListUpdate={safeOnListUpdate}
            />

            <div className="hidden items-center gap-2 sm:flex">
              <ProfileMenu
                user={user}
                logout={logout}
                onProfile={() => setIsProfileOpen(true)}
                onSettings={() => setIsSettingsOpen(true)}
                onChangelog={() => setIsNotifOpen(true)}
                onTheme={() => setIsThemeOpen(true)}
              />
            </div>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="full" className="flex flex-col items-center border-none bg-background/95 backdrop-blur-xl [&>button]:hidden overflow-y-auto">
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>

                <div className="absolute top-4 right-4 z-50">
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                      <span className="sr-only">Close</span>
                      <X className="h-6 w-6 sm:h-8 sm:w-8" />
                    </Button>
                  </SheetClose>
                </div>

                <div className="flex min-h-full w-full flex-col items-center justify-center gap-6 p-4 py-12 text-center animate-in fade-in zoom-in-50 duration-500 sm:gap-8">
                  <Link href="/" className="flex flex-col items-center gap-3 sm:gap-4">
                    <Image
                      src="/icons/logo.svg"
                      alt="Logo"
                      width={64}
                      height={64}
                      className="h-16 w-16 shadow-[0_0_40px_-5px_var(--primary)] rounded-full sm:h-20 sm:w-20"
                    />
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      Stream Track
                    </h1>
                  </Link>

                  <div className="flex flex-col gap-4 w-full max-w-sm sm:gap-6">
                    <SheetClose asChild>
                      <Link href="/" className="text-xl font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-110 sm:text-2xl">
                        Home
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/watching" className="text-xl font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-110 sm:text-2xl">
                        Watching
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/watched-movies" className="text-xl font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-110 sm:text-2xl">
                        Watched Movies
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/watched-tv" className="text-xl font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-110 sm:text-2xl">
                        Watched TV
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/watchlist" className="text-xl font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-110 sm:text-2xl">
                        Watchlist
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/recommendation" className="text-xl font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-110 sm:text-2xl">
                        For You
                      </Link>
                    </SheetClose>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 mt-4 w-full max-w-xs sm:gap-4 sm:mt-8">
                    <SheetClose asChild>
                      <Button variant="outline" className="h-12 w-[calc(50%-0.5rem)] rounded-2xl flex flex-col gap-1 hover:border-primary/50 sm:h-14 sm:w-[calc(50%-0.5rem)]" onClick={() => setIsBulkDialogOpen(true)}>
                        <BadgePlus className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-[10px] sm:text-xs">Bulk Add</span>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="outline" className="h-12 w-[calc(50%-0.5rem)] rounded-2xl flex flex-col gap-1 hover:border-primary/50 sm:h-14 sm:w-[calc(50%-0.5rem)]" onClick={() => setIsSettingsOpen(true)}>
                        <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-[10px] sm:text-xs">Settings</span>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="outline" className="h-12 w-[calc(50%-0.5rem)] rounded-2xl flex flex-col gap-1 hover:border-primary/50 sm:h-14 sm:w-[calc(50%-0.5rem)]" onClick={() => setIsThemeOpen(true)}>
                        <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-[10px] sm:text-xs">Theme</span>
                      </Button>
                    </SheetClose>
                    {user && (
                      <SheetClose asChild>
                        <Button variant="outline" className="h-12 w-[calc(50%-0.5rem)] rounded-2xl flex flex-col gap-1 hover:border-primary/50 sm:h-14 sm:w-[calc(50%-0.5rem)]" onClick={() => setIsProfileOpen(true)}>
                          <UserCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="text-[10px] sm:text-xs">Profile</span>
                        </Button>
                      </SheetClose>
                    )}
                  </div>

                  {user && (
                    <div className="mt-4 sm:mt-8">
                      <Button
                        variant="ghost"
                        onClick={logout}
                        className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Log Out
                      </Button>
                    </div>
                  )}

                  {!user && (
                    <SheetClose asChild>
                      <Button asChild className="mt-4 rounded-full px-8">
                        <Link href="/login">Log In / Sign Up</Link>
                      </Button>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
