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
  createdAt: { type: Date, default: Date.now },
});

const User = models.User || model("User", UserSchema);

export default User;
