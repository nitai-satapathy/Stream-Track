import type { Movie, WatchedEpisode } from "@/lib/types";
import type { EpisodeNotification, GroupedEpisodeNotification, NotificationPreferences } from "@/types/notifications";
import { fetchTVShowDetails, fetchSeasonDetails } from "@/lib/tmdb";
import { syncNotifications } from "@/actions/notificationActions";

export const groupNotifications = (notifications: EpisodeNotification[]): (EpisodeNotification | GroupedEpisodeNotification)[] => {
  if (!notifications.length) return [];

  const sorted = [...notifications].sort((a, b) => {
    if (a.tvShowId !== b.tvShowId) return a.tvShowId - b.tvShowId;
    if (a.seasonNumber !== b.seasonNumber) return a.seasonNumber - b.seasonNumber;
    return a.episodeNumber - b.episodeNumber;
  });

  const grouped: (EpisodeNotification | GroupedEpisodeNotification)[] = [];
  let currentGroup: EpisodeNotification[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = currentGroup.length > 0 ? currentGroup[currentGroup.length - 1] : null;

    const isSameGroup = prev &&
      prev.tvShowId === current.tvShowId &&
      prev.seasonNumber === current.seasonNumber;

    if (currentGroup.length === 0 || isSameGroup) {
      currentGroup.push(current);
    } else {
      if (currentGroup.length > 2) {
        grouped.push(createGroupedNotification(currentGroup));
      } else {
        grouped.push(...currentGroup);
      }
      currentGroup = [current];
    }
  }

  if (currentGroup.length > 2) {
    grouped.push(createGroupedNotification(currentGroup));
  } else {
    grouped.push(...currentGroup);
  }

  return grouped.sort((a, b) => {
    const dateA = new Date('episodes' in a ? a.latestAirDate : a.createdAt).getTime();
    const dateB = new Date('episodes' in b ? b.latestAirDate : b.createdAt).getTime();
    return dateB - dateA;
  });
};

const createGroupedNotification = (episodes: EpisodeNotification[]): GroupedEpisodeNotification => {
  const first = episodes[0];
  const last = episodes[episodes.length - 1];

  const latestAirDate = episodes.reduce((latest, start) => {
    return new Date(start.episodeAirDate) > new Date(latest) ? start.episodeAirDate : latest;
  }, first.episodeAirDate);

  const isAllRead = episodes.every(e => e.read);

  return {
    id: `group_${first.tvShowId}_s${first.seasonNumber}`,
    tvShowId: first.tvShowId,
    tvShowTitle: first.tvShowTitle,
    tvShowPoster: first.tvShowPoster,
    seasonNumber: first.seasonNumber,
    episodeCount: episodes.length,
    episodes: episodes,
    latestAirDate,
    read: isAllRead
  };
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  notifyForWatching: true,
  notifyForWatchlist: false,
  notifyForWatched: true,
  notifyDaysAhead: 7,
  onlyNotifyUnwatched: false,
};

// Storage keys
const LAST_CHECK_KEY = "last_episode_check";

export const getNotificationPreferences = (): NotificationPreferences => {
  return DEFAULT_NOTIFICATION_PREFERENCES;
};

export const saveNotificationPreferences = (preferences: NotificationPreferences): void => {
};

const isEpisodeWatched = (
  seasonNumber: number,
  episodeNumber: number,
  watchedEpisodes: WatchedEpisode[] = []
): boolean => {
  return watchedEpisodes.some(
    episode => episode.season_number === seasonNumber && episode.episode_number === episodeNumber
  );
};

const generateNotificationId = (tvShowId: number, seasonNumber: number, episodeNumber: number): string => {
  return `episode_${tvShowId}_s${seasonNumber}e${episodeNumber}`;
};

export const checkForNewEpisodes = async (
  watchingShows: Movie[],
  watchlistShows: Movie[] = [],
  watchedShows: Movie[] = [],
  lastChecked: Date | null = null,
  customPreferences?: NotificationPreferences
): Promise<EpisodeNotification[]> => {
  const preferences = customPreferences || getNotificationPreferences();
  if (!preferences.enabled) return [];

  const allShows = [
    ...(preferences.notifyForWatching ? watchingShows : []),
    ...(preferences.notifyForWatchlist ? watchlistShows : []),
    ...(preferences.notifyForWatched ? watchedShows : [])
  ];

  const showsToCheck = allShows.filter(show =>
    show.media_type === "tv" ||
    (show.media_type === undefined && show.name && !show.title)
  );

  const uniqueShows = showsToCheck.filter((show, index, self) =>
    index === self.findIndex(s => s.id === show.id)
  );

  const newNotifications: EpisodeNotification[] = [];
  const existingNotificationIds = new Set<string>();
  const now = new Date();
  const maxFutureTime = new Date(now.getTime() + preferences.notifyDaysAhead * 24 * 60 * 60 * 1000);

  const CHUNK_SIZE = 5;
  for (let i = 0; i < uniqueShows.length; i += CHUNK_SIZE) {
    const chunk = uniqueShows.slice(i, i + CHUNK_SIZE);

    await Promise.all(chunk.map(async (show) => {
      if (!show.id) return;

      try {
        const showDetails = await fetchTVShowDetails(show.id);

        if (showDetails.status === "Ended" && showDetails.last_air_date) {
          const lastAir = new Date(showDetails.last_air_date);
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (lastAir < thirtyDaysAgo) return;
        }

        if (!showDetails.seasons) return;

        const seasonsToCheck = showDetails.seasons
          .sort((a: any, b: any) => b.season_number - a.season_number)
          .slice(0, 2);

        for (const season of seasonsToCheck) {
          if (season.season_number <= 0) continue;

          try {
            const seasonDetails = await fetchSeasonDetails(show.id, season.season_number);
            if (!seasonDetails.episodes) continue;

            for (const episode of seasonDetails.episodes) {
              if (!episode.air_date) continue;
              const airDate = new Date(episode.air_date);
              const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

              if (airDate > maxFutureTime) continue;

              let checkThreshold;
              if (lastChecked) {
                checkThreshold = lastChecked;
              } else {
                checkThreshold = new Date(todayStart.getTime() - 3 * 24 * 60 * 60 * 1000);
              }

              if (airDate < checkThreshold) continue;

              const isWatched = isEpisodeWatched(
                season.season_number,
                episode.episode_number,
                show.watched_episodes
              );

              const notificationId = generateNotificationId(
                show.id,
                season.season_number,
                episode.episode_number
              );

              if (existingNotificationIds.has(notificationId)) {
                continue;
              }
              if (preferences.onlyNotifyUnwatched && isWatched) {
                continue;
              }

              const notification: EpisodeNotification = {
                id: notificationId,
                tvShowId: show.id,
                tvShowTitle: show.name || show.title || "Unknown Show",
                tvShowPoster: show.poster_path || "",
                seasonNumber: season.season_number,
                episodeNumber: episode.episode_number,
                episodeTitle: episode.name || `Episode ${episode.episode_number}`,
                episodeAirDate: episode.air_date,
                isWatched,
                createdAt: new Date().toISOString(),
                read: false,
              };

              newNotifications.push(notification);
            }
          } catch (seasonError) {}
        }
      } catch (showError) {}
    }));
  }

  if (newNotifications.length > 0) {
    syncNotifications(newNotifications).catch(err => console.error("Cloud sync failed", err));
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
  }

  return newNotifications;
};