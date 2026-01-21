import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { staticNotifications, categoryColors } from "@/lib/notifications";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  // Use static notifications for now
  const notifications = staticNotifications;

  useEffect(() => {
    // No-op for now
  }, []);

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
        <div className="flex items-center justify-between px-4 pt-2 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Website Updates & Announcements
          </h2>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-4 pb-4">
          {notifications.map((note) => (
            <div
              key={note.id}
              className="bg-blue-400/30 dark:bg-blue-900/30 rounded-md p-4 hover:bg-blue-400/40 dark:hover:bg-blue-900/40 transition backdrop-blur-sm shadow-sm"
              style={{ boxShadow: "0 4px 24px 0 rgba(30, 64, 175, 0.10)" }}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {note.title}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full text-white ${categoryColors[note.category]}`}
                  style={{ backdropFilter: "blur(2px)" }}
                >
                  {note.category}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">
                {note.description}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-300">
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
