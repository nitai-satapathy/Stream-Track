import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

const categoryColors: Record<string, string> = {
  'Bug Fix': 'bg-red-500',
  'Announcement': 'bg-blue-500',
  'Update': 'bg-yellow-500',
};

interface Notification {
  id: string;
  title: string;
  description: string;
  category: string;
  source: string;
  timestamp: string;
  readBy?: string[];
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // No user needed for global notifications

  // Listen for notifications
  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
    });
    return () => unsubscribe();
  }, []);



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-xl p-0"
        style={{
          backgroundColor: 'hsl(var(--background) / .6)',
          ['--tw-backdrop-blur' as any]: 'blur(8px)',
          backdropFilter: 'var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)',
        }}
      >
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between px-4 pt-2 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Website Updates & Announcements
          </h2>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-4 pb-4">
          {notifications.length === 0 && (
            <div
              className="bg-blue-400/30 dark:bg-blue-900/30 rounded-md p-4 backdrop-blur-sm"
              style={{ boxShadow: "0 4px 24px 0 rgba(30, 64, 175, 0.10)" }}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  Maintenance Notice
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full text-white ${categoryColors['Announcement']}`}
                  style={{ backdropFilter: "blur(2px)" }}
                >
                  Announcement
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                We’re doing some maintenance right now!<br />Login and sign-up are temporarily paused while we improve our servers. Thanks for sticking with us everything will be back soon.
              </p>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-300">
                <span>{new Date().toLocaleString()}</span>
                <div className="flex items-center space-x-1">
                  <span>System</span>
                </div>
              </div>
            </div>
          )}
          {notifications.map((note) => (
            <div
              key={note.id}
              className="bg-blue-400/30 dark:bg-blue-900/30 rounded-md p-4 hover:bg-blue-400/40 dark:hover:bg-blue-900/40 transition backdrop-blur-sm"
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
              <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
              {note.description}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-300">
              <span>
                {note.timestamp && typeof note.timestamp === 'object' && 'seconds' in note.timestamp
                ? new Date((note.timestamp as { seconds: number }).seconds * 1000).toLocaleString()
                : note.timestamp}
              </span>
              <div className="flex items-center space-x-1">
                <span>{note.source}</span>
              </div>
              </div>
            </div>
          ))}
        </div>
        <DialogClose asChild>
          <Button variant="outline" className="mt-2 w-full">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
