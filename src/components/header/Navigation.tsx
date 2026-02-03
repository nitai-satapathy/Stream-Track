"use client";

import Link from "next/link";
import * as React from "react";
import {
  Popcorn,
  CheckCircle,
  ChevronDown,
  Clapperboard,
  TvMinimalPlay,
  ListPlus,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export const Navigation = () => {
    return (
    <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground md:flex">
      <Link
        href="/watching"
        className="flex items-center gap-2 transition-colors hover:text-foreground"
      >
        <Popcorn className="h-4 w-4" />
        Currently Watching
      </Link>
        <div className="relative">
          {/* Dropdown for Watched */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 transition-colors hover:text-foreground focus:outline-none"
                aria-haspopup="menu"
                aria-expanded={undefined}
              >
                <CheckCircle className="h-4 w-4" />
                Watched
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
    </nav>
  );
};
