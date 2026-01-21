"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useMemo } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/login?logout=true");
  };

  const user = useMemo(() => {
    return session?.user
      ? {
        uid: (session.user as any).id,
        displayName: session.user.name,
        email: session.user.email,
        photoURL: session.user.image || null,
      }
      : null;
  }, [session]);

  return {
    user,
    loading: status === "loading",
    logout,
  };
}
