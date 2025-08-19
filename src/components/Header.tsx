"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Search, Tv, Eye, Check, Loader2, LogOut, Menu, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import logoUrl from "@/public/icons/logo.svg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { searchMulti } from "@/lib/tmdb";
import type { Movie, MediaType } from "@/lib/types";
import Image from "next/image";
import { MovieModal } from "./MovieModal";
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
  onListUpdate: (movie: Movie, list: ListType) => Promise<void>;
  onBulkAdd?: (added: {movies: Movie[], shows: Movie[], notFound: string[]}) => void;
  setWatchedMovies?: (movies: Movie[]) => void;
  setWatchedShows?: (shows: Movie[]) => void;
  watchedMovies?: Movie[];
  watchedShows?: Movie[];
  user?: any;
}

export function Header(props: HeaderProps) {
  const {
    lists,
    onListUpdate,
    setWatchedMovies,
    setWatchedShows,
    watchedMovies,
    watchedShows,
    user,
  } = props;
  const safeWatchedMovies = watchedMovies || [];
  const safeWatchedShows = watchedShows || [];
  // Bulk Add Dialog State
  const [isBulkDialogOpen, setIsBulkDialogOpen] = React.useState(false);
  const [bulkInput, setBulkInput] = React.useState("");
  const [bulkStatus, setBulkStatus] = React.useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = React.useState(false);
  const router = useRouter();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<{ id: number; media_type: MediaType } | null>(null);

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
    setSearchQuery('');
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
      setSearchQuery('');
    }
  };

  const NavLinks = ({isMobile = false} : {isMobile?: boolean}) => (
    <nav className={isMobile ? "flex flex-col gap-4 text-lg" : "hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground"}>
      <Link href="/watching" className="hover:text-foreground transition-colors flex items-center gap-2">
        <Eye className="h-4 w-4" />
        Currently Watching
      </Link>
      <Link href="/watched-movies" className="hover:text-foreground transition-colors flex items-center gap-2">
        <Check className="h-4 w-4" />
        Watched Movies
      </Link>
      <Link href="/watched-tv" className="hover:text-foreground transition-colors flex items-center gap-2">
        <Tv className="h-4 w-4" />
        Watched TV Shows
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

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
        <Image src={logoUrl} alt="Logo" width={44} height={44} />
        <h1 className="text-2xl font-bold text-foreground">Stream Track</h1>
        </Link>
      </div>
      {/* Center navigation links */}
      <div className="hidden md:flex flex-1 justify-center">
        <NavLinks />
      </div>
      <div className="flex items-center gap-4">
        {/* Bulk Add + icon */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Bulk Add"
          onClick={() => setIsBulkDialogOpen(true)}
          className="border border-blue-500 hover:bg-blue-100/40 transition-colors"
        >
          <Plus className="h-6 w-6 text-blue-600" />
        </Button>
        {/* Bulk Add Dialog */}
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Add Movies & TV Shows</DialogTitle>
            </DialogHeader>
            <label htmlFor="bulk-names" className="font-medium">Paste multiple names (one per line):</label>
            <textarea
              id="bulk-names"
              className="w-full rounded border border-blue-400 bg-blue-200/40 backdrop-blur-md p-2 text-base text-slate-900 placeholder:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={4}
              value={bulkInput}
              onChange={e => setBulkInput(e.target.value)}
              placeholder="Movie or Show 1, Movie or Show 2"
              disabled={bulkLoading}
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#ffffffff', // slate-900
                boxShadow: '0 4px 24px 0 rgba(59,130,246,0.10)',
                backdropFilter: 'blur(8px)'
              }}
            />
            <Button
              className="bg-primary text-primary-foreground px-4 py-2 rounded disabled:opacity-50 mt-2"
              onClick={async () => {
                setBulkStatus(null);
                setBulkLoading(true);
                const titles = bulkInput.split(/\r?\n/).map(t => t.trim()).filter(Boolean);
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
                      if (item.media_type === "movie" || (!item.media_type && item.title)) {
                          if (!safeWatchedMovies.some(m => m.id === item.id)) foundMovies.push(item);
                        } else if (item.media_type === "tv" || item.name) {
                          if (!safeWatchedShows.some(s => s.id === item.id)) foundShows.push(item);
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
                  // Get current lists from Firestore, merge, and update
                  const { getUserLists, updateUserLists } = await import("@/lib/firestore");
                  const lists = await getUserLists(user.uid);
                  const watchedMovies = lists.watched.filter((m: Movie) => m.media_type === 'movie' || (!m.media_type && m.title));
                  const watchedShows = lists.watched.filter((m: Movie) => m.media_type === 'tv' || m.name);
                  const mergedMovies = [...watchedMovies, ...foundMovies.filter((fm: Movie) => !watchedMovies.some((m: Movie) => m.id === fm.id))];
                  const mergedShows = [...watchedShows, ...foundShows.filter((fs: Movie) => !watchedShows.some((s: Movie) => s.id === fs.id))];
                  await updateUserLists(user.uid, { watched: [...mergedMovies, ...mergedShows] });
                } else {
                  // LocalStorage: merge and update
                  const stored = localStorage.getItem("watched");
                  let watchedList = [];
                  try { watchedList = stored ? JSON.parse(stored) : []; } catch {}
                  const watchedMovies = watchedList.filter((m: Movie) => m.media_type === 'movie' || (!m.media_type && m.title));
                  const watchedShows = watchedList.filter((m: Movie) => m.media_type === 'tv' || m.name);
                  const mergedMovies = [...watchedMovies, ...foundMovies.filter((fm: Movie) => !watchedMovies.some((m: Movie) => m.id === fm.id))];
                  const mergedShows = [...watchedShows, ...foundShows.filter((fs: Movie) => !watchedShows.some((s: Movie) => s.id === fs.id))];
                  localStorage.setItem("watched", JSON.stringify([...mergedMovies, ...mergedShows]));
                }
                setBulkStatus(
                  (foundMovies.length ? `Added ${foundMovies.length} movie(s). ` : "") +
                  (foundShows.length ? `Added ${foundShows.length} show(s). ` : "") +
                  (notFound.length ? `Not found: ${notFound.join(", ")}` : "")
                );
                setBulkLoading(false);
                setBulkInput("");
              }}
              disabled={bulkLoading}
            >
              {bulkLoading ? "Adding..." : "Add to Watched"}
            </Button>
            {bulkStatus && <div className="text-sm text-muted-foreground mt-2">{bulkStatus}</div>}
            <DialogClose asChild>
              <Button variant="outline" className="mt-2 w-full">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <form onSubmit={handleLegacySearchSubmit} className="relative w-full max-w-xs">
          <Input
            type="search"
            placeholder="Search movies & TV..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => { if (searchQuery.trim()) setIsPopoverOpen(true); }}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </form>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-2" align="end">
          {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="animate-spin" />
          </div>
          )}
           {!isLoading && searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((item) => (
             <div key={item.id + (item.media_type || '')} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer" onClick={() => handleMovieClick(item.id, item.media_type || 'movie')}>
              <div className="w-12 h-16 relative shrink-0">
                 <Image 
                  src={item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : "https://placehold.co/80x120.png"}
                  alt={item.title || item.name || "Poster"}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-sm"
                 />
              </div>
              <div>
                 <p className="font-semibold truncate">{item.title || item.name}</p>
                 <p className="text-xs text-muted-foreground">{item.release_date?.substring(0,4) || item.first_air_date?.substring(0,4)}</p>
              </div>
             </div>
            ))}
          </div>
          )}
          {!isLoading && searchResults.length === 0 && searchQuery.trim().length > 0 &&(
          <p className="text-center text-sm text-muted-foreground p-4">No results found.</p>
          )}
        </PopoverContent>
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
          <div className="flex flex-col gap-6 p-4">
          <SheetClose asChild>
            <Link href="/" className="flex items-center gap-2">
            <Image src={logoUrl} alt="Logo" width={34} height={34} />
            <h1 className="text-2xl font-bold text-foreground">Stream Track</h1>
            </Link>
          </SheetClose>
           <SheetClose asChild>
            <NavLinks isMobile={true} />
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
        onListUpdate={onListUpdate}
        isMovieInList={isMovieInList}
      />
    </>
  );
}
