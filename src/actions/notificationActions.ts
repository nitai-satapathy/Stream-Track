"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/db";
import type { EpisodeNotification } from "@/types/notifications";

export async function syncNotifications(notifications: EpisodeNotification[]) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return { success: false, error: "Not authenticated" };
        }

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const existingIds = new Set(user.notifications.map((n: any) => n.id));
        const newNotifications = notifications.filter(n => !existingIds.has(n.id));

        if (newNotifications.length > 0) {
            user.notifications.push(...newNotifications);
            await user.save();
        }

        const plainNotifications = user.notifications.map((n: any) => {
            const obj = n.toObject ? n.toObject() : n;
            delete obj._id;
            return obj;
        });

        return {
            success: true,
            notifications: plainNotifications
        };
    } catch (error) {
        console.error("Error syncing notifications:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function getNotifications() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return { success: false, notifications: [] };
        }

        const user = await User.findOne({ email: session.user.email }).lean();

        if (!user) {
            return { success: false, notifications: [] };
        }

        const sortedNotifications = (user.notifications || []).sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
            success: true,
            notifications: sortedNotifications,
            lastEpisodeCheck: user.lastEpisodeCheck
        };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { success: false, notifications: [] };
    }
}

export async function updateLastEpisodeCheck() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) return { success: false };

        await User.updateOne(
            { email: session.user.email },
            { $set: { lastEpisodeCheck: new Date() } }
        );

        return { success: true };
    } catch (error) {
        console.error("Error updating last check:", error);
        return { success: false };
    }
}

export async function markNotificationRead(notificationId: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) return { success: false };

        await User.updateOne(
            { email: session.user.email, "notifications.id": notificationId },
            { $set: { "notifications.$.read": true } }
        );

        return { success: true };
    } catch (error) {
        console.error("Error marking notification read:", error);
        return { success: false };
    }
}

export async function markAllNotificationsRead() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) return { success: false };

        await User.updateOne(
            { email: session.user.email },
            { $set: { "notifications.$[].read": true } }
        );

        return { success: true };
    } catch (error) {
        console.error("Error marking all notifications read:", error);
        return { success: false };
    }
}

export async function deleteNotification(notificationId: string) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) return { success: false };

        await User.updateOne(
            { email: session.user.email },
            { $pull: { notifications: { id: notificationId } } }
        );

        return { success: true };
    } catch (error) {
        console.error("Error deleting notification:", error);
        return { success: false };
    }
}

export async function clearAllNotifications() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) return { success: false };

        await User.updateOne(
            { email: session.user.email },
            { $set: { notifications: [] } }
        );

        return { success: true };
    } catch (error) {
        console.error("Error clearing notifications:", error);
        return { success: false };
    }
}

export async function getNotificationPreferences() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) return { success: false, preferences: null };

        const user = await User.findOne({ email: session.user.email }).lean();

        if (!user) return { success: false, preferences: null };

        return {
            success: true,
            preferences: user.notificationPreferences
        };
    } catch (error) {
        console.error("Error fetching preferences:", error);
        return { success: false, preferences: null };
    }
}

export async function updateNotificationPreferences(preferences: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) return { success: false };

        await User.updateOne(
            { email: session.user.email },
            { $set: { notificationPreferences: preferences } }
        );

        return { success: true };
    } catch (error) {
        console.error("Error updating preferences:", error);
        return { success: false };
    }
}
