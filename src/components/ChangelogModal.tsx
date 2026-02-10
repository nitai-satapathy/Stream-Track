import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { staticNotifications, categoryColors } from "@/lib/changelog";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangelogModal({ isOpen, onClose }: NotificationModalProps) {
  const notifications = staticNotifications;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-xl p-0"
        style={{
          backgroundColor: "hsl(var(--background) / .6)",
          ["--tw-backdrop-blur" as any]: "blur(8px)",
          backdropFilter:
            "var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)",
        }}
      >
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Changelog</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between px-4 pb-4 pt-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Website Updates & Announcements
          </h2>
        </div>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-4 pb-4">
          {notifications.map((note) => (
            <div
              key={note.id}
              className="rounded-md bg-blue-400/30 p-4 shadow-sm backdrop-blur-sm transition hover:bg-blue-400/40 dark:bg-blue-900/30 dark:hover:bg-blue-900/40"
              style={{ boxShadow: "0 4px 24px 0 rgba(30, 64, 175, 0.10)" }}
            >
              <div className="mb-1 flex items-center justify-between">
                <h3 className="truncate text-sm font-medium text-gray-800 dark:text-white">
                  {note.title}
                </h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs text-white ${categoryColors[note.category]}`}
                  style={{ backdropFilter: "blur(2px)" }}
                >
                  {note.category}
                </span>
              </div>
              <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">
                {note.description}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                <span>{note.timestamp}</span>
                <div className="flex items-center space-x-1">
                  <span>{note.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <DialogClose asChild>
          <Button variant="outline" className="mt-2 w-full">
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
