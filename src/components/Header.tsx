"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Search, BadgePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Movie } from "@/lib/types";
import Image from "next/image";
import { NotificationModal } from "./NotificationModal";
import { SettingsModal } from "./SettingsModal";
import { ThemeModal } from "./ThemeModal";
import { ProfileMenu } from "./ProfileMenu";
import { useAuth } from "@/hooks/useAuth";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { Navigation } from "./header/Navigation";
import { MobileMenu } from "./header/MobileMenu";
import { BulkAddModal } from "./header/BulkAddModal";

type ListType = "watchlist" | "watching" | "watched";
interface UserLists {
  watchlist: Movie[];
  watching: Movie[];
  watched: Movie[];
}

interface HeaderProps {
  lists: UserLists;
  onListUpdate?: (movie: Movie, list: ListType) => Promise<void>;
  updateMovieProgress?: (movie: Movie) => Promise<void>;
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

export function Header(props: HeaderProps) {
  const {
    lists,
    onListUpdate,
    updateMovieProgress,
    setWatchedMovies,
    setWatchedShows,
    watchedMovies,
    watchedShows,
  } = props;
  const pathname = usePathname();
  const safeOnListUpdate = onListUpdate ?? (async () => { });
  const { user, logout } = useAuth();

  const [isBulkDialogOpen, setIsBulkDialogOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isThemeOpen, setIsThemeOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  return (
    <>
      <header className="fixed top-4 left-1/2 z-50 w-[95%] max-w-7xl -translate-x-1/2 rounded-full border border-white/10 bg-background/60 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
            >
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
          <div className="hidden flex-1 justify-center md:flex">
            <Navigation />
          </div>
          <div className="flex items-center gap-2 md:gap-4">
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
            <Button
              variant="ghost"
              size="icon"
              aria-label="Bulk Add"
              onClick={() => setIsBulkDialogOpen(true)}
              className="hidden md:flex"
            >
              <BadgePlus className="h-6 w-6 md:h-8 md:w-8" />
            </Button>

            <BulkAddModal
              isOpen={isBulkDialogOpen}
              onOpenChange={setIsBulkDialogOpen}
              watchedMovies={watchedMovies || []}
              watchedShows={watchedShows || []}
              setWatchedMovies={setWatchedMovies}
              setWatchedShows={setWatchedShows}
              user={user}
            />

            <SettingsModal
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              lists={lists}
            />
            <NotificationModal
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
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
              updateMovieProgress={updateMovieProgress}
            />

            <div className="hidden items-center gap-2 sm:flex">
              <ProfileMenu
                user={user}
                logout={logout}
                onSettings={() => setIsSettingsOpen(true)}
                onChangelog={() => setIsNotifOpen(true)}
                onTheme={() => setIsThemeOpen(true)}
              />
            </div>

            <MobileMenu
              user={user}
              logout={logout}
              onBulkAddOpen={() => setIsBulkDialogOpen(true)}
              onSettingsOpen={() => setIsSettingsOpen(true)}
              onThemeOpen={() => setIsThemeOpen(true)}
            />
          </div>
        </div>
      </header>
    </>
  );
}
