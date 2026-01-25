"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
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
  HelpCircle,
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
          <DropdownMenu>
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
            <DropdownMenuContent align="start">
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
  // Profile Modal State
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  // Theme Modal State
  const [isThemeOpen, setIsThemeOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/icons/logo.svg"
                alt="Logo"
                width={44}
                height={44}
                className="h-8 w-8 md:h-11 md:w-11"
              />
              <h1 className="text-2xl font-bold text-foreground">
                Stream Track
              </h1>
            </Link>
          </div>
          {/* Center navigation links */}
          <div className="hidden flex-1 justify-center md:flex">
            <NavLinks user={user} />
          </div>
          <div className="flex items-center gap-4">
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
                      <Image
                        src="/icons/logo.svg"
                        alt="Logo"
                        width={34}
                        height={34}
                      />
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
                      className="flex items-center gap-2 text-lg transition-colors hover:text-foreground"
                      onClick={() => setIsBulkDialogOpen(true)}
                    >
                      <BadgePlus className="h-5 w-5" />
                      Bulk Add
                    </button>
                  </SheetClose>
                  <SheetClose asChild>
                    <button
                      className="flex items-center gap-2 text-lg transition-colors hover:text-foreground"
                      onClick={() => setIsSettingsOpen(true)}
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/about"
                      className="flex items-center gap-2 text-lg transition-colors hover:text-foreground"
                    >
                      <HelpCircle className="h-5 w-5" />
                      About & FAQ
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <button
                      className="flex items-center gap-2 text-lg transition-colors hover:text-foreground"
                      onClick={() => setIsThemeOpen(true)}
                    >
                      <Layers className="h-5 w-5" />
                      Appearance
                    </button>
                  </SheetClose>
                  <SheetClose asChild>
                    <button
                      className="flex items-center gap-2 text-lg transition-colors hover:text-foreground"
                      onClick={() => setIsNotifOpen(true)}
                    >
                      <Layers className="h-5 w-5" />
                      Changelog
                    </button>
                  </SheetClose>
                  {user && (
                    <div className="mt-auto flex flex-col gap-4 border-t pt-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.photoURL || undefined}
                            alt={user.displayName || "User"}
                          />
                          <AvatarFallback>
                            {user.displayName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-medium leading-none">
                            {user.displayName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <SheetClose asChild>
                        <Link
                          href="/profile"
                          className="flex w-full items-center justify-start gap-2 py-1 text-lg transition-colors hover:text-foreground"
                        >
                          <UserCircle className="h-5 w-5" />
                          Profile
                        </Link>
                      </SheetClose>

                      <Button
                        variant="outline"
                        onClick={logout}
                        className="w-full justify-start"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </Button>
                    </div>
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
