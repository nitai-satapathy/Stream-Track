export type NotificationCategory =
  | "Bug Fix"
  | "Announcement"
  | "Update"
  | "Maintenance";

export interface Notification {
  id: string;
  title: string;
  category: NotificationCategory;
  description: string;
  timestamp: string;
  source: string;
}

export const categoryColors: Record<NotificationCategory, string> = {
  "Bug Fix": "bg-red-500",
  Announcement: "bg-blue-500",
  Update: "bg-yellow-500",
  Maintenance: "bg-orange-500",
};

export const staticNotifications: Notification[] = [
  {
    id: "modal-navigation-update",
    title: "Deep Navigation & UI Enhancements",
    category: "Update",
    description:
      "We've supercharged navigation! You can now browse deeply from Movies to Cast to Related content and seamlessly step back with our new History Navigation system. We also polished the 'Known For' section with filters & pagination, optimized mobile layouts for Cast profiles, and did some spring cleaning under the hood.",
    timestamp: "02/02/2026, 00:45:00",
    source: "System",
  },
  {
    id: "profile-wrapped-update",
    title: "Profile Wrapped & Badges",
    category: "Update",
    description:
      "Dive deep into your viewing habits with our new 'Wrapped' style profile! Visualize your taste with Radar charts, track your total watch time, and unlock achievement badges as you watch. We've also improved data accuracy for all users.",
    timestamp: "01/02/2026, 15:30:00",
    source: "System",
  },
  {
    id: "global-search-update",
    title: "Global Search & UI Polish",
    category: "Update",
    description:
      "We’ve refined the home page experience to make getting started faster and more intuitive. We also introduced a cleaner, more robust Theme System for better customization. Finally, enjoy our new powerful Global Search, accessible from any page for streamlined navigation.",
    timestamp: "26/01/2026, 02:27:00",
    source: "System",
  },
  {
    id: "profile-update-1",
    title: "Profile System Overhaul",
    category: "Update",
    description:
      "We've revamped the profile experience! You can now easily edit your user profile and choose avatars. Check it out in your account settings.",
    timestamp: "21/01/2026, 23:19:48",
    source: "System",
  },
  {
    id: "system-update-1",
    title: "System Update",
    category: "Update",
    description:
      "Maintenance is complete! We have successfully upgraded our systems. Login, Signup, and Search are fully operational. Thank you for your patience!",
    timestamp: "15/01/2026, 23:54:05",
    source: "System",
  },
  {
    id: "maintenance-notice",
    title: "Maintenance Notice",
    category: "Announcement",
    description:
      "We’re doing some maintenance right now! Login and sign-up are temporarily paused while we improve our servers. Thanks for sticking with us everything will be back soon.",
    timestamp: "17/11/2025, 22:44:05",
    source: "System",
  },
];
