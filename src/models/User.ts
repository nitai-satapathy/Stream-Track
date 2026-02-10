import mongoose, { Schema, model, models } from "mongoose";

const MovieSchema = new Schema(
  {
    id: { type: Number, required: true },
    title: String,
    name: String,
    poster_path: String,
    backdrop_path: String,
    overview: String,
    vote_average: Number,
    release_date: String,
    first_air_date: String,
    media_type: String,
    genre_ids: [Number],
    genres: [{ id: Number, name: String }],
    runtime: Number,
    number_of_episodes: Number,
    number_of_seasons: Number,
    episode_run_time: [Number],
    watched_episodes: [
      {
        season_number: Number,
        episode_number: Number,
        _id: false,
      },
    ],

  },
  { _id: false }
);

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: "" },
  watchlist: [MovieSchema],
  watching: [MovieSchema],
  watched: [MovieSchema],
  notifications: [
    new Schema(
      {
        id: { type: String, required: true },
        tvShowId: { type: Number, required: true },
        tvShowTitle: String,
        tvShowPoster: String,
        seasonNumber: Number,
        episodeNumber: Number,
        episodeTitle: String,
        episodeAirDate: String,
        seasonAirDate: String,
        isWatched: Boolean,
        createdAt: { type: Date, default: Date.now },
        read: { type: Boolean, default: false },
      },
      { _id: false }
    ),
  ],
  createdAt: { type: Date, default: Date.now },
  lastEpisodeCheck: { type: Date, default: null },
  notificationPreferences: {
    enabled: { type: Boolean, default: true },
    notifyForWatching: { type: Boolean, default: true },
    notifyForWatchlist: { type: Boolean, default: false },
    notifyForWatched: { type: Boolean, default: true },
    notifyDaysAhead: { type: Number, default: 7 },
    onlyNotifyUnwatched: { type: Boolean, default: false },
  },
});

const User = models.User || model("User", UserSchema);

export default User;
