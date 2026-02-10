import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { updateUserLists } from "@/actions/user";
import type { Movie } from "@/lib/types";
import { Download, Upload, Trash2 } from "lucide-react";

interface UserLists {
  watchlist: Movie[];
  watching: Movie[];
  watched: Movie[];
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists: UserLists;
}

export function SettingsModal({ isOpen, onClose, lists }: SettingsModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(lists, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `stream-track-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== "string") return;
        const importedLists: UserLists = JSON.parse(text);

        // Basic validation
        if (
          !Array.isArray(importedLists.watchlist) ||
          !Array.isArray(importedLists.watching) ||
          !Array.isArray(importedLists.watched)
        ) {
          setImportStatus("Invalid backup file format.");
          return;
        }

        const merge = (current: Movie[], imported: Movie[]) => {
          const map = new Map();
          imported.forEach(m => map.set(m.id, m));
          current.forEach(m => map.set(m.id, m));
          imported.forEach(m => {
            if (!map.has(m.id)) {
              map.set(m.id, m);
            }
          });
          return Array.from(map.values()) as Movie[];
        };

        const mergedLists = {
          watchlist: merge(lists.watchlist, importedLists.watchlist),
          watching: merge(lists.watching, importedLists.watching),
          watched: merge(lists.watched, importedLists.watched),
        };

        if (user) {
          await updateUserLists(user.uid, mergedLists);
        } else {
          localStorage.setItem(
            "watchlist",
            JSON.stringify(mergedLists.watchlist)
          );
          localStorage.setItem(
            "watching",
            JSON.stringify(mergedLists.watching)
          );
          localStorage.setItem(
            "watched",
            JSON.stringify(mergedLists.watched)
          );
        }
        setImportStatus("Import successful! Reloading...");
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error("Import failed:", error);
        setImportStatus("Failed to process backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL data? This cannot be undone."
      )
    )
      return;

    const emptyLists = { watchlist: [], watching: [], watched: [] };
    if (user) {
      await updateUserLists(user.uid, emptyLists);
    } else {
      localStorage.removeItem("watchlist");
      localStorage.removeItem("watching");
      localStorage.removeItem("watched");
    }
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings & Data</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          {/* Export Section */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium">
              <Download className="h-4 w-4" /> Export Data
            </h4>
            <p className="text-sm text-muted-foreground">
              Download a backup of your Watchlist, Watching, and Watched lists.
            </p>
            <Button onClick={handleExport} variant="outline" className="w-full">
              Export to JSON
            </Button>
          </div>

          <div className="h-px bg-border" />

          {/* Import Section */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium">
              <Upload className="h-4 w-4" /> Import Data
            </h4>
            <p className="text-sm text-muted-foreground">
              Restore your lists from a backup file (JSON).
            </p>
            <div className="grid w-full items-center gap-1.5">
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImport}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            {importStatus && (
              <p
                className={`text-sm ${importStatus.includes("successful") ? "text-green-500" : "text-red-500"}`}
              >
                {importStatus}
              </p>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* Delete All Section */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium text-destructive">
              <Trash2 className="h-4 w-4" /> Danger Zone
            </h4>
            <p className="text-sm text-muted-foreground">
              Permanently remove all your tracked movies and shows.
            </p>
            <Button
              onClick={handleDeleteAll}
              variant="destructive"
              className="w-full"
            >
              Delete All Data
            </Button>
          </div>
        </div>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
