import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Movie } from "@/lib/types";

interface BulkAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  watched: Movie[];
  setWatched: (movies: Movie[]) => void;
  user: any;
  isMovie?: boolean; // true for movies, false for tv shows
  onAfterAdd?: () => void;
}

export function BulkAddDialog({ open, onOpenChange, watched, setWatched, user, isMovie = true, onAfterAdd }: BulkAddDialogProps) {
  const [bulkInput, setBulkInput] = React.useState("");
  const [bulkStatus, setBulkStatus] = React.useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = React.useState(false);

  const handleBulkAdd = async () => {
    setBulkStatus(null);
    setBulkLoading(true);
    const titles = bulkInput.split(/\r?\n/).map(t => t.trim()).filter(Boolean);
    if (!titles.length) {
      setBulkStatus("Please enter at least one name.");
      setBulkLoading(false);
      return;
    }
    const found: Movie[] = [];
    const notFound: string[] = [];
    for (const title of titles) {
      try {
        const results = await import("@/lib/tmdb").then(m => m.searchMulti(title));
        const item = (await results)[0];
        if (item && ((isMovie && (item.media_type === "movie" || (!item.media_type && item.title))) || (!isMovie && (item.media_type === "tv" || item.name)))) {
          if (!watched.some(m => m.id === item.id)) {
            found.push(item);
          }
        } else {
          notFound.push(title);
        }
      } catch {
        notFound.push(title);
      }
    }
    if (found.length) {
      const newWatched = [...watched, ...found];
      setWatched(newWatched);
      if (user) {
        await import("@/lib/firestore").then(m => m.updateUserLists(user.uid, { watched: newWatched }));
      } else {
        localStorage.setItem("watched", JSON.stringify(newWatched));
      }
      if (onAfterAdd) onAfterAdd();
    }
    setBulkStatus(
      found.length
        ? `Added ${found.length} ${isMovie ? "movie(s)" : "show(s)"}.${notFound.length ? " Not found: " + notFound.join(", ") : ""}`
        : `No ${isMovie ? "movies" : "shows"} found. Not found: ${notFound.join(", ")}`
    );
    setBulkLoading(false);
    setBulkInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Add {isMovie ? "Movies" : "TV Shows"}</DialogTitle>
        </DialogHeader>
        <label htmlFor="bulk-names" className="font-medium">Paste multiple {isMovie ? "movie" : "show"} names (one per line):</label>
        <textarea
          id="bulk-names"
          className="w-full rounded border p-2 text-base"
          rows={4}
          value={bulkInput}
          onChange={e => setBulkInput(e.target.value)}
          placeholder={isMovie ? "Movie 1, Movie 2, Movie 3" : "Show 1, Show 2, Show 3"}
          disabled={bulkLoading}
        />
        <Button
          className="bg-primary text-primary-foreground px-4 py-2 rounded disabled:opacity-50 mt-2"
          onClick={handleBulkAdd}
          disabled={bulkLoading}
        >
          {bulkLoading ? "Adding..." : `Add to Watched ${isMovie ? "Movies" : "Shows"}`}
        </Button>
        {bulkStatus && <div className="text-sm text-muted-foreground mt-2">{bulkStatus}</div>}
        <DialogClose asChild>
          <Button variant="outline" className="mt-2 w-full">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
