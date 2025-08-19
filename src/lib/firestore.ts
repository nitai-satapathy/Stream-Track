import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { Movie } from "./types";
import { User } from "firebase/auth";

interface UserLists {
  watchlist: Movie[];
  watching: Movie[];
  watched: Movie[];
}

// Ensure a user document exists in Firestore
export const ensureUserDocument = async (user: User) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        try {
            await setDoc(userRef, {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                createdAt: new Date(),
                watchlist: [],
                watching: [],
                watched: [],
            });
        } catch (error) {
            console.error("Error creating user document:", error);
        }
    }
};

// Get user's lists from Firestore
export const getUserLists = async (userId: string): Promise<UserLists> => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      watchlist: data.watchlist || [],
      watching: data.watching || [],
      watched: data.watched || [],
    };
  } else {
    // This case should ideally not be hit if ensureUserDocument is called on login/signup
    // But as a fallback, we return empty lists.
    return { watchlist: [], watching: [], watched: [] };
  }
};

// Update user's lists in Firestore
export const updateUserLists = async (userId: string, lists: Partial<UserLists>) => {
  const docRef = doc(db, "users", userId);
  await setDoc(docRef, lists, { merge: true });
};
