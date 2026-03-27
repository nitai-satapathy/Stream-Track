import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useListManager } from "@/hooks/useListManager";
import { useToast } from "@/hooks/use-toast";
import { isToday } from "@/lib/dateUtils";
import type { EpisodeNotification, GroupedEpisodeNotification, NotificationPreferences } from "@/types/notifications";
import {
  checkForNewEpisodes,
  getNotificationPreferences,
  saveNotificationPreferences,
  groupNotifications,
} from "@/lib/episodeNotifications";
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
  clearAllNotifications,
  markAllNotificationsRead,
  updateLastEpisodeCheck,
  getNotificationPreferences as getPreferencesFromServer,
  updateNotificationPreferences as updatePreferencesOnServer
} from "@/actions/notificationActions";

export function useEpisodeNotifications() {
  const { user } = useAuth();
  const { watching, watchlist, watched, updateMovieProgress } = useListManager();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<(EpisodeNotification | GroupedEpisodeNotification)[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    getNotificationPreferences()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setNotifications([]);
        setIsHydrated(true);
        return;
      }

      setIsLoading(true);
      try {
        const [notificationsData, preferencesData] = await Promise.all([
          getNotifications(),
          getPreferencesFromServer()
        ]);

        if (notificationsData.success && notificationsData.notifications) {
          setNotifications(groupNotifications(notificationsData.notifications));
          if (notificationsData.lastEpisodeCheck) {
            setLastCheck(new Date(notificationsData.lastEpisodeCheck));
          }
        }

        if (preferencesData.success && preferencesData.preferences) {
          setPreferences(preferencesData.preferences);
          saveNotificationPreferences(preferencesData.preferences); // Sync to local storage
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
        setIsHydrated(true);
      }
    };

    setIsHydrated(false);
    loadData();
  }, [user]);

  const checkForNewEpisodesNow = useCallback(async () => {
    if (!user || !preferences.enabled || !isHydrated) return;

    setIsLoading(true);
    try {
      const newNotifications = await checkForNewEpisodes(watching, watchlist, watched, lastCheck, preferences);

      if (newNotifications.length > 0) {
        const { success, notifications: serverNotifications } = await getNotifications();
        if (success && serverNotifications) {
          setNotifications(groupNotifications(serverNotifications));
        } else {
          setNotifications(prev => {
            const allEpisodes: EpisodeNotification[] = [];
            prev.forEach(n => {
              if ('episodes' in n) {
                allEpisodes.push(...n.episodes);
              } else {
                allEpisodes.push(n);
              }
            });
            allEpisodes.push(...newNotifications);
            return groupNotifications(allEpisodes);
          });
        }

        toast({
          title: "New Episodes Available! 🎬",
          description: `${newNotifications.length} new episode${newNotifications.length > 1 ? 's' : ''} from your shows`,
          duration: 5000,
        });
      }

      await updateLastEpisodeCheck();
      setLastCheck(new Date());

    } catch (error) {
      console.error("Failed to check for new episodes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, watching, watchlist, watched, preferences.enabled, toast, lastCheck, isHydrated]);

  useEffect(() => {
    if (!user || !preferences.enabled || !isHydrated) return;
    const lastCheckDate = lastCheck;
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const shouldCheckNow = !lastCheckDate || lastCheckDate < todayStart;

    let dailyInterval: NodeJS.Timeout | null = null;

    if (shouldCheckNow) {
      checkForNewEpisodesNow();
    }

    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const msUntilTomorrow = tomorrow.getTime() - today.getTime();

    const dailyCheckTimeout = setTimeout(() => {
      checkForNewEpisodesNow();
      dailyInterval = setInterval(() => {
        checkForNewEpisodesNow();
      }, 24 * 60 * 60 * 1000);
    }, msUntilTomorrow);

    return () => {
      clearTimeout(dailyCheckTimeout);
      if (dailyInterval) {
        clearInterval(dailyInterval);
      }
    };
  }, [user, preferences.enabled, checkForNewEpisodesNow, lastCheck, isHydrated]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const isGroup = notificationId.startsWith('group_');

    setNotifications(prev =>
      prev.map(n => {
        if (n.id === notificationId) {
          if ('episodes' in n) {
            return { ...n, read: true, episodes: n.episodes.map(e => ({ ...e, read: true })) };
          }
          return { ...n, read: true };
        }
        return n;
      })
    );

    // Server Action
    if (isGroup) {
      const target = notifications.find(n => n.id === notificationId);
      if (target && 'episodes' in target) {
        await Promise.all(target.episodes.map(e => markNotificationRead(e.id)));
      }
    } else {
      await markNotificationRead(notificationId);
    }
  }, [notifications]);

  const findShow = useCallback((showId: number) => {
    return watching.find(s => s.id === showId) ||
      watchlist.find(s => s.id === showId) ||
      watched.find(s => s.id === showId);
  }, [watching, watchlist, watched]);

  const markAsWatchedLogic = useCallback(async (tvShowId: number, seasonNumber: number, episodeNumber: number) => {
    const show = findShow(tvShowId);
    if (show) {
      const newWatchedEpisode = { season_number: seasonNumber, episode_number: episodeNumber };
      const isAlreadyWatched = show.watched_episodes?.some(
        e => e.season_number === seasonNumber && e.episode_number === episodeNumber
      );
      if (!isAlreadyWatched) {
        const updatedShow = {
          ...show,
          watched_episodes: [...(show.watched_episodes || []), newWatchedEpisode]
        };
        await updateMovieProgress(updatedShow);
      }
    }
  }, [findShow, updateMovieProgress]);

  const markEpisodeWatched = useCallback(async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    // Optimistically update the local state to mark as watched
    setNotifications(prev => prev.map(n => {
      if (n.id === notificationId) {
        if ('episodes' in n) {
          return { ...n, episodes: n.episodes.map(e => ({ ...e, isWatched: true })) };
        }
        return { ...n, isWatched: true };
      }
      return n;
    }));

    if ('episodes' in notification) {
      const episodesByShow = new Map<number, typeof notification.episodes>();

      notification.episodes.forEach(ep => {
        if (!episodesByShow.has(ep.tvShowId)) {
          episodesByShow.set(ep.tvShowId, []);
        }
        episodesByShow.get(ep.tvShowId)?.push(ep);
      });

      for (const [showId, episodes] of Array.from(episodesByShow.entries())) {
        const show = findShow(showId);
        if (!show) continue;

        const newEpisodes = episodes.map(ep => ({
          season_number: ep.seasonNumber,
          episode_number: ep.episodeNumber
        })).filter(newEp => {
          return !show.watched_episodes?.some(
            e => e.season_number === newEp.season_number && e.episode_number === newEp.episode_number
          );
        });

        if (newEpisodes.length > 0) {
          const updatedShow = {
            ...show,
            watched_episodes: [...(show.watched_episodes || []), ...newEpisodes]
          };
          await updateMovieProgress(updatedShow);
        }
      }
    } else {
      await markAsWatchedLogic(notification.tvShowId, notification.seasonNumber, notification.episodeNumber);
    }

    await markAsRead(notificationId);
  }, [notifications, findShow, markAsWatchedLogic, markAsRead, updateMovieProgress]);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => {
      if ('episodes' in n) {
        return { ...n, read: true, episodes: n.episodes.map(e => ({ ...e, read: true })) };
      }
      return { ...n, read: true };
    }));

    await markAllNotificationsRead();
  }, []);

  const deleteNotificationById = useCallback(async (notificationId: string) => {
    const target = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));

    // Server Action
    if (target && 'episodes' in target) {
      await Promise.all(target.episodes.map(e => deleteNotification(e.id)));
    } else {
      await deleteNotification(notificationId);
    }
  }, [notifications]);

  const clearAll = useCallback(async () => {
    setNotifications([]);

    await clearAllNotifications();
  }, []);

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    saveNotificationPreferences(updatedPreferences);

    if (!preferences.enabled && newPreferences.enabled === true) {
      checkForNewEpisodesNow();
    }

    // Server sync
    await updatePreferencesOnServer(updatedPreferences);
  }, [preferences, checkForNewEpisodesNow]);

  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    today: notifications.filter((n) => {
      const date = 'episodes' in n ? n.latestAirDate : n.createdAt;
      return isToday(date);
    }).length,
    thisWeek: notifications.length,
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const todayNotifications = notifications.filter(n => {
    const date = 'episodes' in n ? n.latestAirDate : n.createdAt;
    return isToday(date);
  });

  return {
    notifications,
    unreadNotifications,
    todayNotifications,
    stats,
    preferences,
    isLoading,
    lastCheck,
    checkForNewEpisodes: checkForNewEpisodesNow,
    markAsRead,
    markAllAsRead,
    markEpisodeWatched,
    deleteNotification: deleteNotificationById,
    clearAll,
    updatePreferences,
  };
}
