import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";

import {
  useAccess,
  useIsAdmin,
  useProfile,
  useSession,
  signOutEverywhere,
  type AccessState,
  type Profile,
} from "./useAuthState";

type AuthValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  access: AccessState | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { session, user, ready } = useSession();
  const profileQuery = useProfile(user?.id);
  const accessQuery = useAccess(user?.id);
  const adminQuery = useIsAdmin(user?.id);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user,
      profile: profileQuery.data ?? null,
      access: accessQuery.data ?? null,
      isAdmin: adminQuery.data ?? false,
      isAuthenticated: Boolean(user),
      loading:
        !ready ||
        (Boolean(user) && (profileQuery.isPending || accessQuery.isPending)),
      signOut: () => signOutEverywhere(queryClient),
    }),
    [
      session,
      user,
      ready,
      profileQuery.data,
      profileQuery.isPending,
      accessQuery.data,
      accessQuery.isPending,
      adminQuery.data,
      queryClient,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
