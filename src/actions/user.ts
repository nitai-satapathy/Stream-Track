"use server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import type { Movie } from "@/lib/types";

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  try {
    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImages = [
      "/profile/boy-1.webp",
      "/profile/boy-2.webp",
      "/profile/girl-1.webp",
      "/profile/girl-2.webp",
    ];
    const randomImage =
      profileImages[Math.floor(Math.random() * profileImages.length)];

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      image: randomImage,
      watchlist: [],
      watching: [],
      watched: [],
    });

    return { success: true, userId: user._id.toString() };
  } catch (error: any) {
    console.error("Registration Error:", error);
    return { error: error.message };
  }
}

export async function updateUserLists(
  userId: string,
  lists: { watchlist?: Movie[]; watching?: Movie[]; watched?: Movie[] },
) {
  try {
    await connectDB();
    await User.findByIdAndUpdate(userId, { $set: lists });
    return { success: true };
  } catch (error) {
    console.error("Update Lists Error:", error);
    return { success: false };
  }
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; image?: string },
) {
  try {
    await connectDB();
    await User.findByIdAndUpdate(userId, { $set: data });
    return { success: true };
  } catch (error) {
    console.error("Update Profile Error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function getLists(userId: string) {
  try {
    await connectDB();
    const user = await User.findById(userId).lean();
    if (!user) return { watchlist: [], watching: [], watched: [] };

    // Convert _id to string or remove it if not needed, to be safe for client serialization
    const sanitize = (list: any[]) =>
      list.map((m) => {
        const { _id, ...rest } = m;
        return rest;
      });

    return {
      watchlist: sanitize(user.watchlist || []),
      watching: sanitize(user.watching || []),
      watched: sanitize(user.watched || []),
    };
  } catch (error) {
    console.error("Get Lists Error:", error);
    return { watchlist: [], watching: [], watched: [] };
  }
}
