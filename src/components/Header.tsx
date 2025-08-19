"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Search, Tv, Eye, Check, Loader2, LogOut, Menu } from "lucide-react";
import logoUrl from "@/public/icons/logo.svg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { searchMulti } from "@/lib/tmdb";
import type { Movie } from "@/lib/types";
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
}

export function Header({ lists, onListUpdate }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [selectedMovieId, setSelectedMovieId] = React.useState<number | null>(null);

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
  
  const handleMovieClick = (id: number) => {
    setSelectedMovieId(id);
    setIsPopoverOpen(false);
    setSearchQuery('');
  };

  const handleCloseModal = () => {
    setSelectedMovieId(null);
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
             <div key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer" onClick={() => handleMovieClick(item.id)}>
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
        movieId={selectedMovieId}
        isOpen={!!selectedMovieId}
        onClose={handleCloseModal}
        onListUpdate={onListUpdate}
        isMovieInList={isMovieInList}
      />
    </>
  );
}
