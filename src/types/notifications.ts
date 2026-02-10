export interface EpisodeNotification {
  id: string;
  tvShowId: number;
  tvShowTitle: string;
  tvShowPoster: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  episodeAirDate: string;
  isWatched: boolean;
  createdAt: string;
  read: boolean;
}

export interface GroupedEpisodeNotification {
  id: string;
  tvShowId: number;
  tvShowTitle: string;
  tvShowPoster: string;
  seasonNumber: number;
  episodeCount: number;
  episodes: EpisodeNotification[];
  latestAirDate: string;
  read: boolean;
}



export interface NotificationPreferences {
  enabled: boolean;
  notifyForWatching: boolean;
  notifyForWatchlist: boolean;
  notifyForWatched: boolean;
  notifyDaysAhead: number;
  onlyNotifyUnwatched: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}
